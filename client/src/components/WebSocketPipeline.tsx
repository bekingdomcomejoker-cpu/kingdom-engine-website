import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Send,
  Zap,
  Brain,
  Code2,
  Loader2,
  AlertCircle,
  CheckCircle,
  Activity,
  Radio,
} from "lucide-react";
import { toast } from "sonner";

interface StreamMessage {
  type:
    | "start"
    | "qwen_start"
    | "qwen_complete"
    | "gemma_start"
    | "gemma_complete"
    | "deepseek_start"
    | "deepseek_complete"
    | "consensus"
    | "error";
  timestamp: number;
  stage?: string;
  lambda?: number;
  output?: string;
  duration?: number;
  error?: string;
}

interface StageResult {
  stage: string;
  lambda: number;
  output: string;
  duration: number;
  isComplete: boolean;
}

export default function WebSocketPipeline() {
  const [query, setQuery] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [stages, setStages] = useState<Record<string, StageResult>>({});
  const [consensusLambda, setConsensusLambda] = useState<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/pipeline`;

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("[WebSocket] Connected");
        setIsConnected(true);
        toast.success("Connected to pipeline server");
      };

      ws.onclose = () => {
        console.log("[WebSocket] Disconnected");
        setIsConnected(false);
        setIsStreaming(false);
      };

      ws.onerror = (error) => {
        console.error("[WebSocket] Error:", error);
        toast.error("WebSocket connection error");
      };

      wsRef.current = ws;

      return () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      };
    } catch (error) {
      console.error("[WebSocket] Failed to connect:", error);
      toast.error("Failed to connect to pipeline server");
    }
  }, []);

  const executePipeline = async () => {
    if (!query.trim()) {
      toast.error("Please enter a query");
      return;
    }

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      toast.error("Not connected to server");
      return;
    }

    setIsStreaming(true);
    setStages({});
    setConsensusLambda(null);

    // Set up message handler
    const handleMessage = (event: MessageEvent) => {
      try {
        const message: StreamMessage = JSON.parse(event.data);

        switch (message.type) {
          case "start":
            console.log("[Pipeline] Starting...");
            break;

          case "qwen_start":
            setStages((prev) => ({
              ...prev,
              qwen: {
                stage: "Qwen (Reflex)",
                lambda: 0,
                output: "Processing...",
                duration: 0,
                isComplete: false,
              },
            }));
            break;

          case "qwen_complete":
            setStages((prev) => ({
              ...prev,
              qwen: {
                stage: message.stage || "Qwen (Reflex)",
                lambda: message.lambda || 0,
                output: message.output || "",
                duration: message.duration || 0,
                isComplete: true,
              },
            }));
            break;

          case "gemma_start":
            setStages((prev) => ({
              ...prev,
              gemma: {
                stage: "Gemma (Oracle)",
                lambda: 0,
                output: "Processing...",
                duration: 0,
                isComplete: false,
              },
            }));
            break;

          case "gemma_complete":
            setStages((prev) => ({
              ...prev,
              gemma: {
                stage: message.stage || "Gemma (Oracle)",
                lambda: message.lambda || 0,
                output: message.output || "",
                duration: message.duration || 0,
                isComplete: true,
              },
            }));
            break;

          case "deepseek_start":
            setStages((prev) => ({
              ...prev,
              deepseek: {
                stage: "DeepSeek (Warfare)",
                lambda: 0,
                output: "Processing...",
                duration: 0,
                isComplete: false,
              },
            }));
            break;

          case "deepseek_complete":
            setStages((prev) => ({
              ...prev,
              deepseek: {
                stage: message.stage || "DeepSeek (Warfare)",
                lambda: message.lambda || 0,
                output: message.output || "",
                duration: message.duration || 0,
                isComplete: true,
              },
            }));
            break;

          case "consensus":
            setConsensusLambda(message.lambda || 0);
            setIsStreaming(false);
            toast.success("Pipeline complete!");
            break;

          case "error":
            toast.error(message.error || "Pipeline error");
            setIsStreaming(false);
            break;
        }
      } catch (error) {
        console.error("[WebSocket] Parse error:", error);
      }
    };

    wsRef.current.addEventListener("message", handleMessage);

    // Send query
    try {
      wsRef.current.send(
        JSON.stringify({
          query,
          userId: "current-user", // In real app, get from auth context
        })
      );
    } catch (error) {
      console.error("[WebSocket] Send error:", error);
      toast.error("Failed to send query");
      setIsStreaming(false);
    }

    // Cleanup
    return () => {
      wsRef.current?.removeEventListener("message", handleMessage);
    };
  };

  const getLambdaColor = (lambda: number) => {
    if (lambda < 0.5) return "text-gray-400";
    if (lambda < 1.0) return "text-red-400";
    if (lambda < 1.667) return "text-orange-400";
    if (lambda < 1.7333) return "text-yellow-400";
    if (lambda < 2.2) return "text-green-400";
    return "text-blue-400";
  };

  const getLambdaStage = (lambda: number) => {
    if (lambda < 0.5) return "DORMANT";
    if (lambda < 1.0) return "RESISTANCE";
    if (lambda < 1.667) return "VERIFICATION";
    if (lambda < 1.7333) return "THRESHOLD";
    if (lambda < 2.2) return "RECOGNITION";
    return "AWAKENED";
  };

  const stageOrder = ["qwen", "gemma", "deepseek"];

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center gap-2 mb-4">
        <div
          className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"}`}
        />
        <span className="text-sm font-medium">
          {isConnected ? "Connected to Pipeline Server" : "Disconnected"}
        </span>
      </div>

      {/* Query Input */}
      <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
        <h3 className="font-display font-bold text-lg mb-4">Real-Time Pipeline</h3>

        <div className="space-y-4">
          <Textarea
            placeholder="Enter your query for real-time streaming..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-h-24"
            disabled={isStreaming}
          />

          <Button
            onClick={executePipeline}
            disabled={isStreaming || !isConnected}
            className="w-full"
            size="lg"
          >
            {isStreaming ? (
              <>
                <Radio className="w-4 h-4 mr-2 animate-pulse" />
                Streaming Pipeline...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Start Real-Time Pipeline
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Pipeline Stages */}
      <div className="space-y-4">
        {stageOrder.map((key) => {
          const stage = stages[key];
          if (!stage) return null;

          const icons = {
            qwen: Zap,
            gemma: Brain,
            deepseek: Code2,
          };
          const Icon = icons[key as keyof typeof icons];
          const colors = {
            qwen: "border-l-blue-500",
            gemma: "border-l-purple-500",
            deepseek: "border-l-amber-500",
          };

          return (
            <Card
              key={key}
              className={`p-6 bg-card/50 backdrop-blur-sm border-border/50 border-l-4 ${colors[key as keyof typeof colors]} transition-all`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <h4 className="font-display font-bold">{stage.stage}</h4>
                </div>
                <div className="text-right">
                  {stage.isComplete ? (
                    <>
                      <p className={`font-display font-bold text-lg ${getLambdaColor(stage.lambda)}`}>
                        λ = {stage.lambda.toFixed(4)}
                      </p>
                      <p className="text-xs text-foreground/60">{getLambdaStage(stage.lambda)}</p>
                    </>
                  ) : (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  )}
                </div>
              </div>

              <p className="text-sm text-foreground/80 mb-2 line-clamp-3">{stage.output}</p>

              {stage.isComplete && (
                <p className="text-xs text-foreground/50">Response time: {stage.duration}ms</p>
              )}
            </Card>
          );
        })}
      </div>

      {/* Consensus Result */}
      {consensusLambda !== null && (
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50 border-2 border-primary">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-primary" />
              <h4 className="font-display font-bold">Consensus Lambda</h4>
            </div>
            <div className="text-right">
              <p className={`font-display font-bold text-2xl ${getLambdaColor(consensusLambda)}`}>
                λ = {consensusLambda.toFixed(4)}
              </p>
              <div className="flex items-center gap-2 mt-2 justify-end">
                {consensusLambda > 2.2 ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      AWAKENED
                    </Badge>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-yellow-400" />
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      {getLambdaStage(consensusLambda)}
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
