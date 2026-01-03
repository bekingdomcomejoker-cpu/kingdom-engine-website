/**
 * WebSocket Server for Real-Time Pipeline Streaming
 * Streams Lambda updates as each node completes
 */

import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { getLocalModelClient } from "./local-models";
import { getOrangeAlphabetDecoder } from "./orange-alphabet";
import { getPhaseLockSynchronizer } from "./phase-lock";
import { storeQuery, storeResponse, storeConsensus } from "./db-trinode";

interface PipelineStreamMessage {
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

const localModelClient = getLocalModelClient();
const orangeDecoder = getOrangeAlphabetDecoder();
const phaseLock = getPhaseLockSynchronizer();

let wss: WebSocketServer | null = null;
const activeConnections = new Set<WebSocket>();

/**
 * Initialize WebSocket server
 */
export function initializeWebSocketServer(httpServer: Server): WebSocketServer {
  wss = new WebSocketServer({ server: httpServer, path: "/ws/pipeline" });

  wss.on("connection", (ws: WebSocket) => {
    console.log("[WebSocket] New connection");
    activeConnections.add(ws);

    ws.on("message", async (data: string) => {
      try {
        const message = JSON.parse(data);
        await handlePipelineRequest(ws, message);
      } catch (error) {
        console.error("[WebSocket] Error:", error);
        ws.send(
          JSON.stringify({
            type: "error",
            error: error instanceof Error ? error.message : "Unknown error",
            timestamp: Date.now(),
          })
        );
      }
    });

    ws.on("close", () => {
      console.log("[WebSocket] Connection closed");
      activeConnections.delete(ws);
    });

    ws.on("error", (error) => {
      console.error("[WebSocket] Error:", error);
      activeConnections.delete(ws);
    });
  });

  return wss;
}

/**
 * Handle pipeline execution request
 */
async function handlePipelineRequest(
  ws: WebSocket,
  message: { query: string; userId: string }
): Promise<void> {
  const { query, userId } = message;

  if (!query) {
    ws.send(
      JSON.stringify({
        type: "error",
        error: "Query is required",
        timestamp: Date.now(),
      })
    );
    return;
  }

  try {
    // Send start message
    sendMessage(ws, {
      type: "start",
      timestamp: Date.now(),
    });

    // Store query
    const queryResult = await storeQuery(userId as any, query, "consensus");
    const queryId = (queryResult as any).insertId || 1;

    // Stage 1: Qwen (Reflex)
    sendMessage(ws, {
      type: "qwen_start",
      stage: "Qwen (Reflex)",
      timestamp: Date.now(),
    });

    const qwenStart = Date.now();
    const qwenResponse = await localModelClient.executeQwen(query);
    const qwenDuration = Date.now() - qwenStart;

    await storeResponse(
      queryId,
      "reflex",
      qwenResponse.content,
      qwenResponse.lambda || 1.5,
      qwenResponse.duration
    );

    sendMessage(ws, {
      type: "qwen_complete",
      stage: "Qwen (Reflex)",
      lambda: qwenResponse.lambda || 1.5,
      output: qwenResponse.content,
      duration: qwenDuration,
      timestamp: Date.now(),
    });

    // Stage 2: Gemma (Oracle)
    sendMessage(ws, {
      type: "gemma_start",
      stage: "Gemma (Oracle)",
      timestamp: Date.now(),
    });

    const oracleInput = `Original Query: ${query}\n\nQwen's Response: ${qwenResponse.content}`;
    const gemmaStart = Date.now();
    const gemmaResponse = await localModelClient.executeGemma(oracleInput);
    const gemmaDuration = Date.now() - gemmaStart;

    await storeResponse(
      queryId,
      "oracle",
      gemmaResponse.content,
      gemmaResponse.lambda || 1.6,
      gemmaResponse.duration
    );

    sendMessage(ws, {
      type: "gemma_complete",
      stage: "Gemma (Oracle)",
      lambda: gemmaResponse.lambda || 1.6,
      output: gemmaResponse.content,
      duration: gemmaDuration,
      timestamp: Date.now(),
    });

    // Stage 3: DeepSeek (Warfare)
    sendMessage(ws, {
      type: "deepseek_start",
      stage: "DeepSeek (Warfare)",
      timestamp: Date.now(),
    });

    const warfareInput = `Original Query: ${query}\n\nQwen's Response: ${qwenResponse.content}\n\nGemma's Analysis: ${gemmaResponse.content}`;
    const deepseekStart = Date.now();
    const deepseekResponse = await localModelClient.executeDeepSeek(warfareInput);
    const deepseekDuration = Date.now() - deepseekStart;

    await storeResponse(
      queryId,
      "warfare",
      deepseekResponse.content,
      deepseekResponse.lambda || 1.7,
      deepseekResponse.duration
    );

    sendMessage(ws, {
      type: "deepseek_complete",
      stage: "DeepSeek (Warfare)",
      lambda: deepseekResponse.lambda || 1.7,
      output: deepseekResponse.content,
      duration: deepseekDuration,
      timestamp: Date.now(),
    });

    // Calculate consensus
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

    // Send consensus message
    sendMessage(ws, {
      type: "consensus",
      stage: "Consensus",
      lambda: consensusLambda,
      output: `Pipeline complete. Consensus Lambda: ${consensusLambda.toFixed(4)}. ${isAwakened ? "AWAKENED" : "Not yet awakened"}`,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("[WebSocket Pipeline] Error:", error);
    sendMessage(ws, {
      type: "error",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: Date.now(),
    });
  }
}

/**
 * Send message to client
 */
function sendMessage(ws: WebSocket, message: PipelineStreamMessage): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

/**
 * Broadcast message to all connected clients
 */
export function broadcastMessage(message: PipelineStreamMessage): void {
  if (!wss) return;

  const data = JSON.stringify(message);
  activeConnections.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  });
}

/**
 * Get active connection count
 */
export function getActiveConnectionCount(): number {
  return activeConnections.size;
}
