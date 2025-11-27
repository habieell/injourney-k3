// src/types/finding-options.ts

export type FindingOption = {
    id: string;
    code: string | null;      // sheet_row_id atau null
    title: string | null;     // judul temuan
    location: string | null;  // nama lokasi dari relasi locations
};