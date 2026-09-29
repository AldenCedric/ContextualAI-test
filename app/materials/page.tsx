"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import { mockMaterials as MATERIALS } from "@/lib/mock-data";
import Link from "next/link";
import { Bot } from "lucide-react";

const filterTypes = [
  "All",
  "Activity",
  "Handout",
  "Assignment",
  "Problem Set",
  "Presentation",
  "Research Activity",
  "Reading",
  "Project",
];

const getTypeColor = (type: string) => {
  switch (type) {
    case "Activity":
      return "bg-indigo-100 text-indigo-800";
    case "Handout":
      return "bg-emerald-100 text-emerald-800";
    case "Problem Set":
      return "bg-amber-100 text-amber-800";
    case "Presentation":
      return "bg-purple-100 text-purple-800";
    case "Research Activity":
      return "bg-cyan-100 text-cyan-800";
    case "Assignment":
      return "bg-pink-100 text-pink-800";
    case "Reading":
      return "bg-blue-100 text-blue-800";
    case "Project":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800 border-green-200";
    case "in-progress":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "not-started":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
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
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Select a material to view details or open the Task Companion.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Search materials by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />

          <div className="flex flex-wrap gap-2">
            {filterTypes.map((type) => (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === type
                    ? "bg-indigo-600 text-white"
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
              className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 flex flex-col transition-shadow hover:shadow-lg"
            >
              <div className="flex justify-between items-start mb-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(material.type)}`}
                >
                  {material.type}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(material.status)}`}
                >
                  {material.status.replace("-", " ")}
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
                {material.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 flex-grow">
                {material.description}
              </p>

              {material.deadline && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <span className="font-semibold">Deadline:</span>{" "}
                  {new Date(material.deadline).toLocaleDateString()}
                </p>
              )}

              <div className="space-y-1 mb-6">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Progress</span>
                  <span>{material.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${material.progress}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-auto">
                <Link
                  href={`/materials/${material.id}`}
                  className="w-full text-center px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Details
                </Link>
                <Link
                  href={`/materials/${material.id}/chat`}
                  className="w-full text-center px-3 py-2 border border-transparent rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors flex items-center justify-center gap-1.5"
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
        <div className="mt-12 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-center text-sm text-gray-500 dark:text-gray-400">
          This prototype uses sample academic materials. Future versions may
          support uploads, document extraction, and synchronization.
        </div>
      </div>
    </AppShell>
  );
}
