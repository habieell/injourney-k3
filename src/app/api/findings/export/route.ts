// src/app/api/findings/export/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/db";

type Db = Database["public"];
type FindingRow = Db["Tables"]["findings"]["Row"];
type FindingStatus = NonNullable<FindingRow["status"]>;
type FindingSeverity = NonNullable<FindingRow["severity"]>;
type ProfileRow = Db["Tables"]["profiles"]["Row"];

// Kolom yang dipakai di export (hanya yang memang ada di findings.Row)
type ExportFindingRow = Pick<
    FindingRow,
    | "id"
    | "title"
    | "description"
    | "impact"
    | "recommendation"
    | "mitigation"
    | "unit_pic"
    | "source"
    | "severity"
    | "status"
    | "inspection_date"
    | "shift"
    | "start_time"
    | "end_time"
    | "created_at"
    | "closed_at"
>;

const isStatus = (value: string | null): value is FindingStatus =>
    value === "open" || value === "in_progress" || value === "closed";

const isSeverity = (value: string | null): value is FindingSeverity =>
    value === "low" ||
    value === "medium" ||
    value === "high" ||
    value === "critical";

// helper biar .toLowerCase() aman
const safeLower = (val: string | null | undefined): string =>
    (val ?? "").toLowerCase();

export async function GET(req: Request) {
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // 1) cek session
    const {
        data: { session },
        error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
        console.error("[/api/findings/export] Session error:", sessionError);
        return NextResponse.json(
            { message: "Gagal memeriksa sesi pengguna." },
            { status: 500 }
        );
    }

    if (!session) {
        return NextResponse.json(
            { message: "Unauthorized. Silakan login terlebih dahulu." },
            { status: 401 }
        );
    }

    // 2) cek role user dari profiles
    const {
        data: profile,
        error: profileError,
    } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single<Pick<ProfileRow, "role">>();

    if (profileError) {
        console.error("[/api/findings/export] Profile error:", profileError);
        return NextResponse.json(
            { message: "Gagal memeriksa hak akses pengguna." },
            { status: 500 }
        );
    }

    const role = profile?.role ?? "viewer";

    // hanya admin & inspector yang boleh export
    if (role !== "admin" && role !== "inspector") {
        return NextResponse.json(
            {
                message:
                    "Forbidden. Anda tidak memiliki akses untuk export temuan.",
            },
            { status: 403 }
        );
    }

    // 3) ambil query param
    const url = new URL(req.url);
    const statusParam = url.searchParams.get("status"); // "open" | "in_progress" | "closed" | "all" | null
    const q = url.searchParams.get("q")?.trim().toLowerCase() ?? "";

    const severityParam = url.searchParams.get("severity");
    const dateFrom = url.searchParams.get("dateFrom");
    const dateTo = url.searchParams.get("dateTo");

    // 4) build query ke Supabase
    let query = supabase
        .from("findings")
        .select<
            // batasi tipe result ke ExportFindingRow
            "id, title, description, impact, recommendation, mitigation, unit_pic, source, severity, status, inspection_date, shift, start_time, end_time, created_at, closed_at"
        >();

    if (statusParam && statusParam !== "all" && isStatus(statusParam)) {
        query = query.eq("status", statusParam);
    }

    if (severityParam && isSeverity(severityParam)) {
        query = query.eq("severity", severityParam);
    }

    if (dateFrom) {
        query = query.gte("created_at", `${dateFrom}T00:00:00.000Z`);
    }
    if (dateTo) {
        query = query.lte("created_at", `${dateTo}T23:59:59.999Z`);
    }

    const { data, error } = await query
        // kasih tahu TS bentuk datanya
        .returns<ExportFindingRow[]>()
        .order("created_at", { ascending: false });

    if (error) {
        console.error("[/api/findings/export] Supabase error:", error);
        return NextResponse.json(
            { message: "Gagal mengambil data temuan", details: error.message },
            { status: 500 }
        );
    }

    // 5) filter by keyword q
    const filtered = (data ?? []).filter((item) => {
        if (!q) return true;

        // "Kode" kita generate dari id (kalau nanti sudah ada kolom code di DB, tinggal ganti)
        const code = safeLower(item.id);
        const desc = safeLower(item.description);
        const title = safeLower(item.title);
        const unit = safeLower(item.unit_pic);
        const sourceVal = safeLower(item.source);

        return (
            code.includes(q) ||
            desc.includes(q) ||
            title.includes(q) ||
            unit.includes(q) ||
            sourceVal.includes(q)
        );
    });

    // 6) build CSV
    const header = [
        "ID",
        "Kode",
        "Judul",
        "Deskripsi",
        "Severity",
        "Status",
        "Tanggal Inspeksi",
        "Shift",
        "Jam Mulai",
        "Jam Selesai",
        "Unit PIC",
        "Sumber Temuan",
        "Dampak",
        "Rekomendasi",
        "Mitigasi",
        "Dibuat Pada",
        "Ditutup Pada",
    ];

    const rows = filtered.map((item) => {
        // sama: "kode" dibuat dari id (sementara)
        const kode = item.id;

        return [
            item.id,
            kode,
            item.title ?? "",
            item.description ?? "",
            item.severity ?? "",
            item.status ?? "",
            item.inspection_date ?? "",
            item.shift ?? "",
            item.start_time ?? "",
            item.end_time ?? "",
            item.unit_pic ?? "",
            item.source ?? "",
            item.impact ?? "",
            item.recommendation ?? "",
            item.mitigation ?? "",
            item.created_at ?? "",
            item.closed_at ?? "",
        ];
    });

    const escapeCell = (val: unknown): string => {
        if (val === null || val === undefined) return "";
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
    };

    const csvContent =
        header.map(escapeCell).join(",") +
        "\n" +
        rows.map((row) => row.map(escapeCell).join(",")).join("\n");

    const fileName = `laporan-temuan-k3-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

    return new NextResponse(csvContent, {
        status: 200,
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="${fileName}"`,
        },
    });
}