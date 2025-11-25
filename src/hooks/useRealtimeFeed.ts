// src/hooks/useRealtimeFeed.ts
"use client";

import { useEffect, useState } from "react";
import type {
    RealtimeChannel,
    RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/types/db";

type FindingDbRow = Database["public"]["Tables"]["findings"]["Row"];

// Kadang kamu mungkin punya kolom tambahan (title/location/description/status/severity)
// di view lain, jadi kita extend saja dengan optional.
type ExtendedFindingRow = FindingDbRow & {
    title?: string | null;
    description?: string | null;
    location?: string | null;
    status?: string | null;
    severity?: string | null;
};

export type RealtimeFeedItem = {
    id: string;
    message: string;
    created_at: string;
    status: string | null;
    severity: string | null;
};

type FindingsPayload = RealtimePostgresChangesPayload<FindingDbRow>;

/**
 * Hook untuk feed realtime (misalnya dipakai di RealtimeTicker).
 * Setiap ada INSERT/UPDATE di tabel `findings`, item baru akan ditambahkan di atas.
 */
export function useRealtimeFeed(limit = 20) {
    const supabase = getSupabaseBrowserClient();
    const [items, setItems] = useState<RealtimeFeedItem[]>([]);

    useEffect(() => {
        const channel: RealtimeChannel = supabase
            .channel("realtime_findings_feed")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "findings" },
                (payload: FindingsPayload) => {
                    // payload.new / old tipenya `FindingDbRow | {}` → kita paksa jadi FindingDbRow
                    const raw = (payload.new ?? payload.old) as FindingDbRow | null;
                    if (!raw) return;

                    // Extend biar bisa akses title/description/location/status/severity
                    const row: ExtendedFindingRow = raw;

                    const item: RealtimeFeedItem = {
                        id: row.id,
                        message:
                            row.title ??
                            row.description ??
                            row.location ??
                            "Temuan K3 terbaru",
                        created_at: row.created_at,
                        status: row.status ?? null,
                        severity: row.severity ?? null,
                    };

                    setItems((prev) => {
                        const next = [item, ...prev];

                        // hapus duplikat berdasarkan id
                        const seen = new Set<string>();
                        const deduped: RealtimeFeedItem[] = [];
                        for (const it of next) {
                            if (seen.has(it.id)) continue;
                            seen.add(it.id);
                            deduped.push(it);
                        }

                        return deduped.slice(0, limit);
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, limit]);

    return { items };
}