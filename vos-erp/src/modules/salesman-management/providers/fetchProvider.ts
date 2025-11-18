// src/modules/salesman-management/providers/fetchProvider.ts
import { supabase } from "../../../lib/supabase";
import type { DataProvider, ListParams } from "./DataProvider";
import type { Salesman, UpsertSalesmanDTO } from "../types";

function toUI(row: any): Salesman {
    return {
        id: row.id,
        code: row.salesman_code,
        name: row.salesman_name,
        employee_id: row.employee_id,
        encoder_id: row.encoder_id,
        email: row.users?.user_email ?? null,
        phone: null,
        territory: row.branches?.branch_name ?? null,
        truck_plate: row.truck_plate,
        branch_code: row.branch_code,
        division_id: row.division_id,
        operation: row.operation,
        company_code: row.company_code,
        supplier_code: row.supplier_code,
        price_type: row.price_type,
        isActive: row.is_active,
        hireDate: row.modified_date,
        targetMonthly: null,
        totalSalesYTD: null,
    };
}

function toAPI(dto: UpsertSalesmanDTO): any {
    return {
        salesman_name: dto.name,
        salesman_code: dto.code,
        employee_id: dto.employee_id ? Number(dto.employee_id) : null,
        encoder_id: dto.encoder_id ? Number(dto.encoder_id) : null,
        truck_plate: dto.truck_plate,
        branch_code: dto.branch_code,
        division_id: dto.division_id,
        operation: dto.operation,
        company_code: dto.company_code,
        supplier_code: dto.supplier_code,
        price_type: dto.price_type,
        is_active: dto.isActive,
        modified_date: new Date().toISOString(),
    };
}

export const fetchProvider = (): DataProvider => ({
    async listSalesmen({ q, limit = 20, offset = 0 }: ListParams) {
        let query = supabase
            .from("salesman")
            .select(`
                *,
                users:employee_id ( user_email ),
                branches:branch_code ( branch_name )
            `, { count: "exact" })
            .range(offset, offset + limit - 1);
        if (q && q.trim().length > 0) {
            query = query.or(`salesman_name.ilike.%${q}%,salesman_code.ilike.%${q}%`);
        }
        const { data, error, count } = await query;
        if (error) {
            console.error("List Salesman Error:", error);
            return { items: [], total: 0 };
        }
        return { items: (data || []).map(toUI), total: count ?? 0 };
    },

    async getSalesman(id) {
        const { data, error } = await supabase
            .from("salesman")
            .select("*")
            .eq("id", id)
            .single();
        if (error) throw error;
        return toUI(data);
    },

    async createSalesman(data: UpsertSalesmanDTO) {
        const { data: res, error } = await supabase
            .from("salesman")
            .insert(toAPI(data))
            .select()
            .single();
        if (error) throw error;
        return toUI(res);
    },

    async updateSalesman(id, data: UpsertSalesmanDTO) {
        const { data: res, error } = await supabase
            .from("salesman")
            .update(toAPI(data))
            .eq("id", id)
            .select()
            .single();
        if (error) throw error;
        return toUI(res);
    },

    async deleteSalesman(id) {
        const { error } = await supabase.from("salesman").delete().eq("id", id);
        if (error) throw error;
    },
});