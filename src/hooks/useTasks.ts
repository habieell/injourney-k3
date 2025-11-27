// src/hooks/useTasks.ts
"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { TableRow } from "@/types/db";

// Row dasar dari tabel tasks
export type TaskRow = TableRow<"tasks">;

type UseTasksResult = {
    tasks: TaskRow[] | null;
    loading: boolean;
    error: string | null;
};

export function useTasks(): UseTasksResult {
    const supabase = getSupabaseBrowserClient();

    const [tasks, setTasks] = useState<TaskRow[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function loadTasks() {
            setLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from("tasks")
                .select("*")
                .order("due_at", { ascending: true });

            if (cancelled) return;

            if (error) {
                console.error("Failed load tasks", error);
                setError("Gagal memuat data task. Coba beberapa saat lagi.");
                setTasks(null);
                setLoading(false);
                return;
            }

            setTasks((data ?? []) as TaskRow[]);
            setLoading(false);
        }

        void loadTasks();

        return () => {
            cancelled = true;
        };
    }, [supabase]);

    return { tasks, loading, error };
}