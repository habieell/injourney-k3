// src/hooks/useFilters.ts
"use client";

import { useMemo, useState } from "react";
import {
    findingsFilterSchema,
    type FindingsFilterValues,
    findingStatusValues,
    findingSeverityValues,
} from "@/lib/schemas";

type UseFiltersResult = {
    values: FindingsFilterValues;
    setSearch: (value: string) => void;
    toggleStatus: (status: (typeof findingStatusValues)[number]) => void;
    toggleSeverity: (severity: (typeof findingSeverityValues)[number]) => void;
    clearAll: () => void;
    activeFiltersCount: number;
};

export function useFilters(
    initial?: Partial<FindingsFilterValues>
): UseFiltersResult {
    // isi default dari zod schema
    const parsedDefault = findingsFilterSchema.parse({
        search: "",
        status: [],
        severity: [],
        ...initial,
    });

    const [values, setValues] = useState<FindingsFilterValues>(parsedDefault);

    function setSearch(value: string) {
        setValues((prev) => ({
            ...prev,
            search: value,
        }));
    }

    function toggleStatus(status: (typeof findingStatusValues)[number]) {
        setValues((prev) => {
            const exists = prev.status?.includes(status);
            return {
                ...prev,
                status: exists
                    ? prev.status.filter((s) => s !== status)
                    : [...(prev.status ?? []), status],
            };
        });
    }

    function toggleSeverity(severity: (typeof findingSeverityValues)[number]) {
        setValues((prev) => {
            const exists = prev.severity?.includes(severity);
            return {
                ...prev,
                severity: exists
                    ? prev.severity.filter((s) => s !== severity)
                    : [...(prev.severity ?? []), severity],
            };
        });
    }

    function clearAll() {
        setValues(
            findingsFilterSchema.parse({
                search: "",
                status: [],
                severity: [],
            })
        );
    }

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (values.search && values.search.trim().length > 0) count += 1;
        if (values.status && values.status.length > 0) count += 1;
        if (values.severity && values.severity.length > 0) count += 1;
        return count;
    }, [values]);

    return {
        values,
        setSearch,
        toggleStatus,
        toggleSeverity,
        clearAll,
        activeFiltersCount,
    };
}