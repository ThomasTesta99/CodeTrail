"use client";

import { SortKey } from "@/app/(root)/all-questions/page";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select";

export default function QuestionFilterBar({ labels }: { labels: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  labels.sort()

  const currentQuery = searchParams.get("q") || "";
  const [localQuery, setLocalQuery] = useState(currentQuery);

  let currentLabel = searchParams.get("label") || "";
  currentLabel = currentLabel === "" ? "all" : currentLabel;
  const currentSort = (searchParams.get("sort") as SortKey) || "newest";

  const pushParams = useCallback(
  (next: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    for (const [k, v] of Object.entries(next)) {
      if (k === "label" && v === "all") {
        params.delete("label");
        continue;
      }

      if (v === "") {
        params.delete(k);
      } else {
        params.set(k, v);
      }
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border-2 border-[#2C325D]  bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-gray-700">Topic</p>
          
          
          {/* <select className="rounded-xl border px-3 py-2 text-sm outline-none" value={currentLabel} onChange={(e) => pushParams({ label: e.target.value })} > <option value="">All</option> {labels.map((label) => ( <option key={label} value={label}> {label} </option> ))} <option value="Unlabeled">Unlabeled</option> </select> */}
          <Select
            value={currentLabel}
            onValueChange={(value) => pushParams({label: value})}
          >
            <SelectTrigger className="w-[180px] rounded-xl border px-3 py-2 text-sm">
              <SelectValue placeholder="Select a Topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Topics</SelectLabel>
                <SelectItem value="all" >All</SelectItem>
                {labels.map((label) => (
                  <SelectItem key = {label }value = {label}>{label}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
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

          <Select
            value={currentSort}
            onValueChange={(value) => pushParams({sort: value})}
          >
            <SelectTrigger className="w-[180px] rounded-xl border px-3 py-2 text-sm outline-none">
              <SelectValue placeholder="Sort your questions" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="difficultyAsc">Difficulty (Easy → Hard)</SelectItem>
                <SelectItem value="difficultyDesc">Difficulty (Hard → Easy)</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

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
