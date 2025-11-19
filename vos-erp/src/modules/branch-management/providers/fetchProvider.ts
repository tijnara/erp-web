import { createSupabaseProvider } from "../../../lib/createSupabaseProvider";
import type { Branch, UpsertBranchDTO } from "../types";
import type { Database } from "../../../types/supabase";

type BranchRow = Database["public"]["Tables"]["branches"]["Row"];

// Mapper from the database row to the UI-facing type.
// In this case, they are very similar, but this provides a layer for transformation.
const toUI = (row: BranchRow): Branch => ({
    ...row,
    branch_name: row.branch_name ?? "", // Ensure branch_name is not null
});

// Mapper from the UI-facing DTO to the database-insertable type.
const toAPI = (dto: Partial<UpsertBranchDTO>): Partial<BranchRow> => {
    // The DTO can be directly used for insertion/update in this case.
    return dto;
};

export const fetchProvider = () => createSupabaseProvider<Branch, UpsertBranchDTO>(
    "branches",
    toUI,
    toAPI,
    ["branch_name", "branch_code"] // Columns to search in the list function
);

