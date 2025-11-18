import { supabase } from "../../../lib/supabase";
import type { Branch } from "../types";

export function fetchProvider() {
    async function listBranches({ q = "", limit = 20, offset = 0 } = {}) {
        let query = supabase
            .from("branches")
            .select("*", { count: "exact" })
            .range(offset, offset + limit - 1);
        if (q) {
            query = query.or(`branch_name.ilike.%${q}%,branch_code.ilike.%${q}%`);
        }
        const { data, error, count } = await query;
        if (error) {
            console.error("Failed to list branches:", error);
            return { items: [], total: 0 };
        }
        return { items: data || [], total: count || 0 };
    }

    async function getBranch(id: number | string) {
        const { data, error } = await supabase
            .from("branches")
            .select("*")
            .eq("id", id)
            .single();
        if (error) throw error;
        return data;
    }

    async function createBranch(data: Partial<Branch>) {
        const { data: newBranch, error } = await supabase
            .from("branches")
            .insert(data)
            .select()
            .single();
        if (error) throw error;
        return newBranch;
    }

    async function updateBranch(id: number | string, data: Partial<Branch>) {
        const { data: updatedBranch, error } = await supabase
            .from("branches")
            .update(data)
            .eq("id", id)
            .select()
            .single();
        if (error) throw error;
        return updatedBranch;
    }

    async function deleteBranch(id: number | string) {
        const { error } = await supabase
            .from("branches")
            .delete()
            .eq("id", id);
        if (error) throw error;
    }

    return { listBranches, getBranch, createBranch, updateBranch, deleteBranch };
}
