// src/lib/supabase/client.ts
"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/db";

export type TypedSupabaseClient = SupabaseClient<Database>;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let browserClient: TypedSupabaseClient | null = null;

export function getSupabaseBrowserClient(): TypedSupabaseClient {
    if (!browserClient) {
        browserClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
            auth: {
                flowType: "pkce",
                autoRefreshToken: true,
                persistSession: true,
            },
        });
    }

    return browserClient;
}