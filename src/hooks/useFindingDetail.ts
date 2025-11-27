// src/hooks/useFindingDetail.ts
"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/types/db";

type FindingRow = Database["public"]["Tables"]["findings"]["Row"];

export type FindingStatus = Database["public"]["Enums"]["finding_status"];
export type FindingSeverity = Database["public"]["Enums"]["severity_level"];

export type FindingDetail = {
    id: string;

    // basic info
    title: string | null;
    description: string | null;
    impact: string | null;
    recommendation: string | null;
    mitigation: string | null;

    // status & severity
    status: FindingStatus;
    severity: FindingSeverity;

    // SLA & PIC
    slaHours: number | null;
    unitPic: string | null;

    // lokasi (join)
    airportName: string | null;
    terminalName: string | null;
    zoneName: string | null;
    locationName: string | null;

    // inspector (optional)
    inspectorName: string | null;

    // waktu & meta
    inspectionDate: string | null; // yyyy-mm-dd
    shift: Database["public"]["Enums"]["shift_type"] | null;
    startTime: string | null;
    endTime: string | null;
    createdAt: string;
    closedAt: string | null;
    source: string | null;
    sheetRowId: string | null;
};

type UseFindingDetailResult = {
    finding: FindingDetail | null;
    loading: boolean;
    error: string | null;
};

type RawFindingWithRelations = FindingRow & {
    airports?: { name: string } | null;
    terminals?: { name: string } | null;
    zones?: { name: string } | null;
    locations?: { name: string } | null;
    profiles?: { full_name: string } | null; // inspector
};

export function useFindingDetail(id: string): UseFindingDetailResult {
    const [finding, setFinding] = useState<FindingDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setFinding(null);
            setLoading(false);
            setError("ID temuan tidak valid.");
            return;
        }

        let cancelled = false;

        async function load() {
            try {
                setLoading(true);
                setError(null);

                const supabase = getSupabaseBrowserClient();

                const { data, error } = await supabase
                    .from("findings")
                    .select(
                        `
              id,
              inspector_id,
              airport_id,
              terminal_id,
              zone_id,
              location_id,
              inspection_date,
              shift,
              start_time,
              end_time,
              title,
              description,
              impact,
              recommendation,
              mitigation,
              unit_pic,
              status,
              severity,
              sla_hours,
              closed_at,
              source,
              sheet_row_id,
              created_at,
              updated_at,
              airports ( name ),
              terminals ( name ),
              zones ( name ),
              locations ( name ),
              profiles:profiles!findings_inspector_id_fkey ( full_name )
            `
                    )
                    .eq("id", id)
                    .maybeSingle();

                if (error) {
                    console.error("[useFindingDetail] Supabase error:", error);
                    throw error;
                }

                if (cancelled) return;

                if (!data) {
                    setFinding(null);
                    setError("Temuan tidak ditemukan.");
                    return;
                }

                const row = data as RawFindingWithRelations;

                const mapped: FindingDetail = {
                    id: row.id,

                    title: row.title ?? null,
                    description: row.description ?? null,
                    impact: row.impact ?? null,
                    recommendation: row.recommendation ?? null,
                    mitigation: row.mitigation ?? null,

                    status: (row.status ?? "open") as FindingStatus,
                    severity: (row.severity ?? "low") as FindingSeverity,

                    slaHours: row.sla_hours ?? null,
                    unitPic: row.unit_pic ?? null,

                    airportName: row.airports?.name ?? null,
                    terminalName: row.terminals?.name ?? null,
                    zoneName: row.zones?.name ?? null,
                    locationName: row.locations?.name ?? null,

                    inspectorName: row.profiles?.full_name ?? null,

                    inspectionDate: row.inspection_date ?? null,
                    shift: row.shift ?? null,
                    startTime: row.start_time ?? null,
                    endTime: row.end_time ?? null,
                    createdAt: row.created_at,
                    closedAt: row.closed_at,
                    source: row.source ?? null,
                    sheetRowId: row.sheet_row_id ?? null,
                };

                setFinding(mapped);
            } catch (err) {
                if (!cancelled) {
                    console.error("[useFindingDetail] Unexpected error:", err);
                    setError("Gagal memuat detail temuan. Coba refresh halaman.");
                    setFinding(null);
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
    }, [id]);

    return { finding, loading, error };
}