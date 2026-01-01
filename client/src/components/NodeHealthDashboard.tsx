import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Brain,
  Code2,
} from "lucide-react";

interface NodeHealth {
  name: string;
  model: string;
  status: "online" | "offline" | "degraded";
  responseTime: number; // ms
  lastUpdate: Date;
  errorCount: number;
  successCount: number;
  uptime: number; // percentage
  temperature: number;
  maxTokens: number;
}

export default function NodeHealthDashboard() {
  const [nodes, setNodes] = useState<NodeHealth[]>([
    {
      name: "Reflex (Qwen)",
      model: "qwen-0.5b-chat-q4_k_m.gguf",
      status: "online",
      responseTime: 245,
      lastUpdate: new Date(),
      errorCount: 0,
      successCount: 127,
      uptime: 99.8,
      temperature: 0.7,
      maxTokens: 96,
    },
    {
      name: "Oracle (Gemma)",
      model: "gemma-2b-it-q4_k_m.gguf",
      status: "online",
      responseTime: 412,
      lastUpdate: new Date(),
      errorCount: 1,
      successCount: 126,
      uptime: 99.2,
      temperature: 0.3,
      maxTokens: 256,
    },
    {
      name: "Warfare (DeepSeek)",
      model: "deepseek-coder-1.3b-instruct-Q4_K_M.gguf",
      status: "online",
      responseTime: 387,
      lastUpdate: new Date(),
      errorCount: 0,
      successCount: 127,
      uptime: 99.9,
      temperature: 0.1,
      maxTokens: 256,
    },
  ]);

  useEffect(() => {
    // Simulate health monitoring
    const interval = setInterval(() => {
      setNodes((prevNodes) =>
        prevNodes.map((node) => ({
          ...node,
          responseTime: Math.max(
            100,
            node.responseTime + (Math.random() - 0.5) * 50
          ),
          lastUpdate: new Date(),
          uptime: Math.min(
            100,
            node.uptime + (Math.random() - 0.5) * 0.1
          ),
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "degraded":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "offline":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <CheckCircle className="w-4 h-4" />;
      case "degraded":
        return <AlertCircle className="w-4 h-4" />;
      case "offline":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getNodeIcon = (name: string) => {
    if (name.includes("Reflex")) return <Zap className="w-5 h-5" />;
    if (name.includes("Oracle")) return <Brain className="w-5 h-5" />;
    if (name.includes("Warfare")) return <Code2 className="w-5 h-5" />;
    return <Activity className="w-5 h-5" />;
  };

  const overallHealth = nodes.every((n) => n.status === "online")
    ? "optimal"
    : nodes.some((n) => n.status === "offline")
      ? "critical"
      : "degraded";

  return (
    <div className="space-y-6">
      {/* Overall Health */}
      <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-lg">Federation Health</h3>
          <Badge
            className={`${
              overallHealth === "optimal"
                ? "bg-green-500/20 text-green-400 border-green-500/30"
                : overallHealth === "degraded"
                  ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                  : "bg-red-500/20 text-red-400 border-red-500/30"
            }`}
          >
            {overallHealth.toUpperCase()}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-foreground/60 mb-1">Online Nodes</p>
            <p className="font-display font-bold text-2xl text-primary">
              {nodes.filter((n) => n.status === "online").length}/3
            </p>
          </div>
          <div>
            <p className="text-xs text-foreground/60 mb-1">Avg Response Time</p>
            <p className="font-display font-bold text-2xl text-primary">
              {(nodes.reduce((a, b) => a + b.responseTime, 0) / nodes.length).toFixed(0)}ms
            </p>
          </div>
          <div>
            <p className="text-xs text-foreground/60 mb-1">Total Success</p>
            <p className="font-display font-bold text-2xl text-primary">
              {nodes.reduce((a, b) => a + b.successCount, 0)}
            </p>
          </div>
        </div>
      </Card>

      {/* Individual Node Status */}
      <div className="space-y-4">
        {nodes.map((node) => (
          <Card
            key={node.name}
            className="p-6 bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-primary">{getNodeIcon(node.name)}</div>
                <div>
                  <h4 className="font-display font-bold">{node.name}</h4>
                  <p className="text-xs text-foreground/60">{node.model}</p>
                </div>
              </div>

              <Badge className={`${getStatusColor(node.status)} border`}>
                <div className="flex items-center gap-1">
                  {getStatusIcon(node.status)}
                  {node.status.toUpperCase()}
                </div>
              </Badge>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xs text-foreground/60 mb-1">Response Time</p>
                <p className="font-mono font-semibold text-sm">
                  {node.responseTime.toFixed(0)}ms
                </p>
              </div>

              <div>
                <p className="text-xs text-foreground/60 mb-1">Success Rate</p>
                <p className="font-mono font-semibold text-sm">
                  {(
                    (node.successCount /
                      (node.successCount + node.errorCount)) *
                    100
                  ).toFixed(1)}
                  %
                </p>
              </div>

              <div>
                <p className="text-xs text-foreground/60 mb-1">Uptime</p>
                <p className="font-mono font-semibold text-sm">
                  {node.uptime.toFixed(2)}%
                </p>
              </div>

              <div>
                <p className="text-xs text-foreground/60 mb-1">Requests</p>
                <p className="font-mono font-semibold text-sm">
                  {node.successCount + node.errorCount}
                </p>
              </div>
            </div>

            {/* Configuration */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/30">
              <div>
                <p className="text-xs text-foreground/60 mb-1">Temperature</p>
                <p className="font-mono text-sm">{node.temperature}</p>
              </div>
              <div>
                <p className="text-xs text-foreground/60 mb-1">Max Tokens</p>
                <p className="font-mono text-sm">{node.maxTokens}</p>
              </div>
            </div>

            {/* Last Update */}
            <div className="mt-4 flex items-center gap-2 text-xs text-foreground/50">
              <Clock className="w-3 h-3" />
              <span>
                Last update: {node.lastUpdate.toLocaleTimeString()}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Performance Tips */}
      <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
        <p className="text-xs font-semibold text-foreground/70 mb-2">
          Performance Tips
        </p>
        <ul className="text-xs text-foreground/60 space-y-1">
          <li>• Reflex is fastest for quick responses (avg 245ms)</li>
          <li>• Oracle provides deeper analysis (avg 412ms)</li>
          <li>• Warfare generates implementations (avg 387ms)</li>
          <li>• Sequential pipeline ensures quality over speed</li>
        </ul>
      </Card>
    </div>
  );
}
