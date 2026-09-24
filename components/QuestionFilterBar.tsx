"use client";

import { SortKey } from "@/app/(root)/all-questions/page";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export default function QuestionFilterBar({
  labels,
}: {
  labels: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sortedLabels = [
    ...new Set(
      labels
        .map((label) => label.trim())
        .filter(
          (label) =>
            label.length > 0 &&
            label.toLowerCase() !== "unlabeled"
        )
    ),
  ].sort((a, b) => a.localeCompare(b));

  const currentQuery = searchParams.get("q") || "";

  const [localQuery, setLocalQuery] = useState(currentQuery);

  const currentLabel = searchParams.get("label") || "all";

  const currentSort =
    (searchParams.get("sort") as SortKey) || "newest";


  const searchParamsRef = useRef(searchParams.toString());


  const searchTimeout = useRef<
    ReturnType<typeof setTimeout> | null
  >(null);


  useEffect(() => {
    searchParamsRef.current = searchParams.toString();
  }, [searchParams]);

  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  const cancelPendingSearch = () => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
      searchTimeout.current = null;
    }
  };

  const pushParams = (next: Record<string, string>) => {
    const params = new URLSearchParams(
      searchParamsRef.current
    );

    for (const [key, value] of Object.entries(next)) {
      if (key === "label" && value === "all") {
        params.delete("label");
        continue;
      }

      if (value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    params.set("page", "1");

    const qs = params.toString();

    searchParamsRef.current = qs;

    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const handleSearchChange = (value: string) => {
    setLocalQuery(value);

    cancelPendingSearch();

    searchTimeout.current = setTimeout(() => {
      searchTimeout.current = null;

      pushParams({ q: value });
    }, 300);
  };

  const handleLabelChange = (value: string) => {
    pushParams({
      label: value,
      q: localQuery,
    });
  };

  const handleSortChange = (value: string) => {
    pushParams({
      sort: value,
      q: localQuery,
    });
  };

  const clearAll = () => {
    cancelPendingSearch();

    setLocalQuery("");

    const params = new URLSearchParams(
      searchParamsRef.current
    );

    params.delete("label");
    params.delete("sort");
    params.delete("q");

    params.set("page", "1");

    const qs = params.toString();

    searchParamsRef.current = qs;

    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <div className="w-full mb-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border-2 border-[#2C325D] bg-white p-4 shadow-sm">

        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-gray-700">
            Topic
          </p>

          <Select
            value={currentLabel}
            onValueChange={handleLabelChange}
          >
            <SelectTrigger className="w-[180px] rounded-xl border px-3 py-2 text-sm cursor-pointer">
              <SelectValue placeholder="Select a Topic" />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                <SelectLabel>Topics</SelectLabel>

                <SelectItem
                  value="all"
                  className="cursor-pointer"
                >
                  All
                </SelectItem>

                <SelectItem
                  value="__unlabeled__"
                  className="cursor-pointer"
                >
                  Unlabeled
                </SelectItem>

                {sortedLabels.map((label) => (
                  <SelectItem
                    key={label}
                    value={label}
                    className="cursor-pointer"
                  >
                    {label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

  
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-gray-700">
            Search
          </p>

          <input
            className="rounded-xl border px-3 py-2 text-sm outline-none"
            placeholder="Search questions..."
            value={localQuery}
            onChange={(e) =>
              handleSearchChange(e.target.value)
            }
          />
        </div>

      
        <div className="flex flex-wrap gap-2 items-center sm:justify-end">
          <p className="text-sm font-semibold text-gray-700">
            Sort
          </p>

          <Select
            value={currentSort}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-[180px] rounded-xl border px-3 py-2 text-sm outline-none cursor-pointer">
              <SelectValue placeholder="Sort your questions" />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                <SelectItem
                  value="newest"
                  className="cursor-pointer"
                >
                  Newest
                </SelectItem>

                <SelectItem
                  value="oldest"
                  className="cursor-pointer"
                >
                  Oldest
                </SelectItem>

                <SelectItem
                  value="difficultyAsc"
                  className="cursor-pointer"
                >
                  Difficulty (Easy → Hard)
                </SelectItem>

                <SelectItem
                  value="difficultyDesc"
                  className="cursor-pointer"
                >
                  Difficulty (Hard → Easy)
                </SelectItem>
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