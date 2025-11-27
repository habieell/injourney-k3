// src/lib/auth/permission.ts
import type { Database } from "@/types/db";

type Tables = Database["public"]["Tables"];
type Enums = Database["public"]["Enums"];

export type AppRole = Enums["user_role"];
// Enum di Supabase: 'admin' | 'inspector' | 'pic' | 'viewer'

export type ProfileRow = Tables["profiles"]["Row"];

// ================== PERMISSIONS CORE ==================

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
        "finding:update:any",
        "finding:update:assigned",
        "finding:view:assigned",
        "finding:export",
        "insight:view",
    ],
    viewer: ["finding:view:any", "finding:export", "insight:view"],
};

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

// ================== NAVBAR ITEMS ==================

export type NavItem = {
    key: string;
    label: string;
    href: string;
    roles?: AppRole[]; // kalau mau limit per role, optional
};

export function getNavItemsForRole(
    role: AppRole | null | undefined
): NavItem[] {
    if (!role) return [];

    const items: NavItem[] = [];

    // Dashboard – selalu ada buat semua user login
    items.push({
        key: "dashboard",
        label: "Dashboard",
        href: "/",
    });

    // Daftar temuan
    items.push({
        key: "findings",
        label: "Laporkan Temuan",
        href: "/findings",
    });

    // Tugas (untuk inspector + PIC, viewer boleh lihat juga kalau mau)
    items.push({
        key: "tasks",
        label: "Tugas",
        href: "/tasks",
    });

    // Pengaturan (profil / preferensi user)
    items.push({
        key: "settings",
        label: "Pengaturan",
        href: "/settings",
    });

    // Admin panel – hanya role admin
    if (can.accessAdminPanel(role)) {
        items.push({
            key: "admin",
            label: "Admin",
            href: "/admin",
        });
    }

    return items;
}