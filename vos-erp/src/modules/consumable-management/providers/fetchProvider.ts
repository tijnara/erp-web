import { supabase } from "../../../lib/supabase";
// Assuming your Consumable type is imported or defined here
interface Consumable {
  id: number;
  name: string;
  code: string;
  description?: string;
  quantity: number;
}

export const fetchProvider = () => ({
  async listConsumables({ q = "", limit = 20, offset = 0 } = {}) {
    let query = supabase
      .from("consumable_item")
      .select(`*, consumable_category ( category_name )`, { count: "exact" })
      .range(offset, offset + limit - 1);
    if (q) {
      query = query.or(`name.ilike.%${q}%,code.ilike.%${q}%`);
    }
    const { data, error, count } = await query;
    if (error) {
      console.error("Failed to list consumables:", error);
      return { items: [], total: 0 };
    }
    // Flatten category_name
    const items = (data || []).map((item: any) => ({
      ...item,
      category_name: item.consumable_category?.category_name
    }));
    return { items, total: count || 0 };
  },

  async getConsumable(id: number | string) {
    const { data, error } = await supabase
      .from("consumables")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async createConsumable(data: Partial<Consumable>) {
    const { data: newItem, error } = await supabase
      .from("consumables")
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return newItem;
  },

  async updateConsumable(id: number | string, data: Partial<Consumable>) {
    const { data: updatedItem, error } = await supabase
      .from("consumables")
      .update(data)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return updatedItem;
  },

  async deleteConsumable(id: number | string) {
    const { error } = await supabase
      .from("consumables")
      .delete()
      .eq("id", id);
    if (error) throw error;
  }
});
