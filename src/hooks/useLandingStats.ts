"use client";

import useSWR from "swr";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/types/db";

type Tables = Database["public"]["Tables"];
type FindingRow = Tables["findings"]["Row"];

export type LandingStats = {
    todayOpen: number;
    todayInProgress: number;
    todayTotal: number;

    last30Total: number;
    last30Closed: number;
    completionRate30d: number; // 0–100
    avgSlaDays30d: number | null; // dalam hari

    // untuk badge "Open · X temuan baru"
    todayNewOpen: number;
};

async function fetchLandingStats(): Promise<LandingStats> {
    const supabase = getSupabaseBrowserClient();

    const now = new Date();

    // Tanggal hari ini (YYYY-MM-DD) untuk inspection_date
    const todayStr = now.toISOString().slice(0, 10);

    const d30 = new Date();
    d30.setDate(now.getDate() - 30);
    const d30Str = d30.toISOString().slice(0, 10);

    // --- 1. Temuan hari ini ---
    const { data: todayData, error: todayErr } = await supabase
        .from("findings")
        .select("id,status,inspection_date,created_at")
        .gte("inspection_date", todayStr)
        .lte("inspection_date", todayStr);

    if (todayErr) throw todayErr;

    const todayOpen = (todayData || []).filter(
        (f) => f.status === "open"
    ).length;
    const todayInProgress = (todayData || []).filter(
        (f) => f.status === "in_progress"
    ).length;
    const todayTotal = (todayData || []).length;

    // anggap "temuan baru" = status open di hari ini
    const todayNewOpen = todayOpen;

    // --- 2. Data 30 hari terakhir untuk completion & SLA ---
    const { data: last30Data, error: last30Err } = await supabase
        .from("findings")
        .select("id,status,created_at,closed_at")
        .gte("created_at", d30Str);

    if (last30Err) throw last30Err;

    const last30Total = (last30Data || []).length;
    const closedFindings = (last30Data || []).filter(
        (f) => f.status === "closed" && f.closed_at
    ) as (FindingRow & { closed_at: string })[];

    const last30Closed = closedFindings.length;

    const completionRate30d =
        last30Total > 0 ? (last30Closed / last30Total) * 100 : 0;

    // average SLA: selisih closed_at - created_at (dalam hari)
    let avgSlaDays30d: number | null = null;
    if (closedFindings.length > 0) {
        const totalDays = closedFindings.reduce((sum, f) => {
            const created = new Date(f.created_at as string);
            const closed = new Date(f.closed_at as string);
            const diffMs = closed.getTime() - created.getTime();
            const diffDays = diffMs / (1000 * 60 * 60 * 24);
            return sum + diffDays;
        }, 0);

        avgSlaDays30d = totalDays / closedFindings.length;
    }

    return {
        todayOpen,
        todayInProgress,
        todayTotal,
        last30Total,
        last30Closed,
        completionRate30d,
        avgSlaDays30d,
        todayNewOpen,
    };
}

export function useLandingStats() {
    const { data, error, isLoading } = useSWR<LandingStats>(
        "landing-stats",
        fetchLandingStats,
        {
            revalidateOnFocus: false,
            refreshInterval: 60_000, // revalidate tiap 1 menit
        }
    );

    return {
        stats: data,
        loading: isLoading,
        error,
    };
}