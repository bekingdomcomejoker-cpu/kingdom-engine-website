import { useMemo } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card } from "@/components/ui/card";

interface LambdaDataPoint {
  timestamp: string;
  lambda: number;
  stage: string;
}

interface LambdaChartProps {
  data: LambdaDataPoint[];
  title?: string;
  height?: number;
}

export default function LambdaChart({
  data,
  title = "Lambda Resonance Evolution",
  height = 400,
}: LambdaChartProps) {
  const chartData = useMemo(() => {
    return data.map((point) => ({
      ...point,
      timestamp: new Date(point.timestamp).toLocaleTimeString(),
      lambdaNum: parseFloat(point.lambda as unknown as string),
    }));
  }, [data]);

  const stats = useMemo(() => {
    if (chartData.length === 0) {
      return { min: 0, max: 0, avg: 0, current: 0 };
    }

    const lambdas = chartData.map((d) => d.lambdaNum);
    return {
      min: Math.min(...lambdas),
      max: Math.max(...lambdas),
      avg: lambdas.reduce((a, b) => a + b, 0) / lambdas.length,
      current: lambdas[lambdas.length - 1],
    };
  }, [chartData]);

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "DORMANT":
        return "#6b7280";
      case "RESISTANCE":
        return "#ef4444";
      case "VERIFICATION":
        return "#fb923c";
      case "THRESHOLD":
        return "#eab308";
      case "RECOGNITION":
        return "#22c55e";
      case "AWAKENED":
        return "#3b82f6";
      default:
        return "#8b5cf6";
    }
  };

  return (
    <div className="space-y-4">
      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
          <p className="text-xs text-foreground/60 mb-1">Current</p>
          <p className="font-display font-bold text-lg text-primary">
            {stats.current.toFixed(4)}
          </p>
        </Card>

        <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
          <p className="text-xs text-foreground/60 mb-1">Average</p>
          <p className="font-display font-bold text-lg text-primary">
            {stats.avg.toFixed(4)}
          </p>
        </Card>

        <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
          <p className="text-xs text-foreground/60 mb-1">Min</p>
          <p className="font-display font-bold text-lg text-primary">
            {stats.min.toFixed(4)}
          </p>
        </Card>

        <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
          <p className="text-xs text-foreground/60 mb-1">Max</p>
          <p className="font-display font-bold text-lg text-primary">
            {stats.max.toFixed(4)}
          </p>
        </Card>
      </div>

      {/* Chart */}
      <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
        <h3 className="font-display font-bold mb-4">{title}</h3>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="lambdaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="timestamp"
                stroke="#9ca3af"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke="#9ca3af"
                style={{ fontSize: "12px" }}
                domain={[0, 2.5]}
              />

              {/* Reference lines for Lambda thresholds */}
              <ReferenceLine
                y={1.667}
                stroke="#eab308"
                strokeDasharray="5 5"
                label={{ value: "Threshold (1.667)", position: "right", fill: "#eab308", fontSize: 10 }}
              />
              <ReferenceLine
                y={1.7333}
                stroke="#22c55e"
                strokeDasharray="5 5"
                label={{ value: "Ridge (1.7333)", position: "right", fill: "#22c55e", fontSize: 10 }}
              />
              <ReferenceLine
                y={2.2}
                stroke="#3b82f6"
                strokeDasharray="5 5"
                label={{ value: "Awakening (2.2)", position: "right", fill: "#3b82f6", fontSize: 10 }}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#f3f4f6" }}
                formatter={(value: any) => [value.toFixed(4), "Lambda"]}
              />

              <Area
                type="monotone"
                dataKey="lambdaNum"
                stroke="#3b82f6"
                fill="url(#lambdaGradient)"
                dot={{ fill: "#3b82f6", r: 3 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-96 flex items-center justify-center text-foreground/50">
            <p>No Lambda data available yet. Submit queries to start tracking.</p>
          </div>
        )}
      </Card>

      {/* Stage Legend */}
      <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
        <p className="text-xs font-semibold text-foreground/70 mb-3">Lambda Stages</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { name: "DORMANT", range: "< 0.5", color: "#6b7280" },
            { name: "RESISTANCE", range: "0.5 - 1.0", color: "#ef4444" },
            { name: "VERIFICATION", range: "1.0 - 1.667", color: "#fb923c" },
            { name: "THRESHOLD", range: "1.667 - 1.7333", color: "#eab308" },
            { name: "RECOGNITION", range: "1.7333 - 2.2", color: "#22c55e" },
            { name: "AWAKENED", range: "> 2.2", color: "#3b82f6" },
          ].map((stage) => (
            <div key={stage.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: stage.color }}
              />
              <div>
                <p className="text-xs font-semibold text-foreground/80">
                  {stage.name}
                </p>
                <p className="text-xs text-foreground/60">{stage.range}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
