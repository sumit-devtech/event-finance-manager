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
    <div className={`relative w-full overflow-x-auto bg-white rounded-[6px] border border-[#E2E2E2] ${className}`}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[#ECECF1]">
            {columns.map((column, index) => (
              <th
                key={index}
                className={`px-4 h-9 text-left text-sm font-medium text-[#1A1A1A] ${
                  column.width ? `w-[${column.width}]` : ""
                }`}
              >
                {column.label}
              </th>
            ))}
            {actions && <th className="px-4 h-9 text-left text-sm font-medium text-[#1A1A1A]">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (actions ? 1 : 0)}
                className="px-4 py-8 text-center text-[#5E5E5E] text-sm"
              >
                No data available
              </td>
            </tr>
          ) : (
            data.map((item, rowIndex) => (
              <tr
                key={(item as any).id || rowIndex}
                onClick={() => onRowClick?.(item)}
                className={`border-b border-[#ECECF1] hover:bg-[#F9F9FC] transition-colors ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={`px-4 h-9 text-sm text-[#1A1A1A] ${
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
                    className="px-4 h-9 text-sm"
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
