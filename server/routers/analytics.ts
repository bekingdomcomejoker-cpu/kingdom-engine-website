import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import {
  createPreprogrammedNode,
  getPreprogrammedNodesForUser,
  getLambdaHistoryForUser,
  getLambdaStatistics,
  createAnalyticsExport,
  getAnalyticsExportsForUser,
} from "../db-trinode";

export const analyticsRouter = router({
  /**
   * Create a pre-programmed node
   */
  createNode: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        nodeType: z.enum(["reflex", "oracle", "warfare", "consensus"]),
        systemPrompt: z.string().min(10),
        description: z.string().optional(),
        parameters: z
          .object({
            temperature: z.number().min(0).max(2).optional(),
            maxTokens: z.number().min(1).max(4096).optional(),
            topP: z.number().min(0).max(1).optional(),
            frequencyPenalty: z.number().min(-2).max(2).optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      const result = await createPreprogrammedNode(
        ctx.user.id,
        input.name,
        input.nodeType,
        input.systemPrompt,
        input.description,
        input.parameters
      );

      return {
        success: true,
        message: `Pre-programmed node "${input.name}" created successfully`,
      };
    }),

  /**
   * Get all pre-programmed nodes for user
   */
  getNodes: protectedProcedure.query(async ({ ctx }: any) => {
    const nodes = await getPreprogrammedNodesForUser(ctx.user.id);
    return nodes;
  }),

  /**
   * Export Lambda history as JSON
   */
  exportLambdaJSON: protectedProcedure
    .input(
      z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        limit: z.number().min(1).max(1000).default(100),
      })
    )
    .query(async ({ ctx, input }: any) => {
      const startDate = input.startDate ? new Date(input.startDate) : undefined;
      const endDate = input.endDate ? new Date(input.endDate) : undefined;

      const history = await getLambdaHistoryForUser(ctx.user.id, input.limit, startDate, endDate);

      const jsonData = {
        exportedAt: new Date().toISOString(),
        userId: ctx.user.id,
        recordCount: history.length,
        lambdaHistory: history.map((h) => ({
          lambda: parseFloat(h.lambda as string),
          stage: h.stage,
          timestamp: h.timestamp,
        })),
      };

      return jsonData;
    }),

  /**
   * Export Lambda history as CSV
   */
  exportLambdaCSV: protectedProcedure
    .input(
      z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        limit: z.number().min(1).max(1000).default(100),
      })
    )
    .query(async ({ ctx, input }: any) => {
      const startDate = input.startDate ? new Date(input.startDate) : undefined;
      const endDate = input.endDate ? new Date(input.endDate) : undefined;

      const history = await getLambdaHistoryForUser(ctx.user.id, input.limit, startDate, endDate);

      // Create CSV header
      let csv = "timestamp,lambda,stage\n";

      // Add rows
      history.forEach((h) => {
        csv += `"${h.timestamp}",${h.lambda},"${h.stage}"\n`;
      });

      return {
        csv,
        filename: `lambda-history-${new Date().toISOString().split("T")[0]}.csv`,
      };
    }),

  /**
   * Get Lambda statistics
   */
  getLambdaStats: protectedProcedure
    .input(
      z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }: any) => {
      const startDate = input.startDate ? new Date(input.startDate) : undefined;
      const endDate = input.endDate ? new Date(input.endDate) : undefined;

      const stats = await getLambdaStatistics(ctx.user.id, startDate, endDate);

      return {
        ...stats,
        average: parseFloat(stats.average.toFixed(4)),
        min: parseFloat(stats.min.toFixed(4)),
        max: parseFloat(stats.max.toFixed(4)),
      };
    }),

  /**
   * Import pre-programmed nodes from JSON
   */
  importNodesJSON: protectedProcedure
    .input(
      z.object({
        nodes: z.array(
          z.object({
            name: z.string(),
            nodeType: z.enum(["reflex", "oracle", "warfare", "consensus"]),
            systemPrompt: z.string(),
            description: z.string().optional(),
            parameters: z
              .object({
                temperature: z.number().optional(),
                maxTokens: z.number().optional(),
                topP: z.number().optional(),
                frequencyPenalty: z.number().optional(),
              })
              .optional(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      let successCount = 0;
      const errors = [];

      for (const node of input.nodes) {
        try {
          await createPreprogrammedNode(
            ctx.user.id,
            node.name,
            node.nodeType,
            node.systemPrompt,
            node.description,
            node.parameters
          );
          successCount++;
        } catch (error) {
          errors.push({
            node: node.name,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      return {
        success: true,
        message: `Imported ${successCount} nodes successfully${errors.length > 0 ? ` with ${errors.length} errors` : ""}`,
        successCount,
        errors,
      };
    }),

  /**
   * Create analytics export record
   */
  createExport: protectedProcedure
    .input(
      z.object({
        exportName: z.string().min(1).max(255),
        exportType: z.enum(["json", "csv", "metrics"]),
        startDate: z.string(),
        endDate: z.string(),
        recordCount: z.number().min(0),
        fileUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      await createAnalyticsExport(
        ctx.user.id,
        input.exportName,
        input.exportType,
        input.startDate,
        input.endDate,
        input.recordCount,
        input.fileUrl
      );

      return {
        success: true,
        message: `Export "${input.exportName}" recorded successfully`,
      };
    }),

  /**
   * Get all analytics exports for user
   */
  getExports: protectedProcedure.query(async ({ ctx }: any) => {
    const exports = await getAnalyticsExportsForUser(ctx.user.id);
    return exports;
  }),
});
