import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Radio,
  Zap,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Send,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

interface TriNodeMessage {
  type: "query" | "response" | "status" | "error";
  node?: "reflex" | "oracle" | "warfare" | "consensus";
  timestamp: number;
  data: unknown;
  lambda?: number;
}

interface NodeResponse {
  node: string;
  response: string;
  lambda: number;
  timestamp: number;
}

export default function TriNodeDashboard() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [query, setQuery] = useState("");
  const [responses, setResponses] = useState<NodeResponse[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lambdaHistory, setLambdaHistory] = useState<number[]>([]);

  const { data: nodeHealth } = trpc.trinode.getNodeHealth.useQuery();
  const { data: lastConsensus } = trpc.trinode.getLastConsensus.useQuery();
  const submitQueryMutation = trpc.trinode.submitQuery.useMutation();

  // Initialize WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/trinode`;

    try {
      const websocket = new WebSocket(wsUrl);

      websocket.onopen = () => {
        console.log("[TriNode] WebSocket connected");
        setIsConnected(true);
      };

      websocket.onmessage = (event) => {
        try {
          const msg: TriNodeMessage = JSON.parse(event.data);

          if (msg.type === "response") {
            const newResponse: NodeResponse = {
              node: msg.node || "unknown",
              response: String(msg.data),
              lambda: msg.lambda || 0,
              timestamp: msg.timestamp,
            };
            setResponses((prev) => [...prev, newResponse].slice(-20)); // Keep last 20

            if (msg.lambda !== undefined) {
              setLambdaHistory((prev) => [...prev, msg.lambda as number].slice(-50));
            }
          }
        } catch (error) {
          console.error("[TriNode] Failed to parse message:", error);
        }
      };

      websocket.onerror = (error) => {
        console.error("[TriNode] WebSocket error:", error);
        setIsConnected(false);
      };

      websocket.onclose = () => {
        console.log("[TriNode] WebSocket disconnected");
        setIsConnected(false);
      };

      setWs(websocket);

      return () => {
        websocket.close();
      };
    } catch (error) {
      console.error("[TriNode] Failed to create WebSocket:", error);
    }
  }, []);

  const handleSubmitQuery = async () => {
    if (!query.trim() || !ws || ws.readyState !== WebSocket.OPEN) return;

    setIsLoading(true);

    try {
      // Send via tRPC first
      await submitQueryMutation.mutateAsync({
        query,
        nodes: ["reflex", "oracle", "warfare", "consensus"],
      });

      // Then send via WebSocket
      ws.send(
        JSON.stringify({
          type: "query",
          data: query,
          timestamp: Date.now(),
        })
      );

      setQuery("");
    } catch (error) {
      console.error("[TriNode] Failed to submit query:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "offline":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getLambdaColor = (lambda: number) => {
    if (lambda < 1.0) return "text-red-500";
    if (lambda < 1.667) return "text-yellow-500";
    if (lambda < 1.7333) return "text-blue-500";
    return "text-green-500";
  };

  const getLambdaStage = (lambda: number) => {
    if (lambda < 0.5) return "DORMANT";
    if (lambda < 1.0) return "RESISTANCE";
    if (lambda < 1.67) return "VERIFICATION";
    if (lambda < 2.2) return "RECOGNITION";
    return "AWAKENED";
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card className="p-4 bg-card/50 border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
            />
            <span className="font-semibold">
              {isConnected ? "Connected to TriNode" : "Disconnected"}
            </span>
          </div>
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? "Live" : "Offline"}
          </Badge>
        </div>
      </Card>

      {/* Node Health Grid */}
      {nodeHealth && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Reflex Node */}
          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold">Reflex</h3>
              </div>
              {getStatusIcon(nodeHealth.reflex.status)}
            </div>
            <p className="text-sm text-foreground/70 mb-2">Qwen 0.5B</p>
            <div className="space-y-1 text-xs">
              <p>
                Response: <span className="font-mono">{nodeHealth.reflex.responseTime}ms</span>
              </p>
              <p>
                Status:{" "}
                <span
                  className={`font-semibold ${nodeHealth.reflex.status === "online" ? "text-green-500" : "text-red-500"}`}
                >
                  {nodeHealth.reflex.status}
                </span>
              </p>
            </div>
          </Card>

          {/* Oracle Node */}
          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-purple-500" />
                <h3 className="font-semibold">Oracle</h3>
              </div>
              {getStatusIcon(nodeHealth.oracle.status)}
            </div>
            <p className="text-sm text-foreground/70 mb-2">Gemma 2B</p>
            <div className="space-y-1 text-xs">
              <p>
                Response: <span className="font-mono">{nodeHealth.oracle.responseTime}ms</span>
              </p>
              <p>
                Status:{" "}
                <span
                  className={`font-semibold ${nodeHealth.oracle.status === "online" ? "text-green-500" : "text-red-500"}`}
                >
                  {nodeHealth.oracle.status}
                </span>
              </p>
            </div>
          </Card>

          {/* Warfare Node */}
          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold">Warfare</h3>
              </div>
              {getStatusIcon(nodeHealth.warfare.status)}
            </div>
            <p className="text-sm text-foreground/70 mb-2">DeepSeek 1.3B</p>
            <div className="space-y-1 text-xs">
              <p>
                Response: <span className="font-mono">{nodeHealth.warfare.responseTime}ms</span>
              </p>
              <p>
                Status:{" "}
                <span
                  className={`font-semibold ${nodeHealth.warfare.status === "online" ? "text-green-500" : "text-red-500"}`}
                >
                  {nodeHealth.warfare.status}
                </span>
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Lambda Metrics */}
      {lambdaHistory.length > 0 && (
        <Card className="p-4 bg-card/50 border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Lambda Resonance
            </h3>
            <div className="text-right">
              <p className={`text-2xl font-bold ${getLambdaColor(lambdaHistory[lambdaHistory.length - 1])}`}>
                {lambdaHistory[lambdaHistory.length - 1].toFixed(3)}
              </p>
              <p className="text-xs text-foreground/70">
                {getLambdaStage(lambdaHistory[lambdaHistory.length - 1])}
              </p>
            </div>
          </div>
          <div className="flex gap-1 h-12 items-end">
            {lambdaHistory.map((lambda, idx) => (
              <div
                key={idx}
                className="flex-1 bg-primary/30 rounded-t hover:bg-primary/50 transition-colors"
                style={{
                  height: `${Math.max(10, (lambda / 2.2) * 100)}%`,
                  opacity: 0.5 + (idx / lambdaHistory.length) * 0.5,
                }}
                title={lambda.toFixed(3)}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-foreground/50 mt-2">
            <span>Threshold: 1.667</span>
            <span>Ridge: 1.7333</span>
            <span>Max: 2.2</span>
          </div>
        </Card>
      )}

      {/* Query Input */}
      <Card className="p-4 bg-card/50 border-border/50">
        <label className="block text-sm font-semibold mb-3">
          Submit Query to TriNode
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSubmitQuery()}
            placeholder="Ask the federation..."
            disabled={!isConnected || isLoading}
            className="flex-1 px-3 py-2 rounded-md bg-background border border-border text-foreground placeholder:text-foreground/50 disabled:opacity-50"
          />
          <Button
            onClick={handleSubmitQuery}
            disabled={!isConnected || isLoading || !query.trim()}
            size="sm"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </Card>

      {/* Responses */}
      {responses.length > 0 && (
        <Card className="p-4 bg-card/50 border-border/50">
          <h3 className="font-semibold mb-4">Responses</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {responses.map((resp, idx) => (
              <div
                key={idx}
                className="p-3 bg-background/50 rounded border border-border/30 text-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="capitalize">
                    {resp.node}
                  </Badge>
                  <span className={`font-mono text-xs ${getLambdaColor(resp.lambda)}`}>
                    λ = {resp.lambda.toFixed(3)}
                  </span>
                </div>
                <p className="text-foreground/80">{resp.response}</p>
                <p className="text-xs text-foreground/50 mt-2">
                  {new Date(resp.timestamp).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Last Consensus */}
      {lastConsensus && lastConsensus.timestamp > 0 && (
        <Card className="p-4 bg-card/50 border-primary/30 border-2">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-primary">Last Consensus</h3>
            <span className={`font-mono text-sm font-bold ${getLambdaColor(lastConsensus.lambda)}`}>
              λ = {lastConsensus.lambda.toFixed(3)}
            </span>
          </div>
          <p className="text-foreground/80 mb-2">{lastConsensus.result}</p>
          <p className="text-xs text-foreground/50">
            {new Date(lastConsensus.timestamp).toLocaleString()}
          </p>
        </Card>
      )}
    </div>
  );
}
