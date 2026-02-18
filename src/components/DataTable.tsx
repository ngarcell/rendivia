"use client";

import type { ReactNode } from "react";

interface Column {
  key: string;
  label: string;
}

interface DataTableProps {
  columns: Column[];
  rows: Array<Record<string, ReactNode>>;
  empty?: string;
}

export default function DataTable({ columns, rows, empty }: DataTableProps) {
  return (
    <div className="surface-card overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-[var(--surface-muted)] text-xs uppercase tracking-wide text-zinc-500">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-sm text-zinc-500">
                {empty ?? "No data yet."}
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr key={idx} className="border-t border-zinc-200">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-zinc-700">
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
