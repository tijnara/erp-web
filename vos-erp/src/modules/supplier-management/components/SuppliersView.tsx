"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import type { DataProvider } from "../providers/DataProvider";
import type { Supplier } from "../types";
import { SupplierFormDialog } from "./SupplierFormDialog";
import { SupplierDiscountPerProduct } from "./SupplierDiscountPerProduct";
import { SupplierDiscountPerBrand } from "./SupplierDiscountPerBrand";
import { SupplierDiscountPerCategory } from "./SupplierDiscountPerCategory";

type DeliveryTerm = { id: number; delivery_name: string };

export function SuppliersView({ provider }: { provider: DataProvider }) {
    const [q, setQ] = useState("");
    const [rows, setRows] = useState<Supplier[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const limit = 20;

    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<"create" | "edit">("create");
    const [current, setCurrent] = useState<Supplier | null>(null);
    const [selected, setSelected] = useState<Supplier | null>(null);
    const [deliveryTerms, setDeliveryTerms] = useState<DeliveryTerm[]>([]);
    const [detailsTab, setDetailsTab] = useState<"details" | "discounts" | "brand-discounts" | "category-discounts">("details");

    const totalPages = useMemo(() => Math.ceil(total / limit), [total, limit]);

    async function refresh() {
        const offset = (page - 1) * limit;
        const { items, total } = await provider.listSuppliers({ q, limit, offset });
        setRows(items);
        setTotal(total);
    }

    useEffect(() => {
        let mounted = true;
        async function fetchDeliveryTerms() {
            const { data, error } = await supabase
                .from("delivery_terms")
                .select("id, delivery_name");
            if (error) {
                console.error("Failed to fetch delivery terms:", error);
                return;
            }
            if (mounted && data) {
                setDeliveryTerms(data);
            }
        }
        fetchDeliveryTerms();
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        refresh();
    }, [q, page]);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Suppliers</h2>
                <button
                    className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold"
                    onClick={() => {
                        setMode("create");
                        setCurrent(null);
                        setOpen(true);
                    }}
                >
                    + Add Supplier
                </button>
            </div>

            {!selected && (
                <input
                    placeholder="Search by name, shortcut, or contact person..."
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                />
            )}

            {!selected ? (
                <div className="overflow-hidden border border-gray-200 rounded-xl">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                <th className="text-left p-3 font-medium">Supplier Name</th>
                                <th className="text-left p-3 font-medium">Shortcut</th>
                                <th className="text-left p-3 font-medium">Contact Person</th>
                                <th className="text-left p-3 font-medium">Contact Info</th>
                                <th className="text-left p-3 font-medium">Type</th>
                                <th className="text-left p-3 font-medium">Status</th>
                                <th className="text-left p-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r) => (
                                <tr
                                    key={r.id}
                                    className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                                    onClick={() => setSelected(r)}
                                >
                                    <td className="p-3">{r.supplier_name}</td>
                                    <td className="p-3">{r.supplier_shortcut}</td>
                                    <td className="p-3">{r.contact_person}</td>
                                    <td className="p-3">
                                        <div>{r.phone_number}</div>
                                        <div>{r.email_address}</div>
                                    </td>
                                    <td className="p-3">
                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                            {r.supplier_type}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <span
                                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                r.isActive
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                            }`}
                                        >
                                            {r.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <button
                                            className="px-2 py-1 rounded border text-xs hover:bg-gray-100"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setMode("edit");
                                                setCurrent(r);
                                                setOpen(true);
                                            }}
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {rows.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-6 text-center text-gray-500">
                                        No suppliers found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <div className="flex justify-between items-center p-3 border-t">
                        <div className="text-sm text-gray-500">
                            Page {page} of {totalPages || 1} ({total} items)
                        </div>
                        <div className="flex gap-2">
                            <button
                                className="text-sm px-3 py-1 rounded border disabled:opacity-50"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => p - 1)}
                            >
                                Previous
                            </button>
                            <button
                                className="text-sm px-3 py-1 rounded border disabled:opacity-50"
                                disabled={page >= totalPages}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
                        <div className="font-medium">Supplier Details</div>
                        <div className="flex gap-2">
                            <button
                                className="text-xs px-2 py-1 rounded border bg-white hover:bg-gray-50"
                                onClick={() => setSelected(null)}
                            >
                                Back to list
                            </button>
                            <button
                                className="text-xs px-2 py-1 rounded border bg-white hover:bg-gray-50"
                                onClick={() => {
                                    setMode("edit");
                                    setCurrent(selected);
                                    setOpen(true);
                                }}
                            >
                                Edit
                            </button>
                        </div>
                    </div>
                    <div className="border-b border-gray-200 bg-white">
                        <div className="flex overflow-x-auto">
                            {[{ key: "details", label: "Supplier Details" }, { key: "discounts", label: "Product Discounts" }, { key: "brand-discounts", label: "Brand Discounts" }, { key: "category-discounts", label: "Category Discounts" }].map((tab) => (
                                <button
                                    key={tab.key}
                                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${detailsTab === tab.key ? "border-b-2 border-primary text-primary" : "text-gray-500 hover:text-gray-700"}`}
                                    onClick={() => setDetailsTab(tab.key as any)}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white">
                        {detailsTab === "details" && (
                            <table className="w-full text-sm">
                                <tbody>
                                    {[
                                        ["Supplier Name", selected.supplier_name],
                                        ["Shortcut", selected.supplier_shortcut],
                                        ["Contact Person", selected.contact_person],
                                        ["Email", selected.email_address],
                                        ["Phone", selected.phone_number],
                                        ["Address", selected.address],
                                        ["Type", selected.supplier_type],
                                        ["TIN", selected.tin_number],
                                        ["Payment Terms", selected.payment_terms],
                                        ["Delivery Terms", deliveryTerms.find((d) => d.id === Number(selected.delivery_terms))?.delivery_name ?? selected.delivery_terms],
                                        ["Date Added", selected.date_added],
                                        ["Active", selected.isActive ? "Yes" : "No"]
                                    ].map(([label, value]) => (
                                        <tr key={String(label)} className="border-b last:border-0">
                                            <td className="p-3 font-medium text-gray-600 w-1/3">{label}</td>
                                            <td className="p-3">{value ?? "-"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        {detailsTab === "discounts" && (
                            <div className="p-4">
                                <SupplierDiscountPerProduct supplier={selected} provider={provider as any} />
                            </div>
                        )}
                        {detailsTab === "brand-discounts" && (
                            <div className="p-4">
                                <SupplierDiscountPerBrand supplier={selected} provider={provider as any} />
                            </div>
                        )}
                        {detailsTab === "category-discounts" && (
                            <div className="p-4">
                                <SupplierDiscountPerCategory supplier={selected} provider={provider as any} />
                            </div>
                        )}
                    </div>
                </div>
            )}

            <SupplierFormDialog
                open={open}
                mode={mode}
                initial={current ?? undefined}
                onClose={() => setOpen(false)}
                onSubmit={async (dto) => {
                    if (mode === "create") {
                        await provider.createSupplier(dto);
                    } else if (current) {
                        await provider.updateSupplier(current.id, dto);
                    }
                    await refresh();
                    setOpen(false); // Close dialog after submit
                }}
            />
        </div>
    );
}
