/**
 * TriNode LLM Architecture
 * 
 * Bridges Termux backend (Qwen Reflex + Gemma Oracle + DeepSeek Warfare)
 * with real-time WebSocket dashboard
 */

import { exec } from "child_process";
import { promisify } from "util";
import type { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";

const execAsync = promisify(exec);

export interface TriNodeMessage {
  type: "query" | "response" | "status" | "error";
  node?: "reflex" | "oracle" | "warfare" | "consensus";
  timestamp: number;
  data: unknown;
  lambda?: number;
}

export interface NodeStatus {
  name: string;
  online: boolean;
  lastUpdate: number;
  model: string;
  responseTime?: number;
}

export interface TriNodeState {
  reflex: NodeStatus;
  oracle: NodeStatus;
  warfare: NodeStatus;
  lambdaHistory: number[];
  lastConsensus?: {
    timestamp: number;
    result: string;
    lambda: number;
  };
}

class TriNodeLLMBridge {
  private wss: WebSocketServer;
  private state: TriNodeState;
  private termuxHost: string;
  private termuxPort: number;

  constructor(server: Server, termuxHost = "localhost", termuxPort = 8765) {
    this.wss = new WebSocketServer({ server, path: "/ws/trinode" });
    this.termuxHost = termuxHost;
    this.termuxPort = termuxPort;

    this.state = {
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
    };

    this.setupWebSocketServer();
    this.initializeHealthCheck();
  }

  private setupWebSocketServer() {
    this.wss.on("connection", (ws: WebSocket) => {
      console.log("[TriNode] Client connected");

      // Send initial state
      ws.send(
        JSON.stringify({
          type: "status",
          data: this.state,
          timestamp: Date.now(),
        } as TriNodeMessage)
      );

      ws.on("message", (message: string) => {
        this.handleClientMessage(ws, message);
      });

      ws.on("close", () => {
        console.log("[TriNode] Client disconnected");
      });
    });
  }

  private async handleClientMessage(ws: WebSocket, message: string) {
    try {
      const msg = JSON.parse(message) as TriNodeMessage;

      switch (msg.type) {
        case "query":
          await this.handleQuery(ws, msg);
          break;
        case "status":
          this.broadcastStatus();
          break;
        default:
          ws.send(
            JSON.stringify({
              type: "error",
              data: "Unknown message type",
              timestamp: Date.now(),
            } as TriNodeMessage)
          );
      }
    } catch (error) {
      ws.send(
        JSON.stringify({
          type: "error",
          data: error instanceof Error ? error.message : "Unknown error",
          timestamp: Date.now(),
        } as TriNodeMessage)
      );
    }
  }

  private async handleQuery(ws: WebSocket, msg: TriNodeMessage) {
    const query = msg.data as string;

    // Execute all three nodes in parallel
    const [reflexResponse, oracleResponse, warfareResponse] = await Promise.all(
      [
        this.executeReflex(query),
        this.executeOracle(query),
        this.executeWarfare(query),
      ]
    );

    // Calculate consensus lambda
    const lambda = this.calculateLambda(
      reflexResponse,
      oracleResponse,
      warfareResponse
    );

    // Store in history
    this.state.lambdaHistory.push(lambda);
    if (this.state.lambdaHistory.length > 100) {
      this.state.lambdaHistory.shift();
    }

    // Send individual responses
    ws.send(
      JSON.stringify({
        type: "response",
        node: "reflex",
        data: reflexResponse,
        lambda: lambda * 0.95, // Reflex slightly lower
        timestamp: Date.now(),
      } as TriNodeMessage)
    );

    ws.send(
      JSON.stringify({
        type: "response",
        node: "oracle",
        data: oracleResponse,
        lambda: lambda,
        timestamp: Date.now(),
      } as TriNodeMessage)
    );

    ws.send(
      JSON.stringify({
        type: "response",
        node: "warfare",
        data: warfareResponse,
        lambda: lambda * 1.05, // Warfare slightly higher
        timestamp: Date.now(),
      } as TriNodeMessage)
    );

    // Send consensus
    this.state.lastConsensus = {
      timestamp: Date.now(),
      result: `Consensus reached: ${reflexResponse.substring(0, 50)}...`,
      lambda,
    };

    ws.send(
      JSON.stringify({
        type: "response",
        node: "consensus",
        data: this.state.lastConsensus,
        lambda,
        timestamp: Date.now(),
      } as TriNodeMessage)
    );

    this.broadcastStatus();
  }

  private async executeReflex(query: string): Promise<string> {
    try {
      const startTime = Date.now();
      // In production, this would call the actual Termux backend
      const response = `[Reflex] Fast response to: ${query.substring(0, 30)}...`;
      const responseTime = Date.now() - startTime;

      this.state.reflex.online = true;
      this.state.reflex.lastUpdate = Date.now();
      this.state.reflex.responseTime = responseTime;

      return response;
    } catch (error) {
      this.state.reflex.online = false;
      throw error;
    }
  }

  private async executeOracle(query: string): Promise<string> {
    try {
      const startTime = Date.now();
      // In production, this would call the actual Termux backend
      const response = `[Oracle] Deep insight on: ${query.substring(0, 30)}...`;
      const responseTime = Date.now() - startTime;

      this.state.oracle.online = true;
      this.state.oracle.lastUpdate = Date.now();
      this.state.oracle.responseTime = responseTime;

      return response;
    } catch (error) {
      this.state.oracle.online = false;
      throw error;
    }
  }

  private async executeWarfare(query: string): Promise<string> {
    try {
      const startTime = Date.now();
      // In production, this would call the actual Termux backend
      const response = `[Warfare] Code implementation for: ${query.substring(0, 30)}...`;
      const responseTime = Date.now() - startTime;

      this.state.warfare.online = true;
      this.state.warfare.lastUpdate = Date.now();
      this.state.warfare.responseTime = responseTime;

      return response;
    } catch (error) {
      this.state.warfare.online = false;
      throw error;
    }
  }

  private calculateLambda(
    reflex: string,
    oracle: string,
    warfare: string
  ): number {
    // Simple lambda calculation based on response quality
    // In production, this would use actual truth-resonance metrics
    const baseScore = 1.667; // Resonance threshold
    const qualityBonus = (reflex.length + oracle.length + warfare.length) / 300;
    return Math.min(baseScore + qualityBonus * 0.5, 2.2);
  }

  private broadcastStatus() {
    this.broadcastStatusToClients();
  }

  private initializeHealthCheck() {
    // Check node health every 30 seconds
    setInterval(() => {
      this.broadcastStatus();
    }, 30000);
  }

  private broadcastStatusToClients() {
    const message = JSON.stringify({
      type: "status",
      data: this.state,
      timestamp: Date.now(),
    } as TriNodeMessage);

    this.wss.clients.forEach((client: WebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  public getState(): TriNodeState {
    return this.state;
  }
}

export function initializeTriNodeBridge(server: Server): TriNodeLLMBridge {
  return new TriNodeLLMBridge(server);
}
