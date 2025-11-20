"use client";

import { useEffect, useState } from "react";
import { BranchFormDialog } from "./BranchFormDialog";

type ProviderType = {
    list: (params?: { q?: string; limit?: number; offset?: number }) => Promise<{ items: any[]; total: number }>;
    create: (dto: any) => Promise<any>;
    update: (id: string | number, dto: any) => Promise<any>;
    delete: (id: string | number) => Promise<void>;
};

export function BranchesView({ provider }: { provider: ProviderType }) {
    const [branches, setBranches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<"create" | "edit">("create");
    const [current, setCurrent] = useState<any | null>(null);

    useEffect(() => {
        async function loadBranches() {
            setLoading(true);
            try {
                const limit = 20;
                const offset = (page - 1) * limit;
                const result = await provider.list({ q: searchQuery, limit, offset });
                setBranches(result.items);
            } catch (error) {
                console.error("Error fetching branches:", error);
            } finally {
                setLoading(false);
            }
        }

        loadBranches();
    }, [provider, page, searchQuery]);

    const handleRegisterBranch = async (branch: any) => {
        try {
            if (mode === "edit" && current) {
                await provider.update(current.id, branch);
                alert("Branch updated successfully!");
            } else {
                await provider.create(branch);
                alert("Branch registered successfully!");
            }
            setOpen(false);
            setCurrent(null);
            setMode("create");

            // Reload branches
            const limit = 20;
            const offset = (page - 1) * limit;
            const result = await provider.list({ q: searchQuery, limit, offset });
            setBranches(result.items);
        } catch (error) {
            console.error("Error registering branch:", error);
            alert("Failed to register branch.");
        }
    };

    if (loading) {
        return <p>Loading branches...</p>;
    }

    // @ts-ignore
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Branches</h2>
                <button
                    className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold"
                    onClick={() => {
                        setMode("create");
                        setCurrent(null);
                        setOpen(true);
                    }}
                >
                    + Add Branch
                </button>
            </div>
            <input
                placeholder="Search by name, code, city, phone, or province…"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="overflow-hidden border border-gray-200 rounded-xl">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr>
                            <th className="text-left p-3 font-medium">Branch Name</th>
                            <th className="text-left p-3 font-medium">Branch Code</th>
                            <th className="text-left p-3 font-medium">City</th>
                            <th className="text-left p-3 font-medium">State/Province</th>
                            <th className="text-left p-3 font-medium">Status</th>
                            <th className="text-left p-3 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {branches.map((branch) => (
                            <tr key={branch.id} className="border-t hover:bg-gray-50 cursor-pointer">
                                <td className="p-3">{branch.branch_name}</td>
                                <td className="p-3">{branch.branch_code}</td>
                                <td className="p-3">{branch.city}</td>
                                <td className="p-3">{branch.state_province}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${branch.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                        {branch.isActive ? "Active" : "Inactive"}
                                    </span>
                                </td>
                                <td className="p-3">
                                    <div className="flex gap-2">
                                        <button
                                            className="text-xs px-2 py-1 rounded border"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setMode("edit");
                                                setCurrent(branch);
                                                setOpen(true);
                                            }}
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {branches.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-6 text-center text-gray-500">
                                    No branches found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <div className="flex justify-between items-center p-3 border-t">
                    <div className="text-sm text-gray-500">
                        Page {page} ({branches.length} items)
                    </div>
                    <div className="flex gap-2">
                        <button
                            className="text-sm px-3 py-1 rounded border disabled:opacity-50"
                            disabled={page <= 1}
                            onClick={() => setPage(p => p - 1)}
                        >
                            Previous
                        </button>
                        <button
                            className="text-sm px-3 py-1 rounded border disabled:opacity-50"
                            onClick={() => setPage(p => p + 1)}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
            <BranchFormDialog
                open={open}
                mode={mode}
                initial={current}
                onCloseAction={() => { setOpen(false); setCurrent(null); setMode("create"); }}
onSubmitAction={handleRegisterBranch}
            />
        </div>
    );
}
