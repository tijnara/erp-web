// src/modules/consumables-management/adapter.ts
import type { Consumable, ConsumableCategory } from "./types";

export interface ConsumablesDataAdapter {
    // Update: Accept pagination params and return { items, total }
    listConsumables(params?: { q?: string; limit?: number; offset?: number }): Promise<{ items: Consumable[]; total: number }>;

    createConsumable(data: Partial<Consumable>): Promise<Consumable>;
    deleteConsumable(id: number): Promise<void>;
    updateConsumable(id: number, data: Partial<Consumable>): Promise<Consumable>;

    listCategories(): Promise<ConsumableCategory[]>;
    createCategory(data: { category_name: string; category_description: string }): Promise<ConsumableCategory>;
}
