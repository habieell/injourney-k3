// src/lib/supabase-server.ts
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/db";

export type TypedServerClient = SupabaseClient<Database>;

// NOTE: sekarang async karena cookies() → Promise
export async function getSupabaseServerClient(): Promise<TypedServerClient> {
    const cookieStore = await cookies();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error(
            "Supabase env (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY) belum di-set"
        );
    }

    const client = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
        cookies: {
            get(name: string) {
                return cookieStore.get(name)?.value;
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            set(name: string, value: string, options: CookieOptions) {
                // no-op
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            remove(name: string, options: CookieOptions) {
                // no-op
            },

        },
    });

    return client;
}

import type { PostgrestError } from "@supabase/supabase-js";

export function formatSupabaseError(
    error: PostgrestError | null
): string | null {
    if (!error) return null;
    if (error.details) {
        return `${error.message} – ${error.details}`;
    }
    return error.message;
}

export function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}