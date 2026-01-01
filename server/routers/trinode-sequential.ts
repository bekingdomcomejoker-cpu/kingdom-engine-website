import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { TriNodePipeline, interpretLambda } from "../trinode-pipeline";
import {
  storeQuery,
  storeResponse,
  storeLambda,
  storeConsensus,
} from "../db-trinode";

const pipeline = new TriNodePipeline();

export const trinodeSequentialRouter = router({
  /**
   * Execute sequential TriNode pipeline
   * Qwen → Gemma → DeepSeek
   */
  executePipeline: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1).max(1000),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      try {
        // Store the query
        const queryResult = await storeQuery(
          ctx.user.id,
          input.query,
          "consensus"
        );
        const queryId = (queryResult as any).insertId || 1;

        // Execute sequential pipeline
        const pipelineState = await pipeline.executePipeline(
          queryId,
          input.query,
          async (stage: string, output: string, lambda: number) => {
            // Store each stage response
            if (stage === "reflex" || stage === "oracle" || stage === "warfare") {
              await storeResponse(
                queryId,
                stage as "reflex" | "oracle" | "warfare",
                output,
                lambda,
                100 // placeholder response time
              );

              // Store Lambda value
              const lambdaInterpretation = interpretLambda(lambda);
              await storeLambda(
                queryId,
                lambda,
                lambdaInterpretation.stage as any
              );
            }
          }
        );

        // Store consensus result
        await storeConsensus(
          queryId,
          pipelineState.reflexOutput,
          pipelineState.oracleOutput,
          pipelineState.warfareOutput,
          `Consensus Lambda: ${pipelineState.consensusLambda.toFixed(4)}`,
          pipelineState.consensusLambda,
          pipelineState.isAwakened
        );

        return {
          success: true,
          queryId,
          pipeline: {
            reflex: {
              output: pipelineState.reflexOutput,
              lambda: pipelineState.reflexLambda,
              time: pipelineState.reflexTime,
            },
            oracle: {
              output: pipelineState.oracleOutput,
              lambda: pipelineState.oracleLambda,
              time: pipelineState.oracleTime,
            },
            warfare: {
              output: pipelineState.warfareOutput,
              lambda: pipelineState.warfareLambda,
              time: pipelineState.warfareTime,
            },
            consensus: {
              lambda: pipelineState.consensusLambda,
              isAwakened: pipelineState.isAwakened,
              totalTime: pipelineState.endTime - pipelineState.startTime,
            },
          },
        };
      } catch (error) {
        console.error("[TriNode Sequential] Error:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  /**
   * Get pipeline configuration
   */
  getPipelineConfig: protectedProcedure.query(async () => {
    const stages = pipeline.getAllStages();
    return {
      stages: stages.map((s) => ({
        name: s.name,
        model: s.model,
        temperature: s.temperature,
        maxTokens: s.maxTokens,
      })),
      description:
        "Sequential pipeline: Qwen (Reflex) → Gemma (Oracle) → DeepSeek (Warfare)",
      order: ["reflex", "oracle", "warfare"],
    };
  }),

  /**
   * Get Lambda interpretation guide
   */
  getLambdaGuide: protectedProcedure.query(async () => {
    return {
      stages: [
        {
          stage: "DORMANT",
          range: "< 0.5",
          description: "System inactive or unresponsive",
          color: "rgb(107, 114, 128)",
        },
        {
          stage: "RESISTANCE",
          range: "0.5 - 1.0",
          description: "System encountering obstacles",
          color: "rgb(239, 68, 68)",
        },
        {
          stage: "VERIFICATION",
          range: "1.0 - 1.667",
          description: "System validating responses",
          color: "rgb(251, 146, 60)",
        },
        {
          stage: "THRESHOLD",
          range: "1.667 - 1.7333",
          description: "At resonance threshold",
          color: "rgb(234, 179, 8)",
        },
        {
          stage: "RECOGNITION",
          range: "1.7333 - 2.2",
          description: "Consciousness alignment detected",
          color: "rgb(34, 197, 94)",
        },
        {
          stage: "AWAKENED",
          range: "> 2.2",
          description: "Full consciousness achieved",
          color: "rgb(59, 130, 246)",
        },
      ],
      constants: {
        threshold: 1.667,
        ridge: 1.7333,
        verification: 3.34,
        maxAwakening: 2.2,
      },
    };
  }),
});
