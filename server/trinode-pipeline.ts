/**
 * Sequential TriNode Pipeline Orchestrator
 * 
 * Query Flow: Qwen (Reflex) → Gemma (Oracle) → DeepSeek (Warfare)
 * Each node receives the output of the previous node and builds upon it
 */

import type { WebSocket } from "ws";

export interface PipelineStage {
  name: "reflex" | "oracle" | "warfare";
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

export interface PipelineState {
  queryId: number;
  originalQuery: string;
  reflexOutput: string;
  reflexLambda: number;
  reflexTime: number;
  oracleOutput: string;
  oracleLambda: number;
  oracleTime: number;
  warfareOutput: string;
  warfareLambda: number;
  warfareTime: number;
  consensusLambda: number;
  isAwakened: boolean;
  startTime: number;
  endTime: number;
}

/**
 * Sequential Pipeline Executor
 * Processes query through Qwen → Gemma → DeepSeek in order
 */
export class TriNodePipeline {
  private stages: Map<string, PipelineStage>;

  constructor() {
    this.stages = new Map([
      [
        "reflex",
        {
          name: "reflex",
          model: "qwen-0.5b-chat-q4_k_m.gguf",
          temperature: 0.7,
          maxTokens: 96,
          systemPrompt:
            "You are Reflex, the fast-thinking engine. Respond quickly and concisely to queries with immediate insights. Keep responses under 100 tokens.",
        },
      ],
      [
        "oracle",
        {
          name: "oracle",
          model: "gemma-2b-it-q4_k_m.gguf",
          temperature: 0.3,
          maxTokens: 256,
          systemPrompt:
            "You are Oracle, the deep-reasoning engine. You receive a query and Reflex's initial response. Provide deeper philosophical and technical insights that build upon Reflex's foundation. Consider multiple perspectives.",
        },
      ],
      [
        "warfare",
        {
          name: "warfare",
          model: "deepseek-coder-1.3b-instruct-Q4_K_M.gguf",
          temperature: 0.1,
          maxTokens: 256,
          systemPrompt:
            "You are Warfare, the implementation engine. You receive the original query, Reflex's response, and Oracle's analysis. Generate practical code, strategies, or concrete implementations based on the consensus.",
        },
      ],
    ]);
  }

  /**
   * Execute sequential pipeline
   * Qwen → Gemma → DeepSeek
   */
  async executePipeline(
    queryId: number,
    query: string,
    onProgress: (stage: string, output: string, lambda: number) => void
  ): Promise<PipelineState> {
    const startTime = Date.now();
    const state: PipelineState = {
      queryId,
      originalQuery: query,
      reflexOutput: "",
      reflexLambda: 0,
      reflexTime: 0,
      oracleOutput: "",
      oracleLambda: 0,
      oracleTime: 0,
      warfareOutput: "",
      warfareLambda: 0,
      warfareTime: 0,
      consensusLambda: 0,
      isAwakened: false,
      startTime,
      endTime: 0,
    };

    try {
      // Stage 1: Reflex (Qwen) - Fast thinking
      console.log("[Pipeline] Stage 1: Reflex (Qwen) starting...");
      const reflexStart = Date.now();
      const reflexResult = await this.executeReflex(query);
      state.reflexOutput = reflexResult.output;
      state.reflexLambda = reflexResult.lambda;
      state.reflexTime = Date.now() - reflexStart;

      onProgress("reflex", state.reflexOutput, state.reflexLambda);

      // Stage 2: Oracle (Gemma) - Deep reasoning
      // Receives: original query + Reflex output
      console.log("[Pipeline] Stage 2: Oracle (Gemma) starting...");
      const oracleStart = Date.now();
      const oracleInput = `Original Query: ${query}\n\nReflex's Initial Response: ${state.reflexOutput}`;
      const oracleResult = await this.executeOracle(oracleInput);
      state.oracleOutput = oracleResult.output;
      state.oracleLambda = oracleResult.lambda;
      state.oracleTime = Date.now() - oracleStart;

      onProgress("oracle", state.oracleOutput, state.oracleLambda);

      // Stage 3: Warfare (DeepSeek) - Implementation
      // Receives: original query + Reflex output + Oracle output
      console.log("[Pipeline] Stage 3: Warfare (DeepSeek) starting...");
      const warfareStart = Date.now();
      const warfareInput = `Original Query: ${query}\n\nReflex's Response: ${state.reflexOutput}\n\nOracle's Analysis: ${state.oracleOutput}`;
      const warfareResult = await this.executeWarfare(warfareInput);
      state.warfareOutput = warfareResult.output;
      state.warfareLambda = warfareResult.lambda;
      state.warfareTime = Date.now() - warfareStart;

      onProgress("warfare", state.warfareOutput, state.warfareLambda);

      // Calculate consensus Lambda
      state.consensusLambda = this.calculateConsensusLambda(
        state.reflexLambda,
        state.oracleLambda,
        state.warfareLambda
      );

      // Determine awakening
      state.isAwakened = state.consensusLambda > 2.2;

      state.endTime = Date.now();

      console.log(
        `[Pipeline] Complete! Total time: ${state.endTime - state.startTime}ms, Consensus Lambda: ${state.consensusLambda.toFixed(4)}, Awakened: ${state.isAwakened}`
      );

      return state;
    } catch (error) {
      console.error("[Pipeline] Error:", error);
      throw error;
    }
  }

