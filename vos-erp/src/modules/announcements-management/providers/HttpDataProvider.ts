// modules/announcements-management/providers/HttpDataProvider.ts
import { supabase } from "../../../lib/supabase";
import { Announcement, AnnouncementApiResponse } from "../types";

export async function fetchAnnouncements(): Promise<Announcement[]> {
    const { data, error } = await supabase
        .from("announcement")
        .select("*")
        .order("date_created", { ascending: false });
    if (error) {
        console.error("Failed to fetch announcements", error);
        throw new Error(error.message);
    }
    return data as Announcement[];
}

export async function addAnnouncement(newAnnouncement: Partial<Announcement>): Promise<Announcement> {
    const { data, error } = await supabase
        .from("announcement")
        .insert(newAnnouncement)
        .select()
        .single();
    if (error) {
        console.error("Failed to add announcement", error);
        throw new Error(error.message);
    }
    return data as Announcement;
}

export async function fetchUserById(id: number): Promise<{ id: number; name: string }> {
    const { data, error } = await supabase
        .from("users")
        .select("user_id, user_fname, user_lname")
        .eq("user_id", id)
        .single();
    if (error) {
        console.warn(`User ${id} not found`);
        return { id, name: "Unknown User" };
    }
    return {
        id: data.user_id,
        name: `${data.user_fname} ${data.user_lname}`.trim()
    };
}
