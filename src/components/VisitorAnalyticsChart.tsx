import React from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DailyStat } from "../firebase/visitorService";

interface Props {
  data: DailyStat[];
  peakDates: string[];
  isDark: boolean;
}

const formatDateTick = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date(year, month - 1, day));
};

const VisitorAnalyticsChart: React.FC<Props> = ({
  data,
  peakDates,
  isDark,
}) => {
  const colors = isDark
    ? {
        grid: "#39435C",
        axis: "#9DAAC4",
        visits: "#C39A32",
        unique: "#8298C8",
        panel: "#1A1F32",
        tooltip: "#070A12",
        text: "#DAE2F1",
      }
    : {
        grid: "#D8DEE8",
        axis: "#596678",
        visits: "#4F73C4",
        unique: "#C39A32",
        panel: "#FFFFFF",
        tooltip: "#F4F6F9",
        text: "#182230",
      };
  const peakVisits = data.reduce(
    (highest, point) => Math.max(highest, point.visits),
    0,
  );

  return (
    <div
      className="h-72 w-full min-w-0 sm:h-80"
      role="img"
      aria-label="Line chart showing daily visits and unique visitors">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
          <CartesianGrid stroke={colors.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDateTick}
            interval="preserveStartEnd"
            minTickGap={20}
            tick={{ fill: colors.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: colors.grid }}
          />
          <YAxis
            allowDecimals={false}
            width={42}
            tickFormatter={(value: number) => value.toLocaleString()}
            tick={{ fill: colors.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            labelFormatter={(label) => `Date: ${String(label)}`}
            formatter={(value, name) => [
              Number(value).toLocaleString(),
              String(name),
            ]}
            contentStyle={{
              backgroundColor: colors.tooltip,
              borderColor: colors.grid,
              borderRadius: 10,
              color: colors.text,
            }}
            labelStyle={{ color: colors.text, fontWeight: 600 }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            height={32}
            wrapperStyle={{ color: colors.axis, fontSize: 12 }}
          />
          <Line
            type="monotone"
            dataKey="visits"
            name="Visits"
            stroke={colors.visits}
            strokeWidth={3}
            dot={data.length <= 14 ? { r: 3 } : false}
            activeDot={{ r: 5 }}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="uniqueVisitors"
            name="Unique visitors"
            stroke={colors.unique}
            strokeWidth={2}
            dot={data.length <= 14 ? { r: 3 } : false}
            activeDot={{ r: 5 }}
            isAnimationActive={false}
          />
          {peakVisits > 0 &&
            peakDates.map((date) => (
              <ReferenceDot
                key={date}
                x={date}
                y={peakVisits}
                r={6}
                fill={colors.visits}
                stroke={colors.panel}
                strokeWidth={2}
              />
            ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VisitorAnalyticsChart;
