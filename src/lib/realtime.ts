// src/lib/realtime.ts
import type {
    RealtimeChannel,
    RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";
import type { Database } from "@/types/db";
import type { TypedSupabaseClient } from "./supabase/client";

type FindingsTable = Database["public"]["Tables"]["findings"];
export type FindingRow = FindingsTable["Row"];

export type FindingsRealtimeHandlers = {
    onInsert?: (row: FindingRow) => void;
    onUpdate?: (row: FindingRow) => void;
    onDelete?: (row: FindingRow) => void;
};

type FindingsPayload = RealtimePostgresChangesPayload<FindingRow>;

export function subscribeToFindings(
    client: TypedSupabaseClient,
    handlers: FindingsRealtimeHandlers
): RealtimeChannel {
    const channel = client
        .channel("realtime_findings")
        .on(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "findings",
            },
            (payload: FindingsPayload) => {
                const row = (payload.new ?? payload.old) as FindingRow;

                if (payload.eventType === "INSERT") {
                    handlers.onInsert?.(row);
                } else if (payload.eventType === "UPDATE") {
                    handlers.onUpdate?.(row);
                } else if (payload.eventType === "DELETE") {
                    handlers.onDelete?.(row);
                }
            }
        )
        .subscribe();

    return channel;
}