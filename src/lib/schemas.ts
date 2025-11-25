// src/lib/schemas.ts
import { z } from "zod";

export const findingStatusValues = ["open", "in_progress", "closed"] as const;
export type FindingStatus = (typeof findingStatusValues)[number];

export const findingSeverityValues = [
    "Low",
    "Medium",
    "High",
    "Critical",
] as const;
export type FindingSeverity = (typeof findingSeverityValues)[number];

export const findingFormSchema = z.object({
    location: z.string().min(3, "Lokasi wajib diisi"),
    category: z.string().min(1, "Kategori wajib diisi"),
    description: z
        .string()
        .min(5, "Deskripsi minimal 5 karakter")
        .max(1000)
        .optional(),
    unit: z.string().min(1, "Unit wajib diisi"),
    severity: z
        .enum(findingSeverityValues)
        .default("Medium" satisfies FindingSeverity),
    status: z
        .enum(findingStatusValues)
        .default("open" satisfies FindingStatus),
});

export type FindingFormValues = z.infer<typeof findingFormSchema>;

export const findingsFilterSchema = z.object({
    search: z.string().optional().default(""),
    status: z.array(z.enum(findingStatusValues)).optional().default([]),
    severity: z.array(z.enum(findingSeverityValues)).optional().default([]),
});

export type FindingsFilterValues = z.infer<typeof findingsFilterSchema>;