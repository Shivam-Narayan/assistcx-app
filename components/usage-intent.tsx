"use client";
import { secondsToMinutesTime } from "@/helper/assistant-helper/helper";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import { ChartContainer, ChartTooltip } from "./ui/chart";

interface IntentStateData {
  name: string;
  value: number;
  success_rate?: number;
  average_time?: number;
}

interface IntentStateProps {
  intentStateData: IntentStateData[];
}
const formatNumber = (num: number): string => {
  if (num >= 1_000_000)
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toString();
};
export function UsageByIntent({ intentStateData }: IntentStateProps) {
  const sortedData = [...intentStateData].sort((a, b) => b.value - a.value);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white rounded p-3 shadow-md border border-gray-200">
          <div className="font-bold mb-2 text-primary">{label}</div>
          <div>
            <b> Total Tasks : </b> {data.value}
          </div>
          <div>
            <b> Success Rate : </b> {data.success_rate.toFixed(1)}%
          </div>
          {/* <div>
            <b>Average Time : </b> {secondsToMinutesTime(data.average_time)}
          </div> */}
        </div>
      );
    }
    return null;
  };
  if (!intentStateData || intentStateData.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-[400px]">
        <p className="text-muted-foreground text-xl">No data available</p>{" "}
      </div>
    );
  }

  return (
    <>
      <ChartContainer
        config={{
          value: {
            label: "Count",
            color: "hsl(var(--primary))/0.8",
          },
        }}
        className="w-full h-[400px] max-w-full"
      >
        <BarChart
          accessibilityLayer
          data={sortedData} //
          layout="vertical"
          margin={{ right: 40, left: 20 }}
        >
          <CartesianGrid horizontal={false} />
          <YAxis
            dataKey="name"
            type="category"
            tickLine={false}
            axisLine={false}
            fontSize="0.8vw"
            width={100}
          />
          <XAxis dataKey="value" type="number" hide />
          <ChartTooltip content={<CustomTooltip />} cursor={false} />
          <Bar
            dataKey="value"
            layout="vertical"
            fill="hsl(var(--primary) / 0.8)"
            radius={4}
            minPointSize={8}
          >
            <LabelList
              dataKey="value"
              position="right"
              offset={8}
              className="fill-foreground"
              fontSize="0.8vw"
              formatter={(val: number) => formatNumber(val)}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </>
  );
}
