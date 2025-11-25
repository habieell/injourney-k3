// src/lib/permissions.ts
import type { Database } from "@/types/db";

type Tables = Database["public"]["Tables"];
type Enums = Database["public"]["Enums"];

export type AppRole = Enums["user_role"];
// Pastikan enum di Supabase: 'admin' | 'inspector' | 'pic' | 'viewer'

export type ProfileRow = Tables["profiles"]["Row"];

// 1) Daftar permission
export type PermissionKey =
    | "finding:create"
    | "finding:update:any"
    | "finding:update:assigned"
    | "finding:view:any"
    | "finding:view:assigned"
    | "finding:export"
    | "admin:panel"
    | "admin:master-data"
    | "admin:users"
    | "insight:view";

// 2) Mapping role → perms
const ROLE_PERMISSIONS: Record<AppRole, PermissionKey[]> = {
    admin: [
        "finding:create",
        "finding:update:any",
        "finding:view:any",
        "finding:export",
        "admin:panel",
        "admin:master-data",
        "admin:users",
        "insight:view",
    ],
    inspector: [
        "finding:create",
        "finding:view:any",
        "finding:export",
        "insight:view",
    ],
    pic: [
        "finding:update:assigned",
        "finding:view:assigned",
        "finding:export",
        "insight:view",
    ],
    viewer: [
        "finding:view:any",
        "finding:export",
        "insight:view",
    ],
};

// 3) Helper umum
export function getRoleFromProfile(profile?: ProfileRow | null): AppRole {
    return (profile?.role as AppRole) ?? "viewer";
}

export function hasPermission(
    role: AppRole | null | undefined,
    permission: PermissionKey
): boolean {
    if (!role) return false;
    const perms = ROLE_PERMISSIONS[role];
    if (!perms) return false;
    return perms.includes(permission);
}

// Helper biar di komponen enak dipakai
export const can = {
    accessAdminPanel: (role: AppRole | null | undefined) =>
        hasPermission(role, "admin:panel"),

    manageMasterData: (role: AppRole | null | undefined) =>
        hasPermission(role, "admin:master-data"),

    manageUsers: (role: AppRole | null | undefined) =>
        hasPermission(role, "admin:users"),

    createFinding: (role: AppRole | null | undefined) =>
        hasPermission(role, "finding:create"),

    updateAnyFinding: (role: AppRole | null | undefined) =>
        hasPermission(role, "finding:update:any"),

    updateAssignedFinding: (role: AppRole | null | undefined) =>
        hasPermission(role, "finding:update:assigned"),

    viewAnyFinding: (role: AppRole | null | undefined) =>
        hasPermission(role, "finding:view:any"),

    viewAssignedFinding: (role: AppRole | null | undefined) =>
        hasPermission(role, "finding:view:assigned"),

    exportFinding: (role: AppRole | null | undefined) =>
        hasPermission(role, "finding:export"),

    viewInsight: (role: AppRole | null | undefined) =>
        hasPermission(role, "insight:view"),
};