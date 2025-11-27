// src/hooks/useFindingOptions.ts
"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/types/db";

type FindingStatus = Database["public"]["Enums"]["finding_status"];

export type FindingOption = {
    id: string;
    code: string;
    label: string;      // teks lengkap (code – title (status))
    location: string;   // judul / lokasi singkat, buat di UI
};

type UseFindingOptionsResult = {
    options: FindingOption[];
    loading: boolean;
    error: string | null;
};

type RawFindingRow = {
    id: string;
    sheet_row_id: string | null;
    title: string | null;
    status: FindingStatus | null;
};

export function useFindingOptions(): UseFindingOptionsResult {
    const [options, setOptions] = useState<FindingOption[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setLoading(true);
                setError(null);

                const supabase = getSupabaseBrowserClient();

                const { data, error: queryError } = await supabase
                    .from("findings")
                    .select("id, sheet_row_id, title, status")
                    .in("status", ["open", "in_progress"])
                    .order("created_at", { ascending: false });

                if (queryError) {
                    console.error("[useFindingOptions] Supabase error:", queryError);
                    throw queryError;
                }

                if (cancelled) return;

                const rows = (data ?? []) as RawFindingRow[];

                const mapped: FindingOption[] = rows.map((row) => {
                    const code = row.sheet_row_id ?? row.id;
                    const location = row.title ?? "(Tanpa judul)";
                    const status = (row.status ?? "open") as FindingStatus;

                    const statusLabel =
                        status === "open"
                            ? "Open"
                            : status === "in_progress"
                                ? "In Progress"
                                : status;

                    return {
                        id: row.id,
                        code,
                        location,
                        label: `${code} – ${location} (${statusLabel})`,
                    };
                });

                setOptions(mapped);
            } catch (err: unknown) {
                if (!cancelled) {
                    console.error("[useFindingOptions] Unexpected error:", err);
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Gagal memuat daftar temuan. Coba refresh halaman."
                    );
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

    return { options, loading, error };
}