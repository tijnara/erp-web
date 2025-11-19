import type { Database } from "../../types/supabase";

export type Branch = Database["public"]["Tables"]["branches"]["Row"];

export type UpsertBranchDTO = Partial<Omit<Branch, "id">> & { branch_name: string };
