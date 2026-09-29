"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import { mockMaterials as MATERIALS } from "@/lib/mock-data";
import Link from "next/link";
import { Bot, Search } from "lucide-react";

const filterTypes = [
  "All",
  "Activity",
  "Handout",
  "Problem Set",
  "Presentation",
  "Reflection Paper",
  "Research Activity",
  "Worksheet",
  "Group Project",
];

const getTypeColor = (type: string) => {
  switch (type) {
    case "Activity":
      return "bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300";
    case "Handout":
      return "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300";
    case "Problem Set":
      return "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300";
    case "Presentation":
      return "bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300";
    case "Reflection Paper":
      return "bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300";
    case "Research Activity":
      return "bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300";
    case "Worksheet":
      return "bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300";
    case "Group Project":
      return "bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300";
    default:
      return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 border-green-200";
    case "in-progress":
      return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200";
    case "not-started":
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200";
  }
};

export default function MaterialsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredMaterials = MATERIALS.filter((material) => {
    const matchesSearch = material.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      activeFilter === "All" || material.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Academic Materials
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-300">
            Select an academic material to review instructions, draft your
            answer, or open the Task Companion.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search materials by title or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg shadow-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {filterTypes.map((type) => (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                  activeFilter === type
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => (
            <div
              key={material.id}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-xs border border-gray-200 dark:border-gray-800 p-6 flex flex-col transition-shadow hover:shadow-md"
            >
              <div className="flex justify-between items-start mb-3">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${getTypeColor(material.type)}`}
                >
                  {material.type}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getStatusColor(material.status)}`}
                >
                  {material.status.replace("-", " ")}
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1.5 line-clamp-1">
                {material.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-xs mb-4 line-clamp-2 flex-grow leading-relaxed">
                {material.description}
              </p>

              {material.deadline && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  <span className="font-semibold">Deadline:</span>{" "}
                  {new Date(material.deadline).toLocaleDateString()}
                </p>
              )}

              <div className="space-y-1 mb-5">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 font-medium">
                  <span>Progress</span>
                  <span>{material.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${material.progress}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-auto">
                <Link
                  href={`/materials/${material.id}`}
                  className="w-full text-center px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Details & Draft
                </Link>
                <Link
                  href={`/materials/${material.id}/chat`}
                  className="w-full text-center px-3 py-2 border border-transparent rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Companion</span>
                </Link>
              </div>
            </div>
          ))}
          {filteredMaterials.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400">
              No materials found matching your criteria.
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="mt-12 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-center text-xs text-gray-500 dark:text-gray-400">
          This prototype uses sample academic materials. Future versions may
          support uploads, document extraction, and synchronization.
        </div>
      </div>
    </AppShell>
  );
}
