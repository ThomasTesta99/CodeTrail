"use client";

import { SortKey } from "@/app/(root)/all-questions/page";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

export default function QuestionFilterBar({ labels }: { labels: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  labels.sort()

  const currentQuery = searchParams.get("q") || "";
  const [localQuery, setLocalQuery] = useState(currentQuery);

  const currentLabel = searchParams.get("label") || "";
  const currentSort = (searchParams.get("sort") as SortKey) || "newest";

  const pushParams = useCallback(
    (next: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [k, v] of Object.entries(next)) {
        if (v === "") params.delete(k);
        else params.set(k, v);
      }

      params.set("page", "1");

      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname, searchParams]
  );


  useEffect(() => {
    setLocalQuery(currentQuery);
  }, [currentQuery]);

  useEffect(() => {
    const t = setTimeout(() => {
      pushParams({q: localQuery});
    }, 300);

    return () => clearTimeout(t);
  }, [localQuery]);

  function clearAll() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("label");
    params.delete("sort");
    params.delete("q");
    params.set("page", "1");
    

    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="w-full mb-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-gray-700">Topic</p>

          <select
            className="rounded-xl border px-3 py-2 text-sm outline-none"
            value={currentLabel}
            onChange={(e) => pushParams({ label: e.target.value })}
          >
            <option value="">All</option>
            {labels.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
            <option value="Unlabeled">Unlabeled</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-gray-700">Search</p>

          <input
            className="rounded-xl border px-3 py-2 text-sm outline-none"
            placeholder="Search questions..."
            defaultValue={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center sm:justify-end">
          <p className="text-sm font-semibold text-gray-700">Sort</p>

          <select
            className="rounded-xl border px-3 py-2 text-sm outline-none"
            value={currentSort}
            onChange={(e) => pushParams({ sort: e.target.value })}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="difficultyAsc">Difficulty (Easy → Hard)</option>
            <option value="difficultyDesc">Difficulty (Hard → Easy)</option>
          </select>

          <button
            type="button"
            onClick={clearAll}
            className="rounded-xl border px-3 py-2 text-sm font-medium hover:bg-gray-50 cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
