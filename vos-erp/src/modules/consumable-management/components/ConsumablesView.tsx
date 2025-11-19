"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Consumable {
    item_id: number;
    item_code: string;
    item_name: string;
    item_description: string | null;
    category_id: number;
    unit_of_measure: string;
    unit_cost: string;
    brand: string;
    supplier_id: number | null;
    is_active: number;
    date_added: string;
    updated_at: string;
}

interface ConsumableCategory {
    category_id: number;
    category_name: string;
    category_description?: string;
}

const PAGE_SIZE = 20;

export function ConsumablesView({ provider }: { provider: any }) {
    const [consumables, setConsumables] = useState<Consumable[]>([]);
    const [categories, setCategories] = useState<ConsumableCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState<number | null>(null);
    const [form, setForm] = useState<Partial<Consumable>>({
        item_code: "",
        item_name: "",
        item_description: "",
        category_id: 0,
        unit_of_measure: "",
        unit_cost: "",
        brand: "",
        supplier_id: null,
        is_active: 1,
    });

    // 1. Load Categories Once
    useEffect(() => {
        let alive = true;
        provider.listCategories().then((cats: ConsumableCategory[]) => {
            if (alive) setCategories(cats);
        });
        return () => { alive = false; };
    }, [provider]);

    // 2. Main Data Loop (Server-Side Pagination)
    useEffect(() => {
        let alive = true;
        async function loadData() {
            setLoading(true);
            try {
                const offset = (page - 1) * PAGE_SIZE;
                // 1. Fetch Consumables (with server-side search & pagination)
                const { items, total: totalCount } = await provider.listConsumables({
                    q,
                    limit: PAGE_SIZE,
                    offset
                });
                // 2. Fetch Categories (for the dropdown/table display)
                const cats = await provider.listCategories();
                if (alive) {
                    setConsumables(items);
                    setTotal(totalCount);
                    setCategories(cats);
                }
            } catch (err) {
                console.error("Error loading data:", err);
            } finally {
                if (alive) setLoading(false);
            }
        }
        loadData();
        return () => { alive = false; };
    }, [provider, q, page]);

    const pageCount = useMemo(() => Math.ceil(total / PAGE_SIZE) || 1, [total]);

    const getCategoryName = (id: number) => {
        const c = categories.find((cat) => cat.category_id === id);
        return c ? c.category_name : "—";
    };

    const handleSave = async () => {
        try {
            if (editMode && currentId) {
                await provider.updateConsumable(currentId, form);
            } else {
                await provider.createConsumable(form);
            }
            setIsDialogOpen(false);
            setPage(1); // Force reload to first page
            // Optionally, you can call refresh() if you wrap loadData in useCallback
            // For now, reload the page to ensure fresh data
            window.location.reload();
        } catch (err) {
            console.error("Save failed:", err);
            alert("Failed to save consumable.");
        }
    };

    const openEditDialog = (item: Consumable) => {
        setForm(item);
        setCurrentId(item.item_id);
        setEditMode(true);
        setIsDialogOpen(true);
    };

    if (loading) return <p>Loading consumables...</p>;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Consumable Items</h2>
                <Button
                    onClick={() => {
                        setEditMode(false);
                        setForm({
                            item_code: "",
                            item_name: "",
                            item_description: "",
                            category_id: 0,
                            unit_of_measure: "",
                            unit_cost: "",
                            brand: "",
                            supplier_id: null,
                            is_active: 1,
                        });
                        setIsDialogOpen(true);
                    }}
                >
                    + Add Consumable
                </Button>
            </div>

            {/* Search */}
            <Input
                placeholder="Search by name, code, or brand…"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={q}
                onChange={(e) => {
                    setQ(e.target.value);
                    setPage(1);
                }}
            />

            {/* Table */}
            <div className="overflow-hidden border border-gray-200 rounded-xl">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                    <tr>
                        <th className="text-left p-3 font-medium">Name</th>
                        <th className="text-left p-3 font-medium">Category</th>
                        <th className="text-left p-3 font-medium">Unit</th>
                        <th className="text-left p-3 font-medium">Brand</th>
                        <th className="text-left p-3 font-medium">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {consumables.map((item) => (
                        <tr
                            key={item.item_id}
                            className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                        >
                            <td className="p-3">
                                <div className="font-medium">{item.item_name}</div>
                                <div className="text-xs text-gray-500">{item.item_code}</div>
                            </td>
                            <td className="p-3">{getCategoryName(item.category_id)}</td>
                            <td className="p-3">{item.unit_of_measure}</td>
                            <td className="p-3">{item.brand}</td>
                            <td className="p-3">
                                <Button variant="outline" size="sm" onClick={() => openEditDialog(item)}>
                                    Edit
                                </Button>
                            </td>
                        </tr>
                    ))}
                    {consumables.length === 0 && !loading && <tr><td colSpan={5} className="p-4 text-center">No items found.</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-500">Showing {consumables.length} of {total}</span>
                <div className="flex gap-2">
                    <Button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
                    <Button disabled={page >= pageCount} onClick={() => setPage(p => p + 1)}>Next</Button>
                </div>
            </div>

            {/* ADD/EDIT DIALOG */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editMode ? "Edit Consumable" : "Add New Consumable"}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3">
                        <div>
                            <Label>Item Code</Label>
                            <Input
                                value={form.item_code}
                                onChange={(e) => setForm({ ...form, item_code: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Item Name</Label>
                            <Input
                                value={form.item_name}
                                onChange={(e) => setForm({ ...form, item_name: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Category</Label>
                            <select
                                className="border w-full p-2 rounded"
                                value={form.category_id}
                                onChange={(e) => setForm({ ...form, category_id: Number(e.target.value) })}
                            >
                                <option value={0}>Select category</option>
                                {categories.map((cat) => (
                                    <option key={cat.category_id} value={cat.category_id}>
                                        {cat.category_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label>Unit of Measure</Label>
                            <Input
                                value={form.unit_of_measure}
                                onChange={(e) => setForm({ ...form, unit_of_measure: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Unit Cost</Label>
                            <Input
                                type="number"
                                value={form.unit_cost}
                                onChange={(e) => setForm({ ...form, unit_cost: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Brand</Label>
                            <Input
                                value={form.brand}
                                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                            />
                        </div>
                        <div className="flex justify-end space-x-2 mt-4">
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSave}>{editMode ? "Save Changes" : "Add"}</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>

    );
}