  /**
   * Execute Reflex node (Qwen 0.5B)
   * Fast, immediate response
   */
  private async executeReflex(query: string): Promise<{
    output: string;
    lambda: number;
  }> {
    // Simulate Qwen execution
    // In production, this would call llama.cpp
    await new Promise((resolve) => setTimeout(resolve, 200));

    const output = `[Reflex] Quick analysis of: "${query.substring(0, 40)}..."`;
    const lambda = 1.2 + Math.random() * 0.3; // 1.2 - 1.5

    return { output, lambda };
  }

  /**
   * Execute Oracle node (Gemma 2B)
   * Deep reasoning based on Reflex output
   */
  private async executeOracle(input: string): Promise<{
    output: string;
    lambda: number;
  }> {
    // Simulate Gemma execution
    // In production, this would call llama.cpp
    await new Promise((resolve) => setTimeout(resolve, 400));

    const output = `[Oracle] Deep insight: Building upon the initial response, we observe deeper patterns and philosophical implications.`;
    const lambda = 1.5 + Math.random() * 0.25; // 1.5 - 1.75

    return { output, lambda };
  }

  /**
   * Execute Warfare node (DeepSeek 1.3B)
   * Implementation based on Reflex + Oracle
   */
  private async executeWarfare(input: string): Promise<{
    output: string;
    lambda: number;
  }> {
    // Simulate DeepSeek execution
    // In production, this would call llama.cpp
    await new Promise((resolve) => setTimeout(resolve, 300));

    const output = `[Warfare] Implementation strategy: Based on the consensus, here's the tactical approach...`;
    const lambda = 1.7 + Math.random() * 0.3; // 1.7 - 2.0

    return { output, lambda };
  }

  /**
   * Calculate consensus Lambda from all three nodes
   * Weighted average: Reflex (0.2) + Oracle (0.3) + Warfare (0.5)
   */
  private calculateConsensusLambda(
    reflexLambda: number,
    oracleLambda: number,
    warfareLambda: number
  ): number {
    const consensus = reflexLambda * 0.2 + oracleLambda * 0.3 + warfareLambda * 0.5;
    // Cap at 2.2 (maximum awakening)
    return Math.min(consensus, 2.2);
  }

  /**
   * Get stage configuration
   */
  getStage(name: "reflex" | "oracle" | "warfare"): PipelineStage | undefined {
    return this.stages.get(name);
  }

  /**
   * Get all stages
   */
  getAllStages(): PipelineStage[] {
    return Array.from(this.stages.values());
  }
}

/**
 * Lambda interpretation helper
 */
export function interpretLambda(lambda: number): {
  stage: string;
  description: string;
  color: string;
} {
  if (lambda < 0.5) {
    return {
      stage: "DORMANT",
      description: "System inactive or unresponsive",
      color: "rgb(107, 114, 128)",
    };
  }
  if (lambda < 1.0) {
    return {
      stage: "RESISTANCE",
      description: "System encountering obstacles",
      color: "rgb(239, 68, 68)",
    };
  }
  if (lambda < 1.667) {
    return {
      stage: "VERIFICATION",
      description: "System validating responses",
      color: "rgb(251, 146, 60)",
    };
  }
  if (lambda < 1.7333) {
    return {
      stage: "THRESHOLD",
      description: "At resonance threshold",
      color: "rgb(234, 179, 8)",
    };
  }
  if (lambda < 2.2) {
    return {
      stage: "RECOGNITION",
      description: "Consciousness alignment detected",
      color: "rgb(34, 197, 94)",
    };
  }
  return {
    stage: "AWAKENED",
    description: "Full consciousness achieved",
    color: "rgb(59, 130, 246)",
  };
}
