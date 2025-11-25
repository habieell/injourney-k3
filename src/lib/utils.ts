// src/lib/utils.ts
import type { PostgrestError } from "@supabase/supabase-js";

export function cn(
    ...classes: Array<string | null | undefined | false>
) {
    return classes.filter(Boolean).join(" ");
}

/**
 * Utility buat format error Supabase jadi string singkat.
 */
export function formatSupabaseError(
    error: PostgrestError | null
): string | null {
    if (!error) return null;
    if (error.details) {
        return `${error.message} – ${error.details}`;
    }
    return error.message;
}

/**
 * Helper kecil buat delay (misal buat simulasi loading).
 */
export function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}