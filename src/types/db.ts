// src/types/db.ts

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export type Database = {
    public: {
        Tables: {
            airports: {
                Row: {
                    id: string;
                    code: string;
                    name: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    code: string;
                    name: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    code?: string;
                    name?: string;
                    created_at?: string;
                };
                Relationships: [];
            };

            terminals: {
                Row: {
                    id: string;
                    airport_id: string;
                    code: string;
                    name: string;
                    sort_order: number | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    airport_id: string;
                    code: string;
                    name: string;
                    sort_order?: number | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    airport_id?: string;
                    code?: string;
                    name?: string;
                    sort_order?: number | null;
                    created_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "terminals_airport_id_fkey";
                        columns: ["airport_id"];
                        referencedRelation: "airports";
                        referencedColumns: ["id"];
                    }
                ];
            };

            zones: {
                Row: {
                    id: string;
                    terminal_id: string;
                    name: string;
                    code: string;
                    area: Database["public"]["Enums"]["area_type"];
                    description: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    terminal_id: string;
                    name: string;
                    code: string;
                    area: Database["public"]["Enums"]["area_type"];
                    description?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    terminal_id?: string;
                    name?: string;
                    code?: string;
                    area?: Database["public"]["Enums"]["area_type"];
                    description?: string | null;
                    created_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "zones_terminal_id_fkey";
                        columns: ["terminal_id"];
                        referencedRelation: "terminals";
                        referencedColumns: ["id"];
                    }
                ];
            };

            locations: {
                Row: {
                    id: string;
                    zone_id: string;
                    name: string;
                    code: string;
                    description: string | null;
                    is_active: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    zone_id: string;
                    name: string;
                    code: string;
                    description?: string | null;
                    is_active?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    zone_id?: string;
                    name?: string;
                    code?: string;
                    description?: string | null;
                    is_active?: boolean;
                    created_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "locations_zone_id_fkey";
                        columns: ["zone_id"];
                        referencedRelation: "zones";
                        referencedColumns: ["id"];
                    }
                ];
            };

            profiles: {
                Row: {
                    id: string;
                    full_name: string;
                    employee_id: string | null;
                    role: Database["public"]["Enums"]["user_role"];
                    phone: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string; // sama dengan auth.users.id
                    full_name: string;
                    employee_id?: string | null;
                    role?: Database["public"]["Enums"]["user_role"];
                    phone?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    full_name?: string;
                    employee_id?: string | null;
                    role?: Database["public"]["Enums"]["user_role"];
                    phone?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "profiles_id_fkey";
                        columns: ["id"];
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    }
                ];
            };

            findings: {
                Row: {
                    id: string;
                    inspector_id: string;
                    airport_id: string;
                    terminal_id: string;
                    zone_id: string;
                    location_id: string;
                    location_text: string | null;
                    inspection_date: string; // date
                    shift: Database["public"]["Enums"]["shift_type"];
                    start_time: string | null; // time
                    end_time: string | null; // time
                    title: string;
                    description: string | null;
                    impact: string | null;
                    recommendation: string | null;
                    mitigation: string | null;
                    unit_pic: string | null;
                    status: Database["public"]["Enums"]["finding_status"];
                    severity: Database["public"]["Enums"]["severity_level"];
                    sla_hours: number | null;
                    closed_at: string | null; // timestamptz
                    source: string | null;
                    sheet_row_id: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    inspector_id: string;
                    airport_id: string;
                    terminal_id: string;
                    zone_id: string;
                    location_id?: string | null;
                    location_text?: string | null;
                    inspection_date: string;
                    shift: Database["public"]["Enums"]["shift_type"];
                    start_time?: string | null;
                    end_time?: string | null;
                    title: string;
                    description?: string | null;
                    impact?: string | null;
                    recommendation?: string | null;
                    mitigation?: string | null;
                    unit_pic?: string | null;
                    status?: Database["public"]["Enums"]["finding_status"];
                    severity: Database["public"]["Enums"]["severity_level"];
                    sla_hours?: number | null;
                    closed_at?: string | null;
                    source?: string | null;
                    sheet_row_id?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    inspector_id?: string;
                    airport_id?: string;
                    terminal_id?: string;
                    zone_id?: string;
                    location_id?: string | null;
                    location_text?: string | null;
                    inspection_date?: string;
                    shift?: Database["public"]["Enums"]["shift_type"];
                    start_time?: string | null;
                    end_time?: string | null;
                    title?: string;
                    description?: string | null;
                    impact?: string | null;
                    recommendation?: string | null;
                    mitigation?: string | null;
                    unit_pic?: string | null;
                    status?: Database["public"]["Enums"]["finding_status"];
                    severity?: Database["public"]["Enums"]["severity_level"];
                    sla_hours?: number | null;
                    closed_at?: string | null;
                    source?: string | null;
                    sheet_row_id?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "findings_inspector_id_fkey";
                        columns: ["inspector_id"];
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "findings_airport_id_fkey";
                        columns: ["airport_id"];
                        referencedRelation: "airports";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "findings_terminal_id_fkey";
                        columns: ["terminal_id"];
                        referencedRelation: "terminals";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "findings_zone_id_fkey";
                        columns: ["zone_id"];
                        referencedRelation: "zones";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "findings_location_id_fkey";
                        columns: ["location_id"];
                        referencedRelation: "locations";
                        referencedColumns: ["id"];
                    }
                ];
            };

            finding_photos: {
                Row: {
                    id: string;
                    finding_id: string;
                    storage_path: string;
                    caption: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    finding_id: string;
                    storage_path: string;
                    caption?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    finding_id?: string;
                    storage_path?: string;
                    caption?: string | null;
                    created_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "finding_photos_finding_id_fkey";
                        columns: ["finding_id"];
                        referencedRelation: "findings";
                        referencedColumns: ["id"];
                    }
                ];
            };

            // ======= TASKS =======
            tasks: {
                Row: {
                    id: string;
                    code: string | null;
                    title: string;
                    description: string | null;
                    finding_id: string | null;
                    finding_code: string | null;
                    location_id: string | null;
                    area_text: string | null;
                    owner_unit: string | null;
                    owner_profile_id: string | null;
                    due_at: string | null; // timestamptz
                    status: Database["public"]["Enums"]["task_status"];
                    priority: Database["public"]["Enums"]["task_priority"];
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    code?: string | null;
                    title: string;
                    description?: string | null;
                    finding_id?: string | null;
                    finding_code?: string | null;
                    location_id?: string | null;
                    area_text?: string | null;
                    owner_unit?: string | null;
                    owner_profile_id?: string | null;
                    due_at?: string | null;
                    status?: Database["public"]["Enums"]["task_status"];
                    priority?: Database["public"]["Enums"]["task_priority"];
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    code?: string | null;
                    title?: string;
                    description?: string | null;
                    finding_id?: string | null;
                    finding_code?: string | null;
                    location_id?: string | null;
                    area_text?: string | null;
                    owner_unit?: string | null;
                    owner_profile_id?: string | null;
                    due_at?: string | null;
                    status?: Database["public"]["Enums"]["task_status"];
                    priority?: Database["public"]["Enums"]["task_priority"];
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "tasks_finding_id_fkey";
                        columns: ["finding_id"];
                        referencedRelation: "findings";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "tasks_location_id_fkey";
                        columns: ["location_id"];
                        referencedRelation: "locations";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "tasks_owner_profile_id_fkey";
                        columns: ["owner_profile_id"];
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    }
                ];
            };
        };

        Views: {
            [_ in never]: never;
        };

        Functions: {
            [_ in never]: never;
        };

        Enums: {
            area_type: "landside" | "airside" | "apron" | "garbarata";
            finding_status: "open" | "in_progress" | "closed";
            severity_level: "low" | "medium" | "high" | "critical";
            shift_type: "pagi" | "siang" | "malam";
            user_role: "admin" | "inspector" | "viewer" | "pic";
            task_status: "open" | "in_progress" | "done";
            task_priority: "low" | "medium" | "high";
        };

        CompositeTypes: {
            [_ in never]: never;
        };
    };
};

// Helper generic types
export type PublicSchema = Database["public"];

export type Tables<
    TName extends keyof PublicSchema["Tables"] & string
> = PublicSchema["Tables"][TName];

export type TableRow<
    TName extends keyof PublicSchema["Tables"] & string
> = PublicSchema["Tables"][TName]["Row"];

export type TableInsert<
    TName extends keyof PublicSchema["Tables"] & string
> = PublicSchema["Tables"][TName]["Insert"];

export type TableUpdate<
    TName extends keyof PublicSchema["Tables"] & string
> = PublicSchema["Tables"][TName]["Update"];