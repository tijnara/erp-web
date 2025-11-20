import { supabase } from "@/lib/supabase";

export function fetchProvider() {
    async function fetchReplicated(page: number) {
        const limit = 20;
        const offset = (page - 1) * limit;

        const { data, error, count } = await supabase
            .from("replicated")
            .select("*", { count: "exact" })
            .range(offset, offset + limit - 1);

        if (error) {
            throw new Error("Failed to fetch replicated data: " + error.message);
        }

        return {
            data: data || [],
            total: count || 0,
        };
    }

    async function registerReplicated(data: any) {
        const { error } = await supabase
            .from("replicated")
            .insert(data);

        if (error) {
            throw new Error("Failed to register replicated data: " + error.message);
        }
    }

    return { fetchReplicated, registerReplicated };
}
