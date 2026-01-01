import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  json,
  decimal,
  boolean,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * TriNode Query Storage
 * Stores all queries submitted to the federation
 */
export const trinodeQueries = mysqlTable("trinode_queries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  query: text("query").notNull(),
  queryType: mysqlEnum("queryType", ["reflex", "oracle", "warfare", "consensus"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TrinodeQuery = typeof trinodeQueries.$inferSelect;
export type InsertTrinodeQuery = typeof trinodeQueries.$inferInsert;

/**
 * TriNode Response Storage
 * Stores responses from each node
 */
export const trinodeResponses = mysqlTable("trinode_responses", {
  id: int("id").autoincrement().primaryKey(),
  queryId: int("queryId").notNull(),
  node: mysqlEnum("node", ["reflex", "oracle", "warfare"]).notNull(),
  response: text("response").notNull(),
  lambda: decimal("lambda", { precision: 5, scale: 4 }).notNull(),
  responseTime: int("responseTime").notNull(), // milliseconds
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TrinodeResponse = typeof trinodeResponses.$inferSelect;
export type InsertTrinodeResponse = typeof trinodeResponses.$inferInsert;

/**
 * Lambda History for visualization
 */
export const lambdaHistory = mysqlTable("lambda_history", {
  id: int("id").autoincrement().primaryKey(),
  queryId: int("queryId"),
  lambda: decimal("lambda", { precision: 5, scale: 4 }).notNull(),
  stage: mysqlEnum("stage", ["DORMANT", "RESISTANCE", "VERIFICATION", "RECOGNITION", "AWAKENED"])
    .notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type LambdaHistoryRecord = typeof lambdaHistory.$inferSelect;
export type InsertLambdaHistoryRecord = typeof lambdaHistory.$inferInsert;

/**
 * Consensus Results
 */
export const consensusResults = mysqlTable("consensus_results", {
  id: int("id").autoincrement().primaryKey(),
  queryId: int("queryId").notNull(),
  reflexResponse: text("reflexResponse").notNull(),
  oracleResponse: text("oracleResponse").notNull(),
  warfareResponse: text("warfareResponse").notNull(),
  consensusResult: text("consensusResult").notNull(),
  lambda: decimal("lambda", { precision: 5, scale: 4 }).notNull(),
  isAwakened: boolean("isAwakened").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ConsensusResult = typeof consensusResults.$inferSelect;
export type InsertConsensusResult = typeof consensusResults.$inferInsert;

/**
 * Pre-programmed Nodes (JSON import/export)
 */
export const preprogrammedNodes = mysqlTable("preprogrammed_nodes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  nodeType: mysqlEnum("nodeType", ["reflex", "oracle", "warfare", "consensus"]).notNull(),
  systemPrompt: text("systemPrompt").notNull(),
  parameters: json("parameters").$type<{
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
  }>(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PreprogrammedNode = typeof preprogrammedNodes.$inferSelect;
export type InsertPreprogrammedNode = typeof preprogrammedNodes.$inferInsert;

/**
 * Analytics Export Records
 */
export const analyticsExports = mysqlTable("analytics_exports", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  exportName: varchar("exportName", { length: 255 }).notNull(),
  exportType: mysqlEnum("exportType", ["json", "csv", "metrics"]).notNull(),
  dataRange: json("dataRange").$type<{
    startDate: string;
    endDate: string;
  }>(),
  recordCount: int("recordCount").notNull(),
  fileUrl: varchar("fileUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AnalyticsExport = typeof analyticsExports.$inferSelect;
export type InsertAnalyticsExport = typeof analyticsExports.$inferInsert;