/**
 * LineChart Component
 * Reusable line chart for displaying trends
 */
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface LineChartProps {
  title: string;
  data: Array<{ date: string; amount: number }>;
  dataKey?: string;
  valueFormatter?: (value: number) => string;
}

export function LineChart({
  title,
  data,
  dataKey = "amount",
  valueFormatter,
}: LineChartProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", { month: "short", day: "numeric" });
  };

  const formatValue = (value: number) => {
    if (valueFormatter) {
      return valueFormatter(value);
    }
    return value.toString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsLineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              style={{ fontSize: "12px" }}
            />
            <YAxis style={{ fontSize: "12px" }} />
            <Tooltip
              labelFormatter={formatDate}
              formatter={(value: number) => [formatValue(value), title]}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6" }}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
