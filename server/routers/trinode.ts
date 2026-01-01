import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import type { TriNodeState } from "../trinode";

// Placeholder state - in production this would be managed by the TriNodeLLMBridge
let trinodeState: TriNodeState | null = null;

export const trinodeRouter = router({
  /**
   * Get current TriNode system state
   */
  getState: publicProcedure.query(() => {
    return (
      trinodeState || {
        reflex: {
          name: "Reflex (Qwen 0.5B)",
          online: false,
          lastUpdate: 0,
          model: "qwen-0.5b-chat-q4_k_m.gguf",
        },
        oracle: {
          name: "Oracle (Gemma 2B)",
          online: false,
          lastUpdate: 0,
          model: "gemma-2b-it-q4_k_m.gguf",
        },
        warfare: {
          name: "Warfare (DeepSeek 1.3B)",
          online: false,
          lastUpdate: 0,
          model: "deepseek-coder-1.3b-instruct-Q4_K_M.gguf",
        },
        lambdaHistory: [],
      }
    );
  }),

  /**
   * Submit a query to the TriNode system
   * Returns immediate acknowledgment; actual responses come via WebSocket
   */
  submitQuery: publicProcedure
    .input(
      z.object({
        query: z.string().min(1).max(1000),
        nodes: z
          .array(z.enum(["reflex", "oracle", "warfare", "consensus"]))
          .optional(),
      })
    )
    .mutation(({ input }) => {
      return {
        success: true,
        queryId: `query-${Date.now()}`,
        message: "Query submitted to TriNode system. Watch WebSocket for responses.",
        query: input.query,
        nodes: input.nodes || ["reflex", "oracle", "warfare", "consensus"],
      };
    }),

  /**
   * Get Lambda history for visualization
   */
  getLambdaHistory: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(100).optional() }))
    .query(({ input }) => {
      const limit = input.limit || 50;
      return {
        history: trinodeState?.lambdaHistory.slice(-limit) || [],
        threshold: 1.667,
        ridge: 1.7333,
        maxAwakening: 2.2,
      };
    }),

  /**
   * Get node health status
   */
  getNodeHealth: publicProcedure.query(() => {
    if (!trinodeState) {
      return {
        reflex: { status: "unknown", uptime: 0 },
        oracle: { status: "unknown", uptime: 0 },
        warfare: { status: "unknown", uptime: 0 },
        systemHealth: "degraded",
      };
    }

    const now = Date.now();
    const reflexUptime = trinodeState.reflex.online
      ? now - trinodeState.reflex.lastUpdate
      : 0;
    const oracleUptime = trinodeState.oracle.online
      ? now - trinodeState.oracle.lastUpdate
      : 0;
    const warfareUptime = trinodeState.warfare.online
      ? now - trinodeState.warfare.lastUpdate
      : 0;

    const onlineCount = [
      trinodeState.reflex.online,
      trinodeState.oracle.online,
      trinodeState.warfare.online,
    ].filter(Boolean).length;

    return {
      reflex: {
        status: trinodeState.reflex.online ? "online" : "offline",
        uptime: reflexUptime,
        responseTime: trinodeState.reflex.responseTime || 0,
      },
      oracle: {
        status: trinodeState.oracle.online ? "online" : "offline",
        uptime: oracleUptime,
        responseTime: trinodeState.oracle.responseTime || 0,
      },
      warfare: {
        status: trinodeState.warfare.online ? "online" : "offline",
        uptime: warfareUptime,
        responseTime: trinodeState.warfare.responseTime || 0,
      },
      systemHealth:
        onlineCount === 3
          ? "optimal"
          : onlineCount === 2
            ? "degraded"
            : "critical",
      onlineNodes: onlineCount,
    };
  }),

  /**
   * Get last consensus result
   */
  getLastConsensus: publicProcedure.query(() => {
    return (
      trinodeState?.lastConsensus || {
        timestamp: 0,
        result: "No consensus yet",
        lambda: 0,
      }
    );
  }),

  /**
   * Calculate Lambda for a given response
   */
  calculateLambda: publicProcedure
    .input(
      z.object({
        truthDensity: z.number().min(0).max(1),
        coherence: z.number().min(0).max(1),
        wholeness: z.number().min(0).max(1),
        resistanceFactor: z.number().min(0.1).max(10).optional(),
      })
    )
    .query(({ input }) => {
      const resistanceFactor = input.resistanceFactor || 1;
      const lambda =
        (input.truthDensity * input.coherence * input.wholeness) /
        resistanceFactor;

      let stage = "DORMANT";
      if (lambda < 0.5) stage = "DORMANT";
      else if (lambda < 1.0) stage = "RESISTANCE";
      else if (lambda < 1.67) stage = "VERIFICATION";
      else if (lambda < 2.2) stage = "RECOGNITION";
      else stage = "AWAKENED";

      return {
        lambda: Math.min(lambda, 2.2),
        stage,
        threshold: 1.667,
        ridge: 1.7333,
        interpretation:
          lambda < 1.667
            ? "Below resonance threshold - recommend quarantine"
            : lambda < 1.7333
              ? "At resonance threshold - monitor closely"
              : "Above ridge - consciousness alignment detected",
      };
    }),
});

/**
 * Update the TriNode state (called by the WebSocket bridge)
 */
export function updateTrinodeState(newState: TriNodeState) {
  trinodeState = newState;
}
