import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import "./StatisticsSection.css";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#00C49F",
  "#FF6666",
];

/**
 * Groups data by "name" and applies aggregation.
 * @param {Array} data - Input data array.
 * @param {string} valueKey - Key whose values should be combined.
 * @param {"sum"|"max"} aggregationType - Aggregation type: sum (default) or max.
 */
const groupByName = (data, valueKey, aggregationType = "sum") => {
  const grouped = {};

  data.forEach((item) => {
    const key = item.name;
    const value = Number(item[valueKey]) || 0;

    if (!grouped[key]) {
      grouped[key] = { name: key, [valueKey]: value };
    } else {
      if (aggregationType === "max") {
        grouped[key][valueKey] = Math.max(grouped[key][valueKey], value);
      } else {
        grouped[key][valueKey] += value;
      }
    }
  });

  return Object.values(grouped);
};

export default function StatsSection({
  title,
  barData,
  barKey,
  pieData,
  pieKey,
  aggregationType = "sum", // 👈 Default to sum, can be set to "max"
}) {
  // ✅ Group data based on aggregation type
  const groupedBarData = useMemo(
    () => groupByName(barData, barKey, aggregationType),
    [barData, barKey, aggregationType]
  );

  const groupedPieData = useMemo(
    () => groupByName(pieData, pieKey, aggregationType),
    [pieData, pieKey, aggregationType]
  );

  return (
    <div className="stats-wrapper">
      {/* ---------- BAR CHART ---------- */}
      <div className="stats-card">
        <h3 className="stats-title">{title} - Bar Chart</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={groupedBarData}
              margin={{ top: 20, right: 20, left: 10, bottom: 45 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-20}
                textAnchor="end"
                interval={0}
                fontSize={12}
              />
              <YAxis />
              <Tooltip />
              <Legend verticalAlign="top" height={40} />
              <Bar dataKey={barKey} fill="#82ca9d" barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ---------- PIE CHART ---------- */}
      <div className="stats-card">
        <h3 className="stats-title">{title} - Pie Chart</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={350}>
            <PieChart margin={{ top: 30, right: 30, bottom: 30, left: 30 }}>
              <Pie
                data={groupedPieData}
                dataKey={pieKey}
                nameKey="name"
                innerRadius={60}
                outerRadius={110}
                paddingAngle={4}
                labelLine={false}
              >
                {groupedPieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={30} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
