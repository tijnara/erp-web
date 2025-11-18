import type { DataProvider, ListParams } from "./DataProvider";
import { supabase } from "../../../lib/supabase";

export const fetchProvider = (): DataProvider => ({
    async listChartOfAccounts({ q = "", limit = 20, offset = 0 }: ListParams = {}) {
        let query = supabase
            .from("chart_of_accounts")
            .select("*", { count: "exact" })
            .range(offset, offset + limit - 1);
        if (q) {
            query = query.or(`account_title.ilike.%${q}%,gl_code.ilike.%${q}%`);
        }
        const { data, error, count } = await query;
        if (error) {
            console.error("Failed to list chart of accounts:", error);
            return { items: [], total: 0 };
        }
        return { items: data || [], total: count || 0 };
    },

    async getChartOfAccount(id: number | string) {
        const { data, error } = await supabase
            .from("chart_of_accounts")
            .select("*")
            .eq("id", id)
            .single();
        if (error) throw error;
        return data;
    },

    async createChartOfAccount(data: any) {
        const { data: newItem, error } = await supabase
            .from("chart_of_accounts")
            .insert(data)
            .select()
            .single();
        if (error) throw error;
        return newItem;
    },

    async updateChartOfAccount(id: number | string, data: any) {
        const { data: updatedItem, error } = await supabase
            .from("chart_of_accounts")
            .update(data)
            .eq("id", id)
            .select()
            .single();
        if (error) throw error;
        return updatedItem;
    },

    async deleteChartOfAccount(id: number | string) {
        const { error } = await supabase
            .from("chart_of_accounts")
            .delete()
            .eq("id", id);
        if (error) throw error;
    },
});
