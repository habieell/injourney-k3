// src/lib/supabase/client.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/db";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export type TypedSupabaseClient = SupabaseClient<Database>;

let browserClient: TypedSupabaseClient | null = null;

export function getSupabaseBrowserClient(): TypedSupabaseClient {
    if (!browserClient) {
        browserClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
            auth: {
                persistSession: true,

                detectSessionInUrl: false,
            },
        });
    }
    return browserClient;
}

export const TABLES = {
    findings: "findings",
    findingsTimeline: "findings_timeline",
    tasks: "tasks",
} as const;

export const REALTIME_CHANNELS = {
    findings: "realtime_findings",
} as const;

export const FINDING_STATUS = {
    OPEN: "open",
    IN_PROGRESS: "in_progress",
    CLOSED: "closed",
} as const;

export const FINDING_SEVERITY = {
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High",
    CRITICAL: "Critical",
} as const;

export type FindingStatus = (typeof FINDING_STATUS)[keyof typeof FINDING_STATUS];
export type FindingSeverity =
    (typeof FINDING_SEVERITY)[keyof typeof FINDING_SEVERITY];