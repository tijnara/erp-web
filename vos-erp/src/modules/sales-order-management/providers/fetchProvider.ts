import { supabase } from "../../../lib/supabase";

interface ListParams {
    q?: string;
    limit?: number;
    offset?: number;
}

export function fetchProvider() {
    return {
        async getSalesOrder(id: number) {
            const { data, error } = await supabase
                .from("sales_order")
                .select(`
                    *,
                    customer ( id, customer_name ),
                    salesman ( id, salesman_name )
                `)
                .eq("id", id)
                .single();
            if (error) throw error;
            return data;
        },

        async listSalesOrders({ q = "", limit = 20, offset = 0 }: ListParams) {
            let query = supabase
                .from("sales_order")
                .select(`
                    *,
                    customer ( customer_name )
                `, { count: "exact" })
                .range(offset, offset + limit - 1)
                .order('id', { ascending: false });
            if (q) {
                query = query.or(`sales_order_no.ilike.%${q}%`);
            }
            const { data, error, count } = await query;
            if (error) {
                console.error("Failed to list sales orders", error);
                return { items: [], total: 0 };
            }
            return {
                items: data || [],
                total: count || 0,
            };
        },

        async createSalesOrder(data: any) {
            // Generate Auto-Increment SO Number
            const { data: lastSO } = await supabase
                .from("sales_order")
                .select("sales_order_no")
                .order("sales_order_no", { ascending: false })
                .limit(1)
                .single();
            const lastSONumber = lastSO?.sales_order_no || "SO-2025-0000";
            const lastNumber = parseInt(lastSONumber.split('-').pop() || "0", 10);
            data.sales_order_no = `SO-2025-${(lastNumber + 1).toString().padStart(4, '0')}`;
            data.created_at = new Date().toISOString();
            const { data: newOrder, error } = await supabase
                .from("sales_order")
                .insert(data)
                .select()
                .single();
            if (error) throw error;
            return newOrder;
        },

        async updateSalesOrder(id: number, data: any) {
            const { data: updatedOrder, error } = await supabase
                .from("sales_order")
                .update(data)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return updatedOrder;
        },

        async deleteSalesOrder(id: number) {
            const { error } = await supabase
                .from("sales_order")
                .delete()
                .eq("id", id);
            if (error) throw error;
            return { success: true };
        },

        async listCustomers(q: string = "") {
            let query = supabase.from("customer").select("id, customer_name").limit(50);
            if (q) query = query.ilike("customer_name", `%${q}%`);
            const { data } = await query;
            return data || [];
        }
    };
}
