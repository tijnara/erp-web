import { supabase } from "./supabase";

export function createSupabaseProvider<T_UI, T_API>(
    tableName: string,
    toUI: (row: any) => T_UI,
    toAPI: (dto: any) => any,
    searchColumns: string[] = []
) {
    return {
        async list({ q = "", limit = 20, offset = 0 } = {}) {
            let query = supabase
                .from(tableName)
                .select("*", { count: "exact" })
                .range(offset, offset + limit - 1);

            if (q && searchColumns.length > 0) {
                const searchStr = searchColumns.map(col => `${col}.ilike.%${q}%`).join(',');
                query = query.or(searchStr);
            }

            const { data, count, error } = await query;
            if (error) {
                console.error(`Failed to list ${tableName}:`, error);
                return { items: [], total: 0 };
            }
            return { items: (data || []).map(toUI), total: count || 0 };
        },

        async get(id: string | number) {
            const { data, error } = await supabase.from(tableName).select("*").eq("id", id).single();
            if (error) throw error;
            return toUI(data);
        },

        async create(dto: Partial<T_API>) {
            const { data, error } = await supabase
                .from(tableName)
                .insert(toAPI(dto))
                .select()
                .single();
            if (error) throw error;
            return toUI(data);
        },

        async update(id: string | number, dto: Partial<T_API>) {
            const { data, error } = await supabase
                .from(tableName)
                .update(toAPI(dto))
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return toUI(data);
        },

        async delete(id: string | number) {
            const { error } = await supabase
                .from(tableName)
                .delete()
                .eq("id", id);
            if (error) throw error;
        }
    };
}

