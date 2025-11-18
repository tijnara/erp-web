import { supabase } from "../../../lib/supabase";

interface ListParams {
    q?: string;
    limit?: number;
    offset?: number;
}

export function fetchProvider() {
    return {
        async getPurchaseOrder(id: number) {
            const { data, error } = await supabase
                .from("purchase_order")
                .select(`
                    *,
                    suppliers ( id, supplier_name ),
                    payment_terms ( id, name ),
                    receiving_type ( id, name )
                `)
                .eq("id", id)
                .single();
            if (error) throw error;
            return data;
        },

        async listPurchaseOrders({ q = "", limit = 20, offset = 0 }: ListParams) {
            let query = supabase
                .from("purchase_order")
                .select(`
                    *,
                    suppliers ( supplier_name )
                `, { count: "exact" })
                .range(offset, offset + limit - 1)
                .order('id', { ascending: false });
            if (q) {
                query = query.or(`purchase_order_no.ilike.%${q}%`);
            }
            const { data, error, count } = await query;
            if (error) {
                console.error("Failed to list purchase orders", error);
                return { items: [], total: 0 };
            }
            return {
                items: data || [],
                total: count || 0,
            };
        },

        async createPurchaseOrder(data: any) {
            // 1. Generate Auto-Increment PO Number
            const { data: lastPO } = await supabase
                .from("purchase_order")
                .select("purchase_order_no")
                .order("purchase_order_no", { ascending: false })
                .limit(1)
                .single();
            const lastPONumber = lastPO?.purchase_order_no || "PO-2025-1112";
            const lastNumber = parseInt(lastPONumber.split('-').pop() || "0", 10);
            data.purchase_order_no = `PO-2025-${(lastNumber + 1).toString().padStart(4, '0')}`;
            // 2. Insert Data
            const { data: newOrder, error } = await supabase
                .from("purchase_order")
                .insert(data)
                .select()
                .single();
            if (error) throw error;
            return newOrder;
        },

        async updatePurchaseOrder(id: number, data: any) {
            const { data: updatedOrder, error } = await supabase
                .from("purchase_order")
                .update(data)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return updatedOrder;
        },

        async deletePurchaseOrder(id: number) {
            const { error } = await supabase
                .from("purchase_order")
                .delete()
                .eq("id", id);
            if (error) throw error;
            return { success: true };
        },

        // --- Reference Data ---
        async listSuppliers() {
            const { data } = await supabase.from("suppliers").select("*");
            return data || [];
        },

        async listPaymentTerms() {
            const { data } = await supabase.from("payment_terms").select("*");
            return data || [];
        },

        async listReceivingTypes() {
            const { data } = await supabase.from("receiving_type").select("*");
            return data || [];
        },

        async listPurchaseOrderReceiving(purchaseOrderId: number) {
            const { data, error } = await supabase
                .from("purchase_order_receiving")
                .select("*")
                .eq("purchase_order_id", purchaseOrderId);
            if (error) throw error;
            return data || [];
        }

    };
}