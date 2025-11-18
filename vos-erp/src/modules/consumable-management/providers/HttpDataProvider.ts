// src/modules/consumables-management/providers/HttpDataProvider.ts
import { supabase } from "../../../lib/supabase";
import { Consumable, ConsumableCategory } from "../types";
import { ConsumablesDataAdapter } from "../adapter";

export class HttpDataProvider implements ConsumablesDataAdapter {
    async listConsumables(): Promise<Consumable[]> {
        const { data, error } = await supabase
            .from("consumable_item")
            .select("*");
        if (error) throw error;
        return data || [];
    }

    async createConsumable(data: Partial<Consumable>): Promise<Consumable> {
        const { data: newItem, error } = await supabase
            .from("consumable_item")
            .insert(data)
            .select()
            .single();
        if (error) throw error;
        return newItem;
    }

    async deleteConsumable(id: number): Promise<void> {
        const { error } = await supabase
            .from("consumable_item")
            .delete()
            .eq("id", id);
        if (error) throw error;
    }

    async listCategories(): Promise<ConsumableCategory[]> {
        const { data, error } = await supabase
            .from("consumable_category")
            .select("*");
        if (error) throw error;
        return data || [];
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

    async updateConsumable(id: number, data: any) {
        const { data: updated, error } = await supabase
            .from("consumable_item")
            .update(data)
            .eq("id", id)
            .select()
            .single();
        if (error) throw error;
        return updated;
    }
}
