// src/hooks/useFindingDetail.ts
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { FindingStatus, FindingSeverity } from "./useFindings";

export type FindingDetail = {
    id: string;
    sheetRowId: string | null;
    title: string | null;
    description: string | null;
    impact: string | null;
    recommendation: string | null;
    mitigation: string | null;
    unitPic: string | null;
    status: FindingStatus;
    severity: FindingSeverity;
    slaHours: number | null;
    source: string | null;
    inspectionDate: string | null;
    shift: string | null;
    startTime: string | null;
    endTime: string | null;
    createdAt: string;
    closedAt: string | null;

    airportName: string | null;
    terminalName: string | null;
    zoneName: string | null;
    locationName: string | null;
};

type UseFindingDetailResult = {
    finding: FindingDetail | null;
    loading: boolean;
    error: string | null;
};

export function useFindingDetail(id: string | undefined): UseFindingDetailResult {
    const [finding, setFinding] = useState<FindingDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // kalau belum ada id (initial render), jangan fetch dulu
        if (!id) {
            setFinding(null);
            setLoading(false);
            return;
        }

        let cancelled = false;

        async function load() {
            try {
                setLoading(true);
                setError(null);

                const supabase = getSupabaseBrowserClient();

                const { data, error } = await supabase
                    .from("findings")
                    .select(
                        [
                            "id",
                            "sheet_row_id",
                            "title",
                            "description",
                            "impact",
                            "recommendation",
                            "mitigation",
                            "unit_pic",
                            "status",
                            "severity",
                            "sla_hours",
                            "source",
                            "inspection_date",
                            "shift",
                            "start_time",
                            "end_time",
                            "created_at",
                            "closed_at",
                            // relasi opsional – hapus kalau belum ada
                            "airports(name)",
                            "terminals(name)",
                            "zones(name)",
                            "locations(name)",
                        ].join(",")
                    )
                    // di sini kita pakai id as string biar TS happy
                    .eq("id", id as string)
                    .maybeSingle();

                if (error) {
                    console.error("useFindingDetail error", error);
                    throw error;
                }

                if (cancelled) return;

                if (!data) {
                    setFinding(null);
                    setError("Data temuan tidak ditemukan.");
                    return;
                }

                // definisikan bentuk row dari Supabase secara eksplisit
                type RawFindingRow = {
                    id: string;
                    sheet_row_id: string | null;
                    title: string | null;
                    description: string | null;
                    impact: string | null;
                    recommendation: string | null;
                    mitigation: string | null;
                    unit_pic: string | null;
                    status: FindingStatus | null;
                    severity: FindingSeverity | null;
                    sla_hours: number | null;
                    source: string | null;
                    inspection_date: string | null;
                    shift: string | null;
                    start_time: string | null;
                    end_time: string | null;
                    created_at: string;
                    closed_at: string | null;
                    airports?: { name: string | null } | null;
                    terminals?: { name: string | null } | null;
                    zones?: { name: string | null } | null;
                    locations?: { name: string | null } | null;
                };

                const row = data as unknown as RawFindingRow;

                const mapped: FindingDetail = {
                    id: row.id,
                    sheetRowId: row.sheet_row_id ?? null,
                    title: row.title ?? null,
                    description: row.description ?? null,
                    impact: row.impact ?? null,
                    recommendation: row.recommendation ?? null,
                    mitigation: row.mitigation ?? null,
                    unitPic: row.unit_pic ?? null,
                    status: (row.status ?? "open") as FindingStatus,
                    severity: (row.severity ?? "low") as FindingSeverity,
                    slaHours: row.sla_hours ?? null,
                    source: row.source ?? null,
                    inspectionDate: row.inspection_date ?? null,
                    shift: row.shift ?? null,
                    startTime: row.start_time ?? null,
                    endTime: row.end_time ?? null,
                    createdAt: row.created_at,
                    closedAt: row.closed_at ?? null,
                    airportName: row.airports?.name ?? null,
                    terminalName: row.terminals?.name ?? null,
                    zoneName: row.zones?.name ?? null,
                    locationName: row.locations?.name ?? null,
                };

                setFinding(mapped);
            } catch (err) {
                if (!cancelled) {
                    console.error(err);
                    setError("Gagal memuat detail temuan. Coba refresh halaman.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        load();

        return () => {
            cancelled = true;
        };
    }, [id]);

    return { finding, loading, error };
}