import type { ReactNode } from "react";
import type { TableColumn } from "~/types";

interface DataTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  actions?: (item: T) => ReactNode;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  actions,
  onRowClick,
  className = "",
}: DataTableProps<T>) {
  return (
    <div className={`relative w-full overflow-x-auto ${className}`}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted">
            {columns.map((column, index) => (
              <th
                key={index}
                className={`px-4 py-3 text-left text-sm font-semibold text-foreground ${
                  column.width ? `w-[${column.width}]` : ""
                }`}
              >
                {column.label}
              </th>
            ))}
            {actions && <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (actions ? 1 : 0)}
                className="px-4 py-8 text-center text-muted-foreground"
              >
                No data available
              </td>
            </tr>
          ) : (
            data.map((item, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick?.(item)}
                className={`border-b border-border hover:bg-muted/50 transition-colors ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={`px-4 py-4 text-sm text-foreground ${
                      column.align === "center"
                        ? "text-center"
                        : column.align === "right"
                        ? "text-right"
                        : ""
                    }`}
                  >
                    {column.render
                      ? column.render(item)
                      : (item[column.key as keyof T] as ReactNode)}
                  </td>
                ))}
                {actions && (
                  <td
                    className="px-4 py-4 text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {actions(item)}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
