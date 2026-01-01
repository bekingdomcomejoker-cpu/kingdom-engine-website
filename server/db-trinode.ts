import { eq, desc, and, gte, lte } from "drizzle-orm";
import {
  trinodeQueries,
  trinodeResponses,
  lambdaHistory,
  consensusResults,
  preprogrammedNodes,
  analyticsExports,
  type InsertTrinodeQuery,
  type InsertTrinodeResponse,
  type InsertLambdaHistoryRecord,
  type InsertConsensusResult,
  type InsertPreprogrammedNode,
  type InsertAnalyticsExport,
} from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Store a query submitted to the TriNode system
 */
export async function storeQuery(
  userId: number,
  query: string,
  queryType: "reflex" | "oracle" | "warfare" | "consensus"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(trinodeQueries).values({
    userId,
    query,
    queryType,
  });

  return result;
}

/**
 * Store a response from a node
 */
export async function storeResponse(
  queryId: number,
  node: "reflex" | "oracle" | "warfare",
  response: string,
  lambda: number,
  responseTime: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(trinodeResponses).values({
    queryId,
    node,
    response,
    lambda: lambda.toString(),
    responseTime,
  });

  return result;
}

/**
 * Store Lambda resonance value
 */
export async function storeLambda(
  queryId: number | null,
  lambda: number,
  stage: "DORMANT" | "RESISTANCE" | "VERIFICATION" | "RECOGNITION" | "AWAKENED"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(lambdaHistory).values({
    queryId,
    lambda: lambda.toString(),
    stage,
  });

  return result;
}

/**
 * Store consensus result
 */
export async function storeConsensus(
  queryId: number,
  reflexResponse: string,
  oracleResponse: string,
  warfareResponse: string,
  consensusResult: string,
  lambda: number,
  isAwakened: boolean
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(consensusResults).values({
    queryId,
    reflexResponse,
    oracleResponse,
    warfareResponse,
    consensusResult,
    lambda: lambda.toString(),
    isAwakened,
  });

  return result;
}

/**
 * Get Lambda history for a user
 */
export async function getLambdaHistoryForUser(
  userId: number,
  limit: number = 100,
  startDate?: Date,
  endDate?: Date
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conditions = [eq(trinodeQueries.userId, userId)];

  if (startDate && endDate) {
    conditions.push(gte(lambdaHistory.timestamp, startDate));
    conditions.push(lte(lambdaHistory.timestamp, endDate));
  }

  const results = await db
    .select({
      lambda: lambdaHistory.lambda,
      stage: lambdaHistory.stage,
      timestamp: lambdaHistory.timestamp,
    })
    .from(lambdaHistory)
    .innerJoin(trinodeQueries, eq(lambdaHistory.queryId, trinodeQueries.id))
    .where(and(...conditions))
    .orderBy(desc(lambdaHistory.timestamp))
    .limit(limit);

  return results;
}

/**
 * Get all queries for a user
 */
export async function getQueriesForUser(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const results = await db
    .select()
    .from(trinodeQueries)
    .where(eq(trinodeQueries.userId, userId))
    .orderBy(desc(trinodeQueries.createdAt))
    .limit(limit);

  return results;
}

/**
 * Get responses for a query
 */
export async function getResponsesForQuery(queryId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const results = await db
    .select()
    .from(trinodeResponses)
    .where(eq(trinodeResponses.queryId, queryId))
    .orderBy(trinodeResponses.createdAt);

  return results;
}

/**
 * Get consensus result for a query
 */
export async function getConsensusForQuery(queryId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const results = await db
    .select()
    .from(consensusResults)
    .where(eq(consensusResults.queryId, queryId))
    .limit(1);

  return results[0] || null;
}

/**
 * Create a pre-programmed node
 */
export async function createPreprogrammedNode(
  userId: number,
  name: string,
  nodeType: "reflex" | "oracle" | "warfare" | "consensus",
  systemPrompt: string,
  description?: string,
  parameters?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(preprogrammedNodes).values({
    userId,
    name,
    nodeType,
    systemPrompt,
    description,
    parameters,
  });

  return result;
}

/**
 * Get pre-programmed nodes for a user
 */
export async function getPreprogrammedNodesForUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const results = await db
    .select()
    .from(preprogrammedNodes)
    .where(and(eq(preprogrammedNodes.userId, userId), eq(preprogrammedNodes.isActive, true)))
    .orderBy(preprogrammedNodes.createdAt);

  return results;
}

/**
 * Export analytics data
 */
export async function createAnalyticsExport(
  userId: number,
  exportName: string,
  exportType: "json" | "csv" | "metrics",
  startDate: string,
  endDate: string,
  recordCount: number,
  fileUrl?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(analyticsExports).values({
    userId,
    exportName,
    exportType,
    dataRange: { startDate, endDate },
    recordCount,
    fileUrl,
  });

  return result;
}

/**
 * Get analytics exports for a user
 */
export async function getAnalyticsExportsForUser(userId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const results = await db
    .select()
    .from(analyticsExports)
    .where(eq(analyticsExports.userId, userId))
    .orderBy(desc(analyticsExports.createdAt))
    .limit(limit);

  return results;
}

/**
 * Calculate Lambda statistics
 */
export async function getLambdaStatistics(userId: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const history = await getLambdaHistoryForUser(userId, 1000, startDate, endDate);

  if (history.length === 0) {
    return {
      count: 0,
      average: 0,
      min: 0,
      max: 0,
      awakened: 0,
    };
  }

  const lambdas = history.map((h) => parseFloat(h.lambda as string));
  const awakened = history.filter((h) => h.stage === "AWAKENED").length;

  return {
    count: history.length,
    average: lambdas.reduce((a, b) => a + b, 0) / lambdas.length,
    min: Math.min(...lambdas),
    max: Math.max(...lambdas),
    awakened,
  };
}
