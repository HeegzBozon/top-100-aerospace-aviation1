import React from "react";
import { cn } from "@/lib/utils";

export function AdminTable({ headers, rows, className }) {
  return (
    <div className="overflow-x-auto border border-[var(--border)] rounded-lg">
      <table className={cn("w-full text-sm", className)}>
        <thead>
          <tr className="border-b border-[var(--border)] bg-[var(--muted)]/30">
            {headers.map((header, idx) => (
              <th
                key={idx}
                className="px-4 py-3 text-left font-semibold text-[var(--text)] whitespace-nowrap"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((row, rowIdx) => (
              <tr key={rowIdx} className="border-b border-[var(--border)]/50 hover:bg-[var(--muted)]/10 transition-colors">
                {row.map((cell, cellIdx) => (
                  <td key={cellIdx} className="px-4 py-3 text-[var(--text)]">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={headers.length} className="px-4 py-8 text-center text-[var(--muted)]">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}