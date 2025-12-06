/**
 * Dashboard Spend Chart Component
 * Displays spend over time line chart
 * Lazy loaded for performance optimization
 */

import { memo, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Dropdown } from "~/components/shared";
import type { BudgetDataPoint, DashboardEvent } from "./types";
import { filterChartData } from "./utils/dashboardTransformers";
import { DATE_RANGE_OPTIONS, CHART_COLORS } from "./constants";

interface DashboardSpendChartProps {
  budgetData: BudgetDataPoint[];
  events: DashboardEvent[];
  selectedEventFilter: string;
  dateRangeFilter: string;
  onEventFilterChange: (value: string) => void;
  onDateRangeFilterChange: (value: string) => void;
}

/**
 * Spend over time chart component
 * Memoized to prevent unnecessary re-renders
 * Uses useMemo for filtered data
 */
export const DashboardSpendChart = memo(function DashboardSpendChart({
  budgetData,
  events,
  selectedEventFilter,
  dateRangeFilter,
  onEventFilterChange,
  onDateRangeFilterChange,
}: DashboardSpendChartProps) {
  // Memoize filtered chart data
  const filteredData = useMemo(
    () => filterChartData(budgetData, dateRangeFilter),
    [budgetData, dateRangeFilter]
  );

  // Memoize event filter options
  const eventOptions = useMemo(
    () => [
      { value: "all", label: "All Events" },
      ...events.slice(0, 5).map((event) => ({
        value: event.id || "",
        label: event.name,
      })),
    ],
    [events]
  );

  return (
    <div className="bg-white p-5 md:p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h3 className="text-lg md:text-xl font-semibold text-gray-900">Spend Over Time</h3>

        {/* Chart Filters */}
        <div className="flex flex-wrap gap-3">
          {/* Event Filter */}
          <Dropdown
            value={selectedEventFilter}
            onChange={onEventFilterChange}
            options={eventOptions}
            placeholder="Select event"
            size="sm"
            className="min-w-[150px]"
          />

          {/* Date Range Filter */}
          <Dropdown
            value={dateRangeFilter}
            onChange={onDateRangeFilterChange}
            options={DATE_RANGE_OPTIONS}
            placeholder="Select date range"
            size="sm"
            className="min-w-[150px]"
          />
        </div>
      </div>

      {filteredData.length > 0 ? (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={filteredData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
              label={{
                value: "Month",
                position: "insideBottom",
                offset: -5,
                style: { textAnchor: "middle", fill: "#6b7280" },
              }}
              tick={{ fill: "#6b7280", fontSize: 12 }}
            />
            <YAxis
              label={{
                value: "Amount ($)",
                angle: -90,
                position: "insideLeft",
                style: { textAnchor: "middle", fill: "#6b7280" },
              }}
              tick={{ fill: "#6b7280", fontSize: 12 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.98)",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="line" />
            <Line
              type="monotone"
              dataKey="budget"
              stroke={CHART_COLORS.BUDGET}
              strokeWidth={3}
              name="Budget"
              dot={{ fill: CHART_COLORS.BUDGET, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="spent"
              stroke={CHART_COLORS.SPENT}
              strokeWidth={3}
              name="Spent"
              dot={{ fill: CHART_COLORS.SPENT, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[350px] flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg">
          <p>No budget data available</p>
        </div>
      )}
    </div>
  );
});

