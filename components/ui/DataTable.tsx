import type { ReactNode } from "react";

type DataTableProps = {
  columns: readonly string[];
  rows: ReadonlyArray<ReadonlyArray<ReactNode>>;
};

export function DataTable({ columns, rows }: Readonly<DataTableProps>) {
  return (
    <div className="overflow-x-auto -mx-5 px-5">
      <table className="w-full min-w-full border-collapse">
        <thead>
          <tr className="border-b border-border/60">
            {columns.map((column) => (
              <th
                key={column}
                className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="py-8 px-4 text-sm text-muted-foreground text-center"
              >
                No records yet.
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => {
              const firstPrimitive = row.find(
                (value) => typeof value === "string" || typeof value === "number"
              );
              const rowKey =
                firstPrimitive === undefined
                  ? `row-${idx}`
                  : `row-${firstPrimitive}-${idx}`;
              return (
                <tr
                  key={rowKey}
                  className="border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors"
                >
                  {row.map((value, cellIdx) => (
                    <td
                      key={`${idx}-${cellIdx}`}
                      className="py-3 px-3 text-sm"
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
