"use client";

import { Bar, BarChart, CartesianGrid, Tooltip, XAxis } from "recharts";
import { ChartConfig, ChartContainer } from "./ui/chart";

export interface TaskVolumeState {
  time_period?: string;
  total?: number;
}

export interface TaskVolumeStateProps {
  taskVolumeState: TaskVolumeState[];
}

const chartConfig = {
  total: {
    label: "Total Tasks",
    color: "hsl(var(--primary) / 0.8)",
  },
} satisfies ChartConfig;

// Custom tooltip to display week range
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    let displayDate = data?.time_period;
    if (
      typeof displayDate === "string" &&
      /^\d{2}-[A-Za-z]{3}-\d{4}$/.test(displayDate)
    ) {
      const [day, month, year] = displayDate.split("-");
      const date = new Date(`${month} ${day}, ${year}`);
      displayDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
    }
    return (
      <div className="bg-white rounded p-3 shadow-md border border-gray-200">
        {data?.time_period && <div className="font-bold">{displayDate}</div>}

        {data?.count && (
          <div className="mt-1">
            {chartConfig?.total?.label}: <b>{data?.count}</b>
          </div>
        )}
      </div>
    );
  }
  return null;
};
export function formatTimePeriods(data: TaskVolumeState[]) {
  return data.map((item) => {
    const { time_period } = item;
    let display_period = time_period;
    if (
      typeof time_period === "string" &&
      /^\d{2}-[A-Za-z]{3}-\d{4}$/.test(time_period)
    ) {
      const [day, month] = time_period.split("-");
      display_period = `${parseInt(day)} ${month}`;
    } else if (
      typeof time_period === "string" &&
      /^[A-Za-z]{3} \d{2} - [A-Za-z]{3} \d{2}, \d{4}$/.test(time_period)
    ) {
      display_period = time_period.split("-")[0].trim();
    }
    return { ...item, display_period };
  });
}

export function UsageChart({ taskVolumeState }: TaskVolumeStateProps) {
  if (!taskVolumeState || taskVolumeState.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-[400px]">
        <p className="text-muted-foreground text-xl">No data available</p>{" "}
      </div>
    );
  }
  const formattedData = formatTimePeriods(taskVolumeState);
  return (
    <ChartContainer config={chartConfig} className="h-[400px] w-full">
      <BarChart
        data={formattedData}
        margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="display_period"
          fontSize="0.8vw"
          tickLine={false}
          axisLine={false}
          angle={-45}
          textAnchor="end"
          interval={0}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="total"
          fill={chartConfig.total.color}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}
