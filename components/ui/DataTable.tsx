import type { ReactNode } from "react";

type DataTableProps = {
  columns: readonly string[];
  rows: ReadonlyArray<ReadonlyArray<ReactNode>>;
};

export function DataTable({ columns, rows }: Readonly<DataTableProps>) {
  return (
    <div className="overflow-x-auto -mx-3 sm:-mx-4 lg:-mx-5">
      <table className="w-full min-w-full text-sm">
        <thead>
          <tr className="bg-[hsl(214,32%,17%)]">
            {columns.map((col) => (
              <th
                key={col}
                className="text-left py-2.5 px-3 sm:px-4 text-[10px] font-semibold uppercase tracking-wider text-[hsl(214,15%,68%)] whitespace-nowrap"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="py-8 text-center text-sm text-[hsl(var(--foreground-muted))]"
              >
                No records yet.
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => {
              const first = row.find((v) => typeof v === "string" || typeof v === "number");
              const key = first === undefined ? `row-${idx}` : `row-${first}-${idx}`;
              return (
                <tr
                  key={key}
                  className="border-b border-border/40 last:border-0 hover:bg-[hsl(38,66%,97%)] transition-colors duration-100"
                >
                  {row.map((cell, ci) => (
                  <td
                    key={`${idx}-${ci}`}
                    className="py-2.5 px-3 sm:px-4 text-xs sm:text-sm text-foreground"
                  >
                      {cell}
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
