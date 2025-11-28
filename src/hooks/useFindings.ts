// src/hooks/useFindings.ts
"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/types/db";

export type FindingStatus = "open" | "in_progress" | "closed";
export type FindingSeverity = "low" | "medium" | "high" | "critical";

export type FindingListItem = {
    id: string;
    code: string;              // sheet_row_id atau fallback id
    location: string;          // nama lokasi (join) atau fallback title
    unit: string | null;       // unit_pic
    category: string | null;   // untuk future use (chip kuning), sekarang boleh null
    status: FindingStatus;
    severity: FindingSeverity;
    createdAt: string;         // created_at
};

type UseFindingsResult = {
    findings: FindingListItem[];
    loading: boolean;
    error: string | null;
};

// Raw row + relasi lokasi (supabase result)
type RawFindingRow = Database["public"]["Tables"]["findings"]["Row"] & {
    locations?: {
        name: string;
    } | null;
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
                console.log('supabase', supabase);

                const { data, error } = await supabase
                    .from("findings")
                    .select(
                        `
              id,
              sheet_row_id,
              title,
              unit_pic,
              status,
              severity,
              created_at,
              locations ( name )
            `
                    )
                    .order("created_at", { ascending: false });

                if (error) {
                    console.error("[useFindings] error", error);
                    throw error;
                }

                if (cancelled) return;

                const rows = (data ?? []) as RawFindingRow[];

                const mapped: FindingListItem[] = rows.map((row) => {
                    const code = row.sheet_row_id ?? row.id;
                    const locationName =
                        row.locations?.name ??
                        row.title ??
                        "-";

                    return {
                        id: row.id,
                        code,
                        location: locationName,
                        unit: row.unit_pic ?? null,
                        // kalau nanti mau pakai kategori (misal jenis hazard),
                        // tinggal isi di sini. Sekarang biarin null.
                        category: null,
                        status: (row.status ?? "open") as FindingStatus,
                        severity: (row.severity ?? "low") as FindingSeverity,
                        createdAt: row.created_at,
                    };
                });

                setFindings(mapped);
            } catch (err) {
                if (!cancelled) {
                    console.error("[useFindings] unexpected error", err);
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