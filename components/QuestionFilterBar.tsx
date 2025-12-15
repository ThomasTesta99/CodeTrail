"use client";

import React from "react";

export default function QuestionFilterBar() {
  return (
    <div className="w-full mb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-gray-700">Topic</p>
                <select className="rounded-xl border px-3 py-2 text-sm outline-none">
                    <option value="">All</option>
                    <option value="dp">Dynamic Programming</option>
                    <option value="graphs">Graphs</option>
                    <option value="trees">Trees</option>
                </select>
            </div>
            <div className="flex flex-wrap gap-2 items-center sm:justify-end">
                <p className="text-sm font-semibold text-gray-700">Sort</p>
                <select className="rounded-xl border px-3 py-2 text-sm outline-none">
                    <option value="oldest">Oldest</option>
                    <option value="newest">Newest</option>
                    <option value="group-topic">Topic</option>
                </select>
                <button className="rounded-xl border px-3 py-2 text-sm font-medium hover:bg-gray-50 cursor-pointer">Clear</button>
            </div>
        </div>
    </div>
  );
}
