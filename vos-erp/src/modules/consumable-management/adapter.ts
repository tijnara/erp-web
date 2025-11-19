// src/modules/consumables-management/adapter.ts
import { Consumable, ConsumableCategory } from "./types";

export interface ConsumablesDataAdapter {
    listConsumables(params: any): Promise<{ items: Consumable[]; total: number }>;

    createConsumable(data: Partial<Consumable>): Promise<Consumable>;
    updateConsumable(id: number, data: Partial<Consumable>): Promise<Consumable>;
    deleteConsumable(id: number): Promise<void>;

    listCategories(): Promise<ConsumableCategory[]>;
}
