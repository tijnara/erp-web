"use client";

import { useEffect, useState } from "react";

export function BrandDropdown({
  value,
  onChangeAction,
}: {
  value: { id: string | number; name: string } | null;
  onChangeAction: (value: { id: string | number; name: string } | null) => void;
}) {
  const [brands, setBrands] = useState<{ id: string | number; name: string }[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBrands() {
      try {
        const response = await fetch("/api/lookup/brand");
        if (!response.ok) {
          setError("Failed to fetch brands");
          return;
        }
        const result = await response.json();
        setBrands(result);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchBrands();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selectedBrand = brands.find(
      (brand) => brand.id.toString() === selectedId.toString()
    );
    onChangeAction(selectedBrand || null);
  };

  return (
    <div>
      <label className="text-sm">Brand</label>
      {loading ? (
        <p className="text-xs text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-xs text-red-500">Error loading brands</p>
      ) : (
        <select
          className="mt-1 w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-900"
          value={value?.id || ""}
          onChange={handleChange}
        >
          <option value="">Select a brand</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
