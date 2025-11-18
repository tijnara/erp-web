// src/modules/user-management/providers/fetchProvider.ts
import type { DataProvider, ListParams } from "./DataProvider";
import type { User, UpsertUserDTO } from "../types";
import { supabase } from "../../../lib/supabase";

function toUI(row: any): User {
    return {
        user_id: row.user_id,
        user_email: row.user_email,
        user_fname: row.user_fname,
        user_mname: row.user_mname,
        user_lname: row.user_lname,
        user_contact: row.user_contact,
        user_province: row.user_province,
        user_city: row.user_city,
        user_brgy: row.user_brgy,
        user_department: row.user_department,
        user_position: row.user_position,
        user_dateOfHire: row.user_dateOfHire,
        isAdmin: row.isAdmin,
        user_sss: row.user_sss,
        user_philhealth: row.user_philhealth,
        user_tin: row.user_tin,
        user_tags: row.user_tags,
        user_bday: row.user_bday,
        role_id: row.role_id,
        rf_id: row.rf_id,
    };
}

function toAPI(dto: UpsertUserDTO): Record<string, any> {
    const body: Record<string, any> = {};
    if (dto.user_email !== undefined) body["user_email"] = dto.user_email;
    if (dto.user_password !== undefined) body["user_password"] = dto.user_password;
    if (dto.user_fname !== undefined) body["user_fname"] = dto.user_fname;
    if (dto.user_mname !== undefined) body["user_mname"] = dto.user_mname;
    if (dto.user_lname !== undefined) body["user_lname"] = dto.user_lname;
    if (dto.user_contact !== undefined) body["user_contact"] = dto.user_contact;
    if (dto.user_province !== undefined) body["user_province"] = dto.user_province;
    if (dto.user_city !== undefined) body["user_city"] = dto.user_city;
    if (dto.user_brgy !== undefined) body["user_brgy"] = dto.user_brgy;
    if (dto.user_department !== undefined) body["user_department"] = dto.user_department;
    if (dto.user_position !== undefined) body["user_position"] = dto.user_position;
    if (dto.user_dateOfHire !== undefined) body["user_dateOfHire"] = dto.user_dateOfHire;
    if (dto.isAdmin !== undefined) body["isAdmin"] = dto.isAdmin;
    if (dto.user_sss !== undefined) body["user_sss"] = dto.user_sss;
    if (dto.user_philhealth !== undefined) body["user_philhealth"] = dto.user_philhealth;
    if (dto.user_tin !== undefined) body["user_tin"] = dto.user_tin;
    if (dto.user_tags !== undefined) body["user_tags"] = dto.user_tags;
    if (dto.user_bday !== undefined) body["user_bday"] = dto.user_bday;
    if (dto.role_id !== undefined) body["role_id"] = dto.role_id;
    if (dto.rf_id !== undefined) body["rf_id"] = dto.rf_id;
    return body;
}

export const fetchProvider = (): DataProvider => ({
    async listUsers({ q = "", limit = 20, offset = 0 }: ListParams) {
        let query = supabase
            .from("users")
            .select("*", { count: "exact" })
            .range(offset, offset + limit - 1);
        if (q) {
            query = query.or(`user_email.ilike.%${q}%,user_fname.ilike.%${q}%,user_lname.ilike.%${q}%`);
        }
        const { data, error, count } = await query;
        if (error) {
            console.error(error);
            return { items: [], total: 0 };
        }
        return { items: data || [], total: count || 0 };
    },

    async getUser(id) {
        const { data, error } = await supabase.from("users").select("*").eq("user_id", id).single();
        if (error) throw error;
        return data;
    },

    async createUser(data) {
        const { data: newUser, error } = await supabase.from("users").insert(data).select().single();
        if (error) throw error;
        return newUser;
    },

    async updateUser(id, data) {
        const { data: updated, error } = await supabase.from("users").update(data).eq("user_id", id).select().single();
        if (error) throw error;
        return updated;
    },

    async deleteUser(id) {
        const { error } = await supabase.from("users").delete().eq("user_id", id);
        if (error) throw error;
    },
});
