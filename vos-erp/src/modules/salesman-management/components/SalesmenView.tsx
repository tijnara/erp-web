"use client";

import { useEffect, useMemo, useState } from "react";
import type { DataProvider } from "../providers/DataProvider";
import type { Salesman } from "../types";
import { StatBar } from "./StatBar";
import { SalesmanFormDialog } from "./SalesmanFormDialog";
import { supabase } from "@/lib/supabase"; // Standard Top-Level Import

export function SalesmenView({ provider }: { provider: DataProvider }) {
    const [q, setQ] = useState("");
    const [rows, setRows] = useState<Salesman[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const limit = 20;

    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<"create" | "edit">("create");
    const [current, setCurrent] = useState<Salesman | null>(null);
    const [selected, setSelected] = useState<Salesman | null>(null);

    // Consolidated Lookup Maps
    const [lookups, setLookups] = useState({
        branches: {} as Record<string, string>,
        operations: {} as Record<string, string>,
        companies: {} as Record<string, string>,
        priceTypes: {} as Record<string, string>,
        users: {} as Record<string, string>,
    });

    const totalPages = useMemo(() => Math.ceil(total / limit), [total, limit]);

    // 1. Consolidated Data Loading
    useEffect(() => {
        let mounted = true;

        async function fetchLookups() {
            try {
                // 1. Define promises with EXACT column names from your schema
                const [branchRes, opRes, compRes, priceRes, userRes] = await Promise.all([
                    // Branches: id, branch_code, branch_name
                    supabase.from("branches").select("id, branch_code, branch_name"),
                    // Operations: id, operation_name, code
                    supabase.from("operations").select("id, operation_name, code"),
                    // Company: company_id, company_code, company_name
                    supabase.from("company").select("company_id, company_code, company_name"),
                    // Price Types: price_type_id, price_type_name
                    supabase.from("price_types").select("price_type_id, price_type_name"),
                    // Users: user_id, user_fname, user_lname, user_email
                    supabase.from("users").select("user_id, user_fname, user_lname, user_email")
                ]);

                if (!mounted) return;

                // 2. Helper to map results to a simple ID -> Name object
                const buildMap = (data: any[] | null, idKey: string, nameKeys: string[]) => {
                    const map: Record<string, string> = {};
                    if (!data) return map;
                    for (const item of data) {
                        const id = item[idKey];
                        // Find the first available name property
                        const name = nameKeys.map(k => item[k]).find(v => v) || id;
                        if (id != null) map[String(id)] = String(name);
                    }
                    return map;
                };

                // 3. Set state using the specific ID columns for each table
                setLookups({
                    branches: buildMap(branchRes.data, 'id', ['branch_name', 'branch_code']),
                    operations: buildMap(opRes.data, 'id', ['operation_name', 'code']),
                    companies: buildMap(compRes.data, 'company_id', ['company_name', 'company_code']),
                    priceTypes: buildMap(priceRes.data, 'price_type_id', ['price_type_name']),
                    users: buildMap(userRes.data, 'user_id', ['user_fname', 'user_email']), // Manual join logic below for full name if preferred
                });

                // Optional: Better user name mapping (First Last)
                if (userRes.data) {
                    const userMap: Record<string, string> = {};
                    userRes.data.forEach((u: any) => {
                        const name = [u.user_fname, u.user_lname].filter(Boolean).join(" ") || u.user_email;
                        userMap[String(u.user_id)] = name;
                    });
                    setLookups(prev => ({ ...prev, users: userMap }));
                }

            } catch (error) {
                console.error("Critical error loading lookups:", error);
            }
        }

        fetchLookups();
        return () => { mounted = false; };
    }, []);

    // 2. Main Data Refresh
    async function refresh() {
        const offset = (page - 1) * limit;
        const { items, total } = await provider.listSalesmen({ q, limit, offset });
        setRows(items);
        setTotal(total);
    }

    useEffect(() => {
        refresh();
    }, [q, page]); // Removed provider dependency to prevent loops if provider object is unstable

    // Stats Calculation
    const stats = useMemo(() => {
        const active = rows.filter((r) => r.isActive !== false).length;
        return {
             total,
             active,
             inactive: rows.length - active,
             territories: new Set(rows.map((r) => r.territory ?? "-")).size
         };
    }, [rows, total]);

    // Simple Helpers using the unified state
    const getLookup = (map: Record<string, string>, val: any) => {
        if (val === null || val === undefined || val === "") return "-";
        return map[String(val)] ?? String(val);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Salesmen</h2>
                <button
                    className="px-3 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:opacity-90 transition"
                    onClick={() => { setMode("create"); setCurrent(null); setOpen(true); }}
                >
                    + Add Salesman
                </button>
            </div>

            {!selected ? (
                <>
                    <input
                        placeholder="Search..."
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                    <div className="overflow-hidden border border-gray-200 rounded-xl">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-600">
                                <tr>
                                    <th className="text-left p-3 font-medium">Name</th>
                                    <th className="text-left p-3 font-medium">Code</th>
                                    <th className="text-left p-3 font-medium">Branch</th>
                                    <th className="text-left p-3 font-medium">Status</th>
                                    <th className="text-left p-3 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((r) => (
                                    <tr key={r.id} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => setSelected(r)}>
                                        <td className="p-3">{r.name}</td>
                                        <td className="p-3">{r.code ?? "-"}</td>
                                        <td className="p-3">{getLookup(lookups.branches, r.branch_code)}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${r.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                                {r.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <button
                                                className="text-xs px-2 py-1 rounded border hover:bg-gray-100"
                                                onClick={(e) => { e.stopPropagation(); setMode("edit"); setCurrent(r); setOpen(true); }}
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {rows.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-gray-500">No records found.</td></tr>}
                            </tbody>
                        </table>
                        {/* Pagination Controls */}
                        <div className="flex justify-between items-center p-3 border-t">
                             <span className="text-sm text-gray-500">Page {page} of {totalPages || 1}</span>
                             <div className="flex gap-2">
                                 <button className="px-3 py-1 border rounded text-sm disabled:opacity-50" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                                 <button className="px-3 py-1 border rounded text-sm disabled:opacity-50" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
                             </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="overflow-hidden border border-gray-200 rounded-xl">
                    <div className="flex items-center justify-between p-3 bg-gray-50 border-b">
                        <div className="font-medium">Salesman Details</div>
                        <div className="flex gap-2">
                            <button className="text-xs px-2 py-1 rounded border bg-white" onClick={() => setSelected(null)}>Back</button>
                            <button className="text-xs px-2 py-1 rounded border bg-white" onClick={() => { setMode("edit"); setCurrent(selected); setOpen(true); }}>Edit</button>
                        </div>
                    </div>
                    <table className="w-full text-sm">
                        <tbody>
                            {[
                                ["Name", selected.name],
                                ["Code", selected.code],
                                ["Branch", getLookup(lookups.branches, selected.branch_code ?? selected.territory)],
                                ["Operation", getLookup(lookups.operations, selected.operation)],
                                ["Company", getLookup(lookups.companies, selected.company_code)],
                                ["Price Type", getLookup(lookups.priceTypes, selected.price_type)],
                                ["Encoder", getLookup(lookups.users, selected.encoder_id)],
                            ].map(([label, value]) => (
                                <tr key={label} className="border-t">
                                    <td className="p-3 font-medium text-gray-600 w-1/3">{label}</td>
                                    <td className="p-3">{value ?? "-"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <StatBar stats={stats} />

            <SalesmanFormDialog
                open={open}
                mode={mode}
                initial={current ?? undefined}
                onCloseAction={() => setOpen(false)}
                onSubmitAction={async (dto) => {
                    try {
                        if (mode === "create") await provider.createSalesman(dto);
                        else if (current) await provider.updateSalesman(current.id, dto);
                        await refresh();
                        setOpen(false); // Close on success
                    } catch (e) {
                        console.error("Error saving salesman:", e);
                        alert("Failed to save record. Please check console.");
                    }
                }}
            />
        </div>
    );
}
