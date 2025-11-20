// src/modules/salesman-management/components/SalesmanFormDialog.tsx
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import type { Salesman, UpsertSalesmanDTO } from "../types";
import { supabase } from "@/lib/supabase";

export type Option = { value: string | number; label: string };

type Branch = { id: number; branch_name: string; branch_code?: string };
type Operation = { id: number; operation_name: string };
type Company = { company_id: number; company_name: string; company_code?: string };
type Supplier = { id: number; supplier_name: string; supplier_shortcut?: string };
type PriceType = { price_type_id: number; price_type_name: string };
type UserRow = { user_id: number; user_fname?: string; user_lname?: string };

type SalesmanRow = { salesman_code?: string };

async function safeQuery<T>(builder: any): Promise<T | []> {
  try {
    const { data, error } = await builder;
    if (error || !data) return [] as any;
    return data as T;
  } catch {
    return [] as any;
  }
}

function toOptions<T>(rows: T[], map: (row: T) => Option): Option[] {
  return rows.map(map);
}

async function fetchBranches(): Promise<Option[]> {
  const rows = await safeQuery<Branch[]>(supabase.from("branches").select("id, branch_name, branch_code"));
  return toOptions(rows as Branch[], (r) => ({ value: r.branch_code || r.id, label: r.branch_name }));
}
async function fetchOperations(): Promise<Option[]> {
  const rows = await safeQuery<Operation[]>(supabase.from("operations").select("id, operation_name"));
  return toOptions(rows as Operation[], (r) => ({ value: r.id, label: r.operation_name }));
}
async function fetchCompanies(): Promise<Option[]> {
  const rows = await safeQuery<Company[]>(supabase.from("company").select("company_id, company_name, company_code"));
  return toOptions(rows as Company[], (r) => ({ value: r.company_code || r.company_id, label: r.company_name }));
}
async function fetchSuppliers(): Promise<Option[]> {
  const rows = await safeQuery<Supplier[]>(supabase.from("suppliers").select("id, supplier_name, supplier_shortcut"));
  return toOptions(rows as Supplier[], (r) => ({ value: r.supplier_shortcut || r.id, label: r.supplier_name }));
}
async function fetchPriceTypes(): Promise<Option[]> {
  const rows = await safeQuery<PriceType[]>(supabase.from("price_types").select("price_type_id, price_type_name"));
  return toOptions(rows as PriceType[], (r) => ({ value: r.price_type_id, label: r.price_type_name }));
}

async function fetchUsers(op?: string | number): Promise<{ options: Option[]; byId: Record<string, UserRow> }> {
  let query = supabase.from("users").select("user_id, user_fname, user_lname");
  if (op) {
    query = query.eq("operation", op);
  }
  const rows = await safeQuery<UserRow[]>(query);
  const byId: Record<string, UserRow> = {};
  const options = (rows as UserRow[]).map((u) => {
    const label = [u.user_fname ?? "", u.user_lname ?? ""].filter(Boolean).join(" ").trim() || String(u.user_id);
    byId[String(u.user_id)] = u;
    return { value: u.user_id, label };
  });
  return { options, byId };
}

async function generateNextSalesmanCode(): Promise<string> {
  const rows = await safeQuery<SalesmanRow[]>(supabase.from("salesman").select("salesman_code"));
  let max = 0;
  for (const r of rows as SalesmanRow[]) {
    const c = r.salesman_code || "";
    const m = c.match(/SM-(\d+)/i);
    if (m) {
      const num = parseInt(m[1], 10);
      if (Number.isFinite(num) && num > max) max = num;
    }
  }
  return `SM-${String(max + 1).padStart(4, "0")}`;
}

function InputLabel({ children, required }: { children: any; required?: boolean }) {
  return (
    <div className="text-sm font-medium mb-1">
      {children}
      {required ? <span className="text-red-500"> *</span> : null}
    </div>
  );
}
function Help({ children }: { children: any }) {
  return <div className="text-xs text-gray-400 mt-1">{children}</div>;
}

