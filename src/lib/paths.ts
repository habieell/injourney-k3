// src/lib/paths.ts

export const ROUTES = {
    root: "/",
    signIn: "/sign-in",

    // main app
    home: "/findings",
    findings: "/findings",
    report: "/report",
    tasks: "/tasks",
    settings: "/settings",
} as const;

// Halaman auth (tidak boleh diakses kalau sudah login)
export const AUTH_ROUTES: string[] = [ROUTES.signIn];

// Halaman publik (boleh diakses tanpa login)
export const PUBLIC_ROUTES: string[] = [ROUTES.root, ROUTES.signIn];

// Prefix route yang butuh login
export const PROTECTED_PREFIXES: string[] = [
    ROUTES.findings,
    ROUTES.report,
    ROUTES.tasks,
    ROUTES.settings,
];

// Redirect default setelah login sukses
export const DEFAULT_LOGIN_REDIRECT = ROUTES.findings;