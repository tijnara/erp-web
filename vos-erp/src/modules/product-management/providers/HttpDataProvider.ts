// src/modules/product-management/providers/HttpDataProvider.ts
import { supabase } from "../../../lib/supabase";
import type { DataProvider, ListParams } from "./DataProvider";
import type { Product, PriceType, ProductPrice, UpsertProductDTO } from "../types";

export class HttpDataProvider implements DataProvider {
    async listProducts(params: ListParams): Promise<{ items: Product[]; total: number }> {
        let query = supabase
            .from("products")
            .select("*", { count: "exact" });
        if (params.limit != null && params.offset != null) {
            query = query.range(params.offset, params.offset + params.limit - 1);
        }
        if (params.q) {
            query = query.ilike("product_name", `%${params.q}%`);
        }
        query = query.order("product_name", { ascending: true });
        const { data, error, count } = await query;
        if (error) {
            console.error("List Products Error:", error);
            return { items: [], total: 0 };
        }
        return { items: data as Product[], total: count ?? 0 };
    }

    async getProduct(productId: string | number): Promise<Product> {
        const { data, error } = await supabase
            .from("products")
            .select("*")
            .eq("product_id", productId)
            .single();
        if (error) throw error;
        return data as Product;
    }

    async createProduct(data: UpsertProductDTO): Promise<Product> {
        const { data: product, error } = await supabase
            .from("products")
            .insert(data)
            .select()
            .single();
        if (error) throw error;
        return product as Product;
    }

    async updateProduct(productId: string | number, data: UpsertProductDTO): Promise<Product> {
        const { data: product, error } = await supabase
            .from("products")
            .update(data)
            .eq("product_id", productId)
            .select()
            .single();
        if (error) throw error;
        return product as Product;
    }

    async deleteProduct(productId: string | number): Promise<void> {
        const { error } = await supabase
            .from("products")
            .delete()
            .eq("product_id", productId);
        if (error) throw error;
    }

    async listPriceTypes(): Promise<PriceType[]> {
        const { data, error } = await supabase
            .from("price_types")
            .select("price_type_id, price_type_name, sort")
            .order("sort", { ascending: true });
        if (error) throw error;
        return (data || []).map(item => ({
            id: item.price_type_id,
            name: item.price_type_name,
            sort: item.sort,
        }));
    }

    async listProductPrices(productId: string | number): Promise<ProductPrice[]> {
        const { data, error } = await supabase
            .from("product_per_price_type")
            .select("*")
            .eq("product_id", productId);
        if (error) throw error;
        return (data || []).map(item => ({
            id: item.id,
            productId: item.product_id,
            priceTypeId: item.price_type_id,
            value: item.price,
            status: item.status,
        }));
    }

    async setProductPrice(
        productId: string | number,
        priceTypeId: number | string,
        value: number | null
    ): Promise<ProductPrice | null> {
        // IMPORTANT: Requires a unique constraint on the table for (product_id, price_type_id)
        //
        // ALTER TABLE product_per_price_type
        // ADD CONSTRAINT product_price_type_unique
        // UNIQUE (product_id, price_type_id);

        const { data, error } = await supabase
            .from("product_per_price_type")
            .upsert({
                product_id: Number(productId),
                price_type_id: Number(priceTypeId),
                price: value,
                status: 'active'
            }, { onConflict: 'product_id,price_type_id' })
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            productId: data.product_id,
            priceTypeId: data.price_type_id,
            value: data.price,
            status: data.status,
        };
    }

    async createPriceType(name: string): Promise<PriceType> {
        const { data, error } = await supabase
            .from("price_types")
            .insert({ price_type_name: name })
            .select()
            .single();
        if (error) throw error;
        return {
            id: data.price_type_id,
            name: data.price_type_name,
            sort: data.sort,
        };
    }

    async updatePriceType(id: number | string, name: string): Promise<PriceType> {
        const { data, error } = await supabase
            .from("price_types")
            .update({ price_type_name: name })
            .eq("price_type_id", id)
            .select()
            .single();
        if (error) throw error;
        return {
            id: data.price_type_id,
            name: data.price_type_name,
            sort: data.sort,
        };
    }

    async deletePriceType(id: number | string): Promise<void> {
        const { error } = await supabase
            .from("price_types")
            .delete()
            .eq("price_type_id", id);
        if (error) throw error;
    }

    async approveProductPrice(priceId: string | number): Promise<ProductPrice> {
        const { data, error } = await supabase
            .from("product_per_price_type")
            .update({ status: "approved" })
            .eq("id", priceId)
            .select()
            .single();
        if (error) throw error;
        return {
            id: data.id,
            productId: data.product_id,
            priceTypeId: data.price_type_id,
            value: data.price,
            status: data.status,
        };
    }

    async getUser(userId: string | number) {
        const { data } = await supabase
            .from("users")
            .select("user_id, user_fname, user_lname")
            .eq("user_id", userId)
            .single();
        if (!data) return null;
        return {
            id: data.user_id,
            first_name: data.user_fname,
            last_name: data.user_lname
        };
    }
}
