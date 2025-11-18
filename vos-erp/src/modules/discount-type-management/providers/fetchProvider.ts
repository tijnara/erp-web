import { supabase } from "../../../lib/supabase";
import type { DiscountType } from "../types";

export type ListParams = {
    q?: string;
    limit?: number;
    offset?: number;
};

function toUI(row: any): DiscountType {
  return {
    id: row.id,
    discount_type: row.discount_type,
  };
}

export const fetchProvider = () => ({
  async listDiscountTypes({ q = "", limit = 20, offset = 0 }: ListParams) {
    let query = supabase
      .from("discount_type")
      .select("*", { count: "exact" })
      .range(offset, offset + limit - 1);
    if (q) {
      query = query.ilike("discount_type", `%${q}%`);
    }
    const { data, error, count } = await query;
    if (error) {
      console.error("Failed to list discount types:", error);
      return { items: [], total: 0 };
    }
    return { items: data || [], total: count || 0 };
  },

  async getDiscountType(id: number | string) {
    const { data, error } = await supabase
      .from("discount_type")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async createDiscountType(data: any) {
    const { data: newItem, error } = await supabase
      .from("discount_type")
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return newItem;
  },

  async updateDiscountType(id: number | string, data: any) {
    const { data: updatedItem, error } = await supabase
      .from("discount_type")
      .update(data)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return updatedItem;
  },

  async deleteDiscountType(id: number | string) {
    const { error } = await supabase
      .from("discount_type")
      .delete()
      .eq("id", id);
    if (error) throw error;
  }
});
