import { supabase } from "../../../lib/supabase";
import type { LineDiscount } from "../types";

export type ListParams = {
    q?: string;
    limit?: number;
    offset?: number;
};

function toUI(row: any): LineDiscount {
  return {
    id: row.id,
    line_discount: row.line_discount,
    percentage: row.percentage,
  };
}

export const fetchProvider = () => ({
  async listLineDiscounts({ q = "", limit = 20, offset = 0 } = {}) {
    let query = supabase
      .from("line_discount")
      .select("*", { count: "exact" })
      .range(offset, offset + limit - 1);
    if (q) {
      query = query.ilike("line_discount", `%${q}%`);
    }
    const { data, error, count } = await query;
    if (error) {
      console.error("Failed to list line discounts:", error);
      return { items: [], total: 0 };
    }
    return { items: data || [], total: count || 0 };
  },

  async getLineDiscount(id: number | string) {
    const { data, error } = await supabase
      .from("line_discount")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async createLineDiscount(data: any) {
    const { data: newItem, error } = await supabase
      .from("line_discount")
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return newItem;
  },

  async updateLineDiscount(id: number | string, data: any) {
    const { data: updatedItem, error } = await supabase
      .from("line_discount")
      .update(data)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return updatedItem;
  },

  async deleteLineDiscount(id: number | string) {
    const { error } = await supabase
      .from("line_discount")
      .delete()
      .eq("id", id);
    if (error) throw error;
  }
});
