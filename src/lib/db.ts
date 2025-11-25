// src/lib/db.ts
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/db";
import { getSupabaseBrowserClient } from "./supabase/client";

export type TypedClient = SupabaseClient<Database>;

type PublicSchema = Database["public"];
export type PublicTables = PublicSchema["Tables"];
export type TableName = keyof PublicTables & string;

export type TableRow<TName extends TableName> = PublicTables[TName]["Row"];
export type TableInsert<TName extends TableName> = PublicTables[TName]["Insert"];
export type TableUpdate<TName extends TableName> = PublicTables[TName]["Update"];

function getClient(client?: TypedClient): TypedClient {
    return client ?? getSupabaseBrowserClient();
}

/**
 * Generic: get banyak row dari satu tabel.
 */
export async function getRows<TName extends TableName>(options: {
    table: TName;
    client?: TypedClient;
    limit?: number;
    orderBy?: keyof TableRow<TName>;
    ascending?: boolean;
}): Promise<TableRow<TName>[]> {
    const { table, client, limit, orderBy, ascending = true } = options;
    const supabase = getClient(client);

    let query = supabase.from(table).select("*");

    if (orderBy) {
        query = query.order(orderBy as string, { ascending });
    }

    if (typeof limit === "number") {
        query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Supabase getRows error", { table, error });
        throw error;
    }

    return (data ?? []) as unknown as TableRow<TName>[];
}

/**
 * Generic: get satu row by id.
 */
export async function getRowById<TName extends TableName>(options: {
    table: TName;
    id: string;
    client?: TypedClient;
}): Promise<TableRow<TName> | null> {
    const { table, id, client } = options;
    const supabase = getClient(client);

    const { data, error } = await supabase
        .from(table)
        .select("*")
        // cast "id" & value ke any biar generic-nya fleksibel
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .eq("id" as any, id as any)
        .maybeSingle();

    if (error) {
        console.error("Supabase getRowById error", { table, id, error });
        throw error;
    }

    return (data as unknown as TableRow<TName>) ?? null;
}

/**
 * Generic: insert satu row.
 */
export async function insertRow<TName extends TableName>(options: {
    table: TName;
    payload: TableInsert<TName>;
    client?: TypedClient;
}): Promise<TableRow<TName>> {
    const { table, payload, client } = options;
    const supabase = getClient(client);

    const { data, error } = await supabase
        .from(table)
        // biarin Supabase nerima payload apa adanya
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert(payload as any)
        .select()
        .single();

    if (error) {
        console.error("Supabase insertRow error", { table, error });
        throw error;
    }

    return data as unknown as TableRow<TName>;
}

/**
 * Generic: update satu row by id.
 */
export async function updateRowById<TName extends TableName>(options: {
    table: TName;
    id: string;
    payload: TableUpdate<TName>;
    client?: TypedClient;
}): Promise<TableRow<TName>> {
    const { table, id, payload, client } = options;
    const supabase = getClient(client);

    const { data, error } = await supabase
        .from(table)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update(payload as any)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .eq("id" as any, id as any)
        .select()
        .single();

    if (error) {
        console.error("Supabase updateRowById error", { table, id, error });
        throw error;
    }

    return data as unknown as TableRow<TName>;
}

/**
 * Generic: delete satu row by id.
 */
export async function deleteRowById<TName extends TableName>(options: {
    table: TName;
    id: string;
    client?: TypedClient;
}): Promise<void> {
    const { table, id, client } = options;
    const supabase = getClient(client);

    const { error } = await supabase
        .from(table)
        .delete()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .eq("id" as any, id as any);

    if (error) {
        console.error("Supabase deleteRowById error", { table, id, error });
        throw error;
    }
}