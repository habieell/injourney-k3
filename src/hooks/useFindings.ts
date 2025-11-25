// src/hooks/useFindings.ts
"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type FindingStatus = "open" | "in_progress" | "closed";
export type FindingSeverity = "low" | "medium" | "high" | "critical";

export type FindingListItem = {
    id: string;
    code: string;
    location: string;
    unit: string | null;
    category: string | null;
    status: FindingStatus;
    severity: FindingSeverity;
    createdAt: string;
};

type UseFindingsResult = {
    findings: FindingListItem[];
    loading: boolean;
    error: string | null;
};

export function useFindings(): UseFindingsResult {
    const [findings, setFindings] = useState<FindingListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setLoading(true);
                setError(null);

                const supabase = getSupabaseBrowserClient();

                const { data, error } = await supabase
                    .from("findings")
                    .select(
                        "id, sheet_row_id, title, unit_pic, status, severity, created_at"
                    )
                    .order("created_at", { ascending: false });

                if (error) {
                    console.error("useFindings error", error);
                    throw error;
                }

                if (cancelled) return;

                type RawFindingRow = {
                    id: string;
                    sheet_row_id: string | null;
                    title: string | null;
                    unit_pic: string | null;
                    status: FindingStatus | null;
                    severity: FindingSeverity | null;
                    created_at: string;
                };

                const rows = (data ?? []) as RawFindingRow[];

                const mapped: FindingListItem[] = rows.map((row) => ({
                    id: row.id,

                    code: row.sheet_row_id ?? row.id,
                    location: row.title ?? "-",
                    unit: row.unit_pic ?? null,

                    category: null,
                    status: (row.status ?? "open") as FindingStatus,
                    severity: (row.severity ?? "low") as FindingSeverity,
                    createdAt: row.created_at,
                }));

                setFindings(mapped);

            } catch (err) {
                if (!cancelled) {
                    console.error(err);
                    setError("Gagal memuat data temuan. Coba refresh halaman.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void load();

        return () => {
            cancelled = true;
        };
    }, []);

    return { findings, loading, error };
}