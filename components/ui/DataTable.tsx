import type { ReactNode } from "react";

type DataTableProps = {
  columns: readonly string[];
  rows: ReadonlyArray<ReadonlyArray<ReactNode>>;
};

export function DataTable({ columns, rows }: Readonly<DataTableProps>) {
  return (
    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
      <table className="w-full min-w-full">
        <thead>
          <tr className="border-b">
            {columns.map((column) => (
              <th key={column} className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-4 px-4 text-sm text-muted-foreground text-center">
                No records yet.
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => {
              const firstPrimitive = row.find((value) => typeof value === "string" || typeof value === "number");
              const rowKey = firstPrimitive === undefined ? `row-${idx}` : `row-${firstPrimitive}-${idx}`;
              return (
                <tr key={rowKey} className="border-b last:border-0">
                  {row.map((value, cellIdx) => (
                    <td key={`${idx}-${cellIdx}`} className="py-3 px-2 sm:px-4 text-xs sm:text-sm">
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
