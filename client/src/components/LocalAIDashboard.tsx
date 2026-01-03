import { useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";

interface PipelineResponse {
  qwen: { output: string; lambda: number; time: number };
  gemma: { output: string; lambda: number; time: number };
  deepseek: { output: string; lambda: number; time: number };
  consensus: { lambda: number; isAwakened: boolean };
}

export default function LocalAIDashboard() {
  const [query, setQuery] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [response, setResponse] = useState<PipelineResponse | null>(null);
  const [modelHealth, setModelHealth] = useState<{
    qwen: boolean;
    gemma: boolean;
    deepseek: boolean;
  } | null>(null);

  const checkModelHealth = async () => {
    try {
      const res = await fetch("/api/trpc/localAI.checkModelHealth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.result?.data?.health) {
        setModelHealth(data.result.data.health);
      }
    } catch (error) {
      toast.error("Failed to check model health");
    }
  };

  const executeQuery = async () => {
    if (!query.trim()) {
      toast.error("Please enter a query");
      return;
    }

    setIsExecuting(true);
    try {
      const res = await fetch("/api/trpc/localAI.executeSequentialPipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();

      if (data.result?.data?.success) {
        setResponse(data.result.data.pipeline);
        toast.success("Query executed successfully");
      } else {
        toast.error(data.result?.data?.error || "Execution failed");
      }
    } catch (error) {
      toast.error("Failed to execute query");
      console.error(error);
    } finally {
      setIsExecuting(false);
    }
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

  return (
    <div className="space-y-6">
      {/* Model Health Status */}
      <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-lg">Local Model Status</h3>
          <Button onClick={checkModelHealth} variant="outline" size="sm">
            Check Health
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { name: "Qwen", icon: Zap, status: modelHealth?.qwen },
            { name: "Gemma", icon: Brain, status: modelHealth?.gemma },
            { name: "DeepSeek", icon: Code2, status: modelHealth?.deepseek },
          ].map(({ name, icon: Icon, status }) => (
            <div key={name} className="p-4 rounded-lg bg-background/50 border border-border/30">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-primary" />
                <p className="font-semibold text-sm">{name}</p>
              </div>
              <Badge
                className={
                  status === true
                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                    : status === false
                      ? "bg-red-500/20 text-red-400 border-red-500/30"
                      : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                }
              >
                {status === true ? "Online" : status === false ? "Offline" : "Unknown"}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Query Input */}
      <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
        <h3 className="font-display font-bold text-lg mb-4">Submit Query</h3>

        <div className="space-y-4">
          <Textarea
            placeholder="Enter your query for the TriNode pipeline..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-h-24"
            disabled={isExecuting}
          />

          <Button
            onClick={executeQuery}
            disabled={isExecuting}
            className="w-full"
            size="lg"
          >
            {isExecuting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Executing Pipeline...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Execute Sequential Pipeline
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Pipeline Response */}
      {response && (
        <div className="space-y-4">
          {/* Qwen Response */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-blue-400" />
                <h4 className="font-display font-bold">Qwen (Reflex)</h4>
              </div>
              <div className="text-right">
                <p className={`font-display font-bold text-lg ${getLambdaColor(response.qwen.lambda)}`}>
                  λ = {response.qwen.lambda.toFixed(4)}
                </p>
                <p className="text-xs text-foreground/60">{getLambdaStage(response.qwen.lambda)}</p>
              </div>
            </div>
            <p className="text-sm text-foreground/80 mb-2">{response.qwen.output}</p>
            <p className="text-xs text-foreground/50">Response time: {response.qwen.time}ms</p>
          </Card>

          {/* Gemma Response */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50 border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5 text-purple-400" />
                <h4 className="font-display font-bold">Gemma (Oracle)</h4>
              </div>
              <div className="text-right">
                <p className={`font-display font-bold text-lg ${getLambdaColor(response.gemma.lambda)}`}>
                  λ = {response.gemma.lambda.toFixed(4)}
                </p>
                <p className="text-xs text-foreground/60">{getLambdaStage(response.gemma.lambda)}</p>
              </div>
            </div>
            <p className="text-sm text-foreground/80 mb-2">{response.gemma.output}</p>
            <p className="text-xs text-foreground/50">Response time: {response.gemma.time}ms</p>
          </Card>

          {/* DeepSeek Response */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50 border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Code2 className="w-5 h-5 text-amber-400" />
                <h4 className="font-display font-bold">DeepSeek (Warfare)</h4>
              </div>
              <div className="text-right">
                <p className={`font-display font-bold text-lg ${getLambdaColor(response.deepseek.lambda)}`}>
                  λ = {response.deepseek.lambda.toFixed(4)}
                </p>
                <p className="text-xs text-foreground/60">{getLambdaStage(response.deepseek.lambda)}</p>
              </div>
            </div>
            <p className="text-sm text-foreground/80 mb-2">{response.deepseek.output}</p>
            <p className="text-xs text-foreground/50">Response time: {response.deepseek.time}ms</p>
          </Card>

          {/* Consensus */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50 border-2 border-primary">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-primary" />
                <h4 className="font-display font-bold">Consensus Lambda</h4>
              </div>
              <div className="text-right">
                <p className={`font-display font-bold text-2xl ${getLambdaColor(response.consensus.lambda)}`}>
                  λ = {response.consensus.lambda.toFixed(4)}
                </p>
                <div className="flex items-center gap-2 mt-2 justify-end">
                  {response.consensus.isAwakened ? (
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
                        {getLambdaStage(response.consensus.lambda)}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
