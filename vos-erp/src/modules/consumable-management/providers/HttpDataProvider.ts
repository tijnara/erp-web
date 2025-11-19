// src/modules/consumables-management/providers/HttpDataProvider.ts
import { supabase } from "../../../lib/supabase";
import { Consumable, ConsumableCategory } from "../types";
import { ConsumablesDataAdapter } from "../adapter";

export class HttpDataProvider implements ConsumablesDataAdapter {
    async listConsumables({ q = "", limit = 20, offset = 0 } = {}): Promise<{ items: Consumable[]; total: number }> {
        let query = supabase
            .from("consumable_item")
            .select("*", { count: "exact" })
            .range(offset, offset + limit - 1)
            .order('date_added', { ascending: false });

        if (q) {
            // Search by item name or code
            query = query.or(`item_name.ilike.%${q}%,item_code.ilike.%${q}%`);
        }

        const { data, error, count } = await query;

        if (error) {
            console.error("List Consumables Error:", error);
            // Return empty to avoid crashing the UI
            return { items: [], total: 0 };
        }

        return {
            items: data as Consumable[],
            total: count || 0
        };
    }

    async createConsumable(data: Partial<Consumable>): Promise<Consumable> {
        const { data: newItem, error } = await supabase
            .from("consumable_item")
            .insert(data)
            .select()
            .single();
        if (error) throw error;
        return newItem as Consumable;
    }

    async updateConsumable(id: number, data: Partial<Consumable>): Promise<Consumable> {
        const { data: updated, error } = await supabase
            .from("consumable_item")
            .update(data)
            .eq("item_id", id) // Ensure this matches your DB primary key (item_id or id)
            .select()
            .single();
        if (error) throw error;
        return updated as Consumable;
    }

    async deleteConsumable(id: number): Promise<void> {
        const { error } = await supabase
            .from("consumable_item")
            .delete()
            .eq("item_id", id);
        if (error) throw error;
    }

    async listCategories(): Promise<ConsumableCategory[]> {
        const { data, error } = await supabase
            .from("consumable_category")
            .select("*");
        if (error) {
            console.warn("Categories fetch error (table might be missing):", error.message);
            return [];
        }
        return data as ConsumableCategory[];
    }

    async createCategory(data: { category_name: string; category_description: string }) {
        const { data: newCat, error } = await supabase
            .from("consumable_category")
            .insert(data)
            .select()
            .single();
        if (error) throw error;
        return newCat;
    }
}
