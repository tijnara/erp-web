import { supabase } from "../../../lib/supabase";
import type { DataProvider, ListParams } from "./DataProvider";
import type { Supplier, UpsertSupplierDTO } from "../types";

function toUI(row: any): Supplier {
    return {
        id: row.id,
        supplier_name: row.supplier_name,
        supplier_shortcut: row.supplier_shortcut,
        contact_person: row.contact_person,
        email_address: row.email_address,
        phone_number: row.phone_number,
        address: row.address,
        city: row.city,
        brgy: row.brgy,
        state_province: row.state_province,
        postal_code: row.postal_code,
        country: row.country,
        supplier_type: row.supplier_type,
        tin_number: row.tin_number,
        bank_details: row.bank_details,
        payment_terms: row.payment_terms,
        delivery_terms: row.delivery_terms,
        agreement_or_contract: row.agreement_or_contract,
        preferred_communication_method: row.preferred_communication_method,
        notes_or_comments: row.notes_or_comments,
        date_added: row.date_added,
        supplier_image: row.supplier_image,
        isActive: row.is_active ?? row.isActive,
        specialty: row.specialty,
        nonBuy: row.non_buy ?? row.nonBuy,
    };
}

function toAPI(dto: UpsertSupplierDTO): any {
    return {
        supplier_name: dto.supplier_name,
        supplier_shortcut: dto.supplier_shortcut,
        contact_person: dto.contact_person,
        email_address: dto.email_address,
        phone_number: dto.phone_number,
        address: dto.address,
        city: dto.city,
        brgy: dto.brgy,
        state_province: dto.state_province,
        postal_code: dto.postal_code,
        country: dto.country,
        supplier_type: dto.supplier_type,
        tin_number: dto.tin_number,
        bank_details: dto.bank_details,
        payment_terms: dto.payment_terms,
        delivery_terms: dto.delivery_terms,
        agreement_or_contract: dto.agreement_or_contract,
        preferred_communication_method: dto.preferred_communication_method,
        notes_or_comments: dto.notes_or_comments,
        date_added: dto.date_added,
        supplier_image: dto.supplier_image,
        is_active: dto.isActive,
        specialty: dto.specialty,
        non_buy: dto.nonBuy,
    };
}

export const fetchProvider = (): DataProvider => ({
    async listSuppliers({ q, limit = 20, offset = 0 }: ListParams) {
        let query = supabase
            .from("suppliers")
            .select("*", { count: "exact" })
            .range(offset, offset + limit - 1);
        if (q && q.trim().length > 0) {
            query = query.or(`supplier_name.ilike.%${q}%,contact_person.ilike.%${q}%`);
        }
        const { data, error, count } = await query;
        if (error) {
            console.error("List Suppliers Error:", error);
            return { items: [], total: 0 };
        }
        return { items: (data || []).map(toUI), total: count ?? 0 };
    },

    async getSupplier(id) {
        const { data, error } = await supabase.from("suppliers").select("*").eq("id", id).single();
        if (error) throw error;
        return toUI(data);
    },

    async createSupplier(data) {
        const { data: res, error } = await supabase.from("suppliers").insert(toAPI(data)).select().single();
        if (error) throw error;
        return toUI(res);
    },

    async updateSupplier(id, data) {
        const { data: res, error } = await supabase.from("suppliers").update(toAPI(data)).eq("id", id).select().single();
        if (error) throw error;
        return toUI(res);
    },

    async deleteSupplier(id) {
        const { error } = await supabase.from("suppliers").delete().eq("id", id);
        if (error) throw error;
    },

    async listProducts(productIds: number[]) {
        if (productIds.length === 0) return [];
        const { data, error } = await supabase.from("products").select("product_id, product_name").in("product_id", productIds);
        if (error) throw error;
        return data || [];
    },

    async listBrands(brandIds: number[]) {
        if (brandIds.length === 0) return [];
        const { data, error } = await supabase.from("brand").select("brand_id, brand_name").in("brand_id", brandIds);
        if (error) throw error;
        return data || [];
    },

    async listCategories(categoryIds: number[]) {
        if (categoryIds.length === 0) return [];
        const { data, error } = await supabase.from("categories").select("category_id, category_name").in("category_id", categoryIds);
        if (error) throw error;
        return data || [];
    },

    async listLineDiscounts(lineDiscountIds: number[]) {
        if (lineDiscountIds.length === 0) return [];
        const { data, error } = await supabase.from("line_discount").select("id, line_discount").in("id", lineDiscountIds);
        if (error) throw error;
        return data || [];
    },

    async createSupplierDiscountProduct(data) {
        const { error } = await supabase.from("supplier_discount_products").insert(data);
        if (error) throw error;
    },

    async listSupplierDiscountProducts(supplierId: number) {
        const { data, error } = await supabase.from("supplier_discount_products").select("*").eq("supplier_id", supplierId);
        if (error) throw error;
        return data || [];
    },

    async createSupplierDiscountBrand(data) {
        const { error } = await supabase.from("supplier_discount_brand").insert(data);
        if (error) throw error;
    },

    async listSupplierDiscountBrands(supplierId: number) {
        const { data, error } = await supabase.from("supplier_discount_brand").select("*").eq("supplier_id", supplierId);
        if (error) throw error;
        return data || [];
    },

    async createSupplierDiscountCategory(data) {
        const { error } = await supabase.from("supplier_discount_categories").insert(data);
        if (error) throw error;
    },

    async listSupplierDiscountCategories(supplierId: number) {
        const { data, error } = await supabase.from("supplier_discount_categories").select("*").eq("supplier_id", supplierId);
        if (error) throw error;
        return data || [];
    },
});
