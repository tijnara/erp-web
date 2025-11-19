"use client";

import { useEffect, useState } from "react";
import { itemsUrl } from "../../../config/api";

export function CategoryDropdown({
  value,
  onChange,
}: {
  value: { id: string | number; name: string } | null;
  onChange: (value: { id: string | number; name: string } | null) => void;
}) {
  const [categories, setCategories] = useState<{ id: string | number; name: string }[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch(itemsUrl("categories"));
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const result = await response.json();
        const formattedCategories = result.data.map((category: any) => ({
          id: category.category_id,
          name: category.category_name,
        }));
        setCategories(formattedCategories);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selectedCategory = categories.find(
      (category) => category.id.toString() === selectedId
    );
    onChange(selectedCategory || null);
  };

  return (
    <div>
      <label className="text-sm">Category</label>
      {loading ? (
        <p className="text-xs text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-xs text-red-500">Error loading categories</p>
      ) : (
        <select
          className="mt-1 w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-900"
          value={value?.id || ""}
          onChange={handleChange}
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