export function SalesmanFormDialog({
  open,
  mode,
  initial,
  onCloseAction,
  onSubmitAction,
  onClose, // NEW optional alias prop
}: {
  open: boolean;
  mode: "create" | "edit";
  initial?: Partial<Salesman>;
  onCloseAction?: () => void; // made optional
  onSubmitAction: (dto: UpsertSalesmanDTO) => Promise<void>;
  onClose?: () => void; // NEW optional
}) {
  const [employee_id, setEmployeeId] = useState<number | "">(initial?.employee_id ?? "");
  const [code, setCode] = useState(initial?.code ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [truck_plate, setTruckPlate] = useState(initial?.truck_plate ?? "");
  const [branch_code, setBranchCode] = useState<string | number | "">(initial?.branch_code ?? "");
  const [division_id, setDivisionId] = useState<string | number | "">(initial?.division_id ?? "");
  const [operation, setOperation] = useState<string | number | "">(initial?.operation ?? "");
  const [company_code, setCompanyCode] = useState<string | number | "">(initial?.company_code ?? "");
  const [supplier_code, setSupplierCode] = useState<string | number | "">(initial?.supplier_code ?? "");
  const [price_type, setPriceType] = useState<string | number | "">(initial?.price_type ?? "");
  const [isActive, setIsActive] = useState<boolean>(initial?.isActive ?? true);

  const [encoderId, setEncoderId] = useState<number | null>(null);

  const [branches, setBranches] = useState<Option[]>([]);
  const [operationsOpts, setOperationsOpts] = useState<Option[]>([]);
  const [companies, setCompanies] = useState<Option[]>([]);
  const [suppliers, setSuppliers] = useState<Option[]>([]);
  const [priceTypes, setPriceTypes] = useState<Option[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [users, setUsers] = useState<Option[]>([]);
  const [usersById, setUsersById] = useState<Record<string, any>>({});
  const [selectedUserId, setSelectedUserId] = useState<string | number | "">(initial?.employee_id ?? "");
  const [userQuery, setUserQuery] = useState("");
  const [showUserSuggestions, setShowUserSuggestions] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);

  // Unified close handler (prefers onCloseAction then onClose)
  const invokeClose = useCallback(() => {
    if (submitting) return; // do not close while submitting
    const fn = onCloseAction || onClose;
    if (typeof fn === "function") fn();
    else console.warn("[SalesmanFormDialog] No close handler provided (onCloseAction/onClose)");
  }, [onCloseAction, onClose, submitting]);

  // When user changes, auto-fill employee_id and name
  useEffect(() => {
    if (selectedUserId === "") return;
    const u = usersById[String(selectedUserId)];
    if (u) {
      setEmployeeId(Number(selectedUserId));
      const full = `${u.user_fname ?? ""} ${u.user_lname ?? ""}`.trim();
      setName(full);
    }
  }, [selectedUserId, usersById]);

  const filteredUsers = useMemo(() => {
    const q = userQuery.trim().toLowerCase();
    if (!q) return users.slice(0, 20);
    return users.filter((o) => o.label.toLowerCase().includes(q)).slice(0, 20);
  }, [userQuery, users]);

  useEffect(() => {
    if (!open) return;
    fetchBranches().then(setBranches);
    fetchOperations().then(setOperationsOpts);
    fetchCompanies().then(setCompanies);
    fetchSuppliers().then(setSuppliers);
    fetchPriceTypes().then(setPriceTypes);
    fetchUsers(operation).then(({ options, byId }) => {
      setUsers(options);
      setUsersById(byId);
    });
  }, [open, operation]);

  useEffect(() => {
    if (!open) return;
    // hydrate from initial when opening
    setEmployeeId(initial?.employee_id ?? "");
    setCode(initial?.code ?? "");
    setName(initial?.name ?? "");
    setTruckPlate(initial?.truck_plate ?? "");
    setBranchCode(initial?.branch_code ?? "");
    setDivisionId(initial?.division_id ?? "");
    setOperation(initial?.operation ?? "");
    setCompanyCode(initial?.company_code ?? "");
    setSupplierCode(initial?.supplier_code ?? "");
    setPriceType(initial?.price_type ?? "");
    setIsActive(initial?.isActive ?? true);
    setSelectedUserId(initial?.employee_id ?? "");
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    if (selectedUserId !== "") {
      const sel = users.find((o) => String(o.value) === String(selectedUserId));
      setUserQuery(sel?.label ?? "");
    } else {
      setUserQuery("");
    }
    setHighlightIndex(-1);
  }, [open, users, selectedUserId]);

  // Auto-generate Salesman Code when creating a new record
  useEffect(() => {
    if (!open || mode !== "create") return;
    generateNextSalesmanCode().then(setCode).catch(() => setCode("SM-0001"));
  }, [open, mode]);

  // Fetch current logged-in user (encoder)
  useEffect(() => {
    if (!open) return;
    // Current user from auth session
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (u) {
        setEncoderId(Number(u.id)); // if numeric convert else ignore
      }
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const escListener = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        invokeClose();
      }
    };
    window.addEventListener("keydown", escListener);
    return () => window.removeEventListener("keydown", escListener);
  }, [open, invokeClose]);

  const canSubmit = useMemo(() => {
    return !(selectedUserId === "" || !code || employee_id === "" || isNaN(Number(employee_id)));
  }, [selectedUserId, code, employee_id]);

  async function handleSubmit() {
    if (!canSubmit) return;
    try {
      setSubmitting(true);
      const picked = selectedUserId === "" ? null : usersById[String(selectedUserId)];
      const fullName = picked ? `${picked.user_fname ?? ""} ${picked.user_lname ?? ""}`.trim() : name;
      const dto: UpsertSalesmanDTO = {
        employee_id: employee_id === "" ? (selectedUserId === "" ? null : Number(selectedUserId)) : Number(employee_id),
        encoder_id: mode === "create" ? (encoderId ?? undefined) : undefined,
        code: code || undefined,
        name: fullName,
        truck_plate: truck_plate || undefined,
        branch_code: branch_code === "" ? undefined : branch_code,
        division_id: division_id === "" ? undefined : division_id,
        operation: operation === "" ? undefined : operation,
        company_code: company_code === "" ? undefined : company_code,
        supplier_code: supplier_code === "" ? undefined : supplier_code,
        price_type: price_type === "" ? undefined : price_type,
        isActive,
      };
      await onSubmitAction(dto);
      invokeClose();
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={(e) => {
          e.stopPropagation();
          invokeClose();
        }}
      />
      <div className="relative w-full max-w-3xl rounded-xl bg-white shadow-xl border border-gray-200 p-5">
        <h3 className="text-lg font-semibold mb-4">
          {mode === "create" ? "Register New Salesman" : "Edit Salesman"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <InputLabel required>Employee ID</InputLabel>
            <input
              value={employee_id}
              onChange={(e) => setEmployeeId(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="12345"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              inputMode="numeric"
            />
            <Help>Required numeric</Help>
          </div>

          <div className="relative">
            <InputLabel required>Salesman Name (User)</InputLabel>
            <input
              value={userQuery}
              onChange={(e) => {
                setUserQuery(e.target.value);
                setShowUserSuggestions(true);
                setHighlightIndex(-1);
                setSelectedUserId("");
              }}
              onFocus={() => setShowUserSuggestions(true)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setHighlightIndex((i) => Math.min(i + 1, filteredUsers.length - 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setHighlightIndex((i) => Math.max(i - 1, 0));
                } else if (e.key === "Enter") {
                  if (highlightIndex >= 0 && filteredUsers[highlightIndex]) {
                    const o = filteredUsers[highlightIndex];
                    setSelectedUserId(o.value as any);
                    setUserQuery(o.label);
                    setShowUserSuggestions(false);
                  }
                } else if (e.key === "Escape") {
                  setShowUserSuggestions(false);
                }
              }}
              onBlur={() => setTimeout(() => setShowUserSuggestions(false), 100)}
              placeholder="Type to search users…"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white"
            />
            {showUserSuggestions && filteredUsers.length > 0 && (
              <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow">
                {filteredUsers.map((o, idx) => (
                  <div
                    key={String(o.value)}
                    className={`px-3 py-2 text-sm cursor-pointer ${idx === highlightIndex ? "bg-gray-100" : ""}`}
                    onMouseDown={() => {
                      setSelectedUserId(o.value as any);
                      setUserQuery(o.label);
                      setShowUserSuggestions(false);
                    }}
                  >
                    {o.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <InputLabel required>Salesman Code</InputLabel>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="SM-0001"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
            <Help>Unique code auto-generated on create (editable)</Help>
          </div>

          <div>
            <InputLabel>Truck Plate</InputLabel>
            <input
              value={truck_plate}
              onChange={(e) => setTruckPlate(e.target.value)}
              placeholder="ABC-1234"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <InputLabel>Branch</InputLabel>
            <select
              value={branch_code}
              onChange={(e) => setBranchCode(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white"
            >
              <option value="">-- Select Branch --</option>
              {branches.map((b) => (
                <option key={String(b.value)} value={String(b.value)}>{b.label}</option>
              ))}
            </select>
          </div>

          <div>
            <InputLabel>Operation</InputLabel>
            <select
              value={operation}
              onChange={(e) => setOperation(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white"
            >
              <option value="">-- Select Operation --</option>
              {operationsOpts.map((o) => (
                <option key={String(o.value)} value={String(o.value)}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <InputLabel>Company</InputLabel>
            <select
              value={company_code}
              onChange={(e) => setCompanyCode(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white"
            >
              <option value="">-- Select Company --</option>
              {companies.map((c) => (
                <option key={String(c.value)} value={String(c.value)}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <InputLabel>Supplier</InputLabel>
            <select
              value={supplier_code}
              onChange={(e) => setSupplierCode(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white"
            >
              <option value="">-- Select Supplier --</option>
              {suppliers.map((s) => (
                <option key={String(s.value)} value={String(s.value)}>{s.label}</option>
              ))}
            </select>
          </div>

          <div>
            <InputLabel>Price Type</InputLabel>
            <select
              value={price_type}
              onChange={(e) => setPriceType(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white"
            >
              <option value="">-- Select Price Type --</option>
              {priceTypes.map((p) => (
                <option key={String(p.value)} value={String(p.value)}>{p.label}</option>
              ))}
            </select>
          </div>

          <div>
            <InputLabel>Status</InputLabel>
            <select
              value={isActive ? "1" : "0"}
              onChange={(e) => setIsActive(e.target.value === "1")}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white"
            >
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            className="px-3 py-2 rounded-lg border text-sm"
            onClick={invokeClose}
            disabled={submitting}
            type="button"
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-black text-white text-sm disabled:opacity-50"
            disabled={!canSubmit || submitting}
            onClick={handleSubmit}
            type="button"
          >
            {submitting ? "Saving..." : mode === "create" ? "Create Salesman" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
