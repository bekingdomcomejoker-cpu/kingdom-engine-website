import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getLocalModelClient } from "../local-models";
import { getOrangeAlphabetDecoder } from "../orange-alphabet";
import { getPhaseLockSynchronizer } from "../phase-lock";
import { storeQuery, storeResponse, storeLambda, storeConsensus } from "../db-trinode";

const localModelClient = getLocalModelClient();
const orangeDecoder = getOrangeAlphabetDecoder();
const phaseLock = getPhaseLockSynchronizer();

export const localAIRouter = router({
  /**
   * Execute sequential pipeline with local models
   * Qwen → Gemma → DeepSeek (each receives previous output)
   */
  executeSequentialPipeline: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1).max(1000),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      try {
        // Store query
        const queryResult = await storeQuery(ctx.user.id, input.query, "consensus");
        const queryId = (queryResult as any).insertId || 1;

        // Stage 1: Qwen (Reflex) - Fast thinking
        console.log("[Pipeline] Stage 1: Qwen (Reflex)");
        const qwenResponse = await localModelClient.executeQwen(input.query);
        await storeResponse(queryId, "reflex", qwenResponse.content, qwenResponse.lambda || 1.5, qwenResponse.duration);

        // Stage 2: Gemma (Oracle) - Deep reasoning
        // Receives: original query + Qwen output
        console.log("[Pipeline] Stage 2: Gemma (Oracle)");
        const oracleInput = `Original Query: ${input.query}\n\nQwen's Response: ${qwenResponse.content}`;
        const gemmaResponse = await localModelClient.executeGemma(oracleInput);
        await storeResponse(queryId, "oracle", gemmaResponse.content, gemmaResponse.lambda || 1.6, gemmaResponse.duration);

        // Stage 3: DeepSeek (Warfare) - Code generation
        // Receives: original query + Qwen output + Gemma output
        console.log("[Pipeline] Stage 3: DeepSeek (Warfare)");
        const warfareInput = `Original Query: ${input.query}\n\nQwen's Response: ${qwenResponse.content}\n\nGemma's Analysis: ${gemmaResponse.content}`;
        const deepseekResponse = await localModelClient.executeDeepSeek(warfareInput);
        await storeResponse(queryId, "warfare", deepseekResponse.content, deepseekResponse.lambda || 1.7, deepseekResponse.duration);

        // Calculate consensus Lambda
        const consensusLambda = (
          (qwenResponse.lambda || 1.5) * 0.2 +
          (gemmaResponse.lambda || 1.6) * 0.3 +
          (deepseekResponse.lambda || 1.7) * 0.5
        );

        const isAwakened = consensusLambda > 2.2;

        // Store consensus
        await storeConsensus(
          queryId,
          qwenResponse.content,
          gemmaResponse.content,
          deepseekResponse.content,
          `Consensus Lambda: ${consensusLambda.toFixed(4)}`,
          consensusLambda,
          isAwakened
        );

        return {
          success: true,
          queryId,
          pipeline: {
            qwen: {
              output: qwenResponse.content,
              lambda: qwenResponse.lambda || 1.5,
              time: qwenResponse.duration,
            },
            gemma: {
              output: gemmaResponse.content,
              lambda: gemmaResponse.lambda || 1.6,
              time: gemmaResponse.duration,
            },
            deepseek: {
              output: deepseekResponse.content,
              lambda: deepseekResponse.lambda || 1.7,
              time: deepseekResponse.duration,
            },
            consensus: {
              lambda: consensusLambda,
              isAwakened,
            },
          },
        };
      } catch (error) {
        console.error("[Local AI] Error:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  /**
   * Decode response using Orange Alphabet
   */
  decodeWithOrangeAlphabet: protectedProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query(async ({ input }: any) => {
      try {
        // Decode text
        const encodings = orangeDecoder.decode(input.text);

        // Analyze patterns
        const patterns = orangeDecoder.analyzePatterns(input.text);

        // Run compression truth test
        const truthTest = orangeDecoder.compressionTruthTest(input.text);

        // Calculate Lambda
        const lambda = orangeDecoder.calculateLambda(patterns);

        return {
          success: true,
          encodings,
          patterns,
          truthTest,
          lambda,
        };
      } catch (error) {
        console.error("[Orange Alphabet] Error:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  /**
   * Get phase-lock synchronization status
   */
  getPhaseLockStatus: protectedProcedure.query(async () => {
    try {
      const report = phaseLock.getReport();
      return {
        success: true,
        report,
      };
    } catch (error) {
      console.error("[Phase Lock] Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }),

  /**
   * Trigger self-correction
   */
  triggerSelfCorrection: protectedProcedure.mutation(async () => {
    try {
      phaseLock.selfCorrect();
      const report = phaseLock.getReport();

      return {
        success: true,
        message: "Self-correction triggered",
        report,
      };
    } catch (error) {
      console.error("[Phase Lock] Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }),

  /**
   * Check local model health
   */
  checkModelHealth: protectedProcedure.query(async () => {
    try {
      const health = await localModelClient.healthCheck();
      const configs = localModelClient.getConfigs();

      return {
        success: true,
        health,
        configs: configs.map((c) => ({
          name: c.name,
          model: c.model,
          temperature: c.temperature,
          maxTokens: c.maxTokens,
        })),
      };
    } catch (error) {
      console.error("[Model Health] Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }),
});
