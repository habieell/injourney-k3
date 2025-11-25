// src/lib/constants.ts
export const TABLES = {
    findings: "findings",
    findingsTimeline: "findings_timeline",
    tasks: "tasks",

    // tabel lain yang kamu pakai:
    profiles: "profiles",
    locations: "locations",
    terminals: "terminals",
    zones: "zones",
    findingPhotos: "finding_photos",
} as const;

export const REALTIME_CHANNELS = {
    findings: "realtime_findings",
} as const;

export const FINDING_STATUS = {
    OPEN: "open",
    IN_PROGRESS: "in_progress",
    CLOSED: "closed",
} as const;

export const FINDING_SEVERITY = {
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High",
    CRITICAL: "Critical",
} as const;

export type FindingStatus =
    (typeof FINDING_STATUS)[keyof typeof FINDING_STATUS];

export type FindingSeverity =
    (typeof FINDING_SEVERITY)[keyof typeof FINDING_SEVERITY];