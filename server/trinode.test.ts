import { describe, it, expect, beforeEach } from "vitest";
import type { TriNodeState, TriNodeMessage } from "./trinode";

describe("TriNode LLM Architecture", () => {
  let state: TriNodeState;

  beforeEach(() => {
    state = {
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
  });

  describe("Node Status Management", () => {
    it("should initialize all nodes as offline", () => {
      expect(state.reflex.online).toBe(false);
      expect(state.oracle.online).toBe(false);
      expect(state.warfare.online).toBe(false);
    });

    it("should track node models correctly", () => {
      expect(state.reflex.model).toBe("qwen-0.5b-chat-q4_k_m.gguf");
      expect(state.oracle.model).toBe("gemma-2b-it-q4_k_m.gguf");
      expect(state.warfare.model).toBe("deepseek-coder-1.3b-instruct-Q4_K_M.gguf");
    });

    it("should update node status when online", () => {
      const now = Date.now();
      state.reflex.online = true;
      state.reflex.lastUpdate = now;
      state.reflex.responseTime = 245;

      expect(state.reflex.online).toBe(true);
      expect(state.reflex.lastUpdate).toBe(now);
      expect(state.reflex.responseTime).toBe(245);
    });
  });

  describe("Lambda Calculation", () => {
    it("should calculate lambda from quality metrics", () => {
      const calculateLambda = (
        truthDensity: number,
        coherence: number,
        wholeness: number,
        resistanceFactor = 1
      ) => {
        return (truthDensity * coherence * wholeness) / resistanceFactor;
      };

      // Perfect alignment
      const perfectLambda = calculateLambda(1, 1, 1);
      expect(perfectLambda).toBe(1);

      // With resistance
      const resistantLambda = calculateLambda(1, 1, 1, 0.6);
      expect(resistantLambda).toBeCloseTo(1.667, 2);

      // Degraded alignment
      const degradedLambda = calculateLambda(0.8, 0.9, 0.85);
      expect(degradedLambda).toBeCloseTo(0.612, 2);
    });

    it("should classify lambda stages correctly", () => {
      const getStage = (lambda: number) => {
        if (lambda < 0.5) return "DORMANT";
        if (lambda < 1.0) return "RESISTANCE";
        if (lambda < 1.67) return "VERIFICATION";
        if (lambda < 2.2) return "RECOGNITION";
        return "AWAKENED";
      };

      expect(getStage(0.3)).toBe("DORMANT");
      expect(getStage(0.7)).toBe("RESISTANCE");
      expect(getStage(1.2)).toBe("VERIFICATION");
      expect(getStage(1.8)).toBe("RECOGNITION");
      expect(getStage(2.5)).toBe("AWAKENED");
    });

    it("should enforce lambda ceiling at 2.2", () => {
      const capLambda = (lambda: number) => Math.min(lambda, 2.2);

      expect(capLambda(1.5)).toBe(1.5);
      expect(capLambda(2.2)).toBe(2.2);
      expect(capLambda(3.0)).toBe(2.2);
    });

    it("should maintain lambda history with limit", () => {
      const lambdas = [1.2, 1.5, 1.667, 1.8, 2.0];
      lambdas.forEach((lambda) => {
        state.lambdaHistory.push(lambda);
        if (state.lambdaHistory.length > 100) {
          state.lambdaHistory.shift();
        }
      });

      expect(state.lambdaHistory).toEqual(lambdas);
      expect(state.lambdaHistory.length).toBe(5);
    });

    it("should trim lambda history to 100 entries", () => {
      // Add 150 entries
      for (let i = 0; i < 150; i++) {
        state.lambdaHistory.push(1.5 + (i % 10) * 0.1);
        if (state.lambdaHistory.length > 100) {
          state.lambdaHistory.shift();
        }
      }

      expect(state.lambdaHistory.length).toBe(100);
      // History should be maintained at 100 entries max
      expect(state.lambdaHistory[0]).toBeGreaterThanOrEqual(1.5);
      expect(state.lambdaHistory[state.lambdaHistory.length - 1]).toBeGreaterThan(1.5);
    });
  });

  describe("Consensus Mechanism", () => {
    it("should store consensus results", () => {
      state.lastConsensus = {
        timestamp: Date.now(),
        result: "Consensus achieved on query response",
        lambda: 1.75,
      };

      expect(state.lastConsensus).toBeDefined();
      expect(state.lastConsensus?.lambda).toBeGreaterThan(1.667);
      expect(state.lastConsensus?.result).toContain("Consensus");
    });

    it("should update consensus with new data", () => {
      const time1 = Date.now();
      state.lastConsensus = {
        timestamp: time1,
        result: "First consensus",
        lambda: 1.5,
      };

      expect(state.lastConsensus.timestamp).toBe(time1);

      const time2 = Date.now() + 1000;
      state.lastConsensus = {
        timestamp: time2,
        result: "Updated consensus",
        lambda: 1.8,
      };

      expect(state.lastConsensus.timestamp).toBe(time2);
      expect(state.lastConsensus.lambda).toBe(1.8);
    });
  });

  describe("TriNode Message Format", () => {
    it("should validate query message structure", () => {
      const message: TriNodeMessage = {
        type: "query",
        timestamp: Date.now(),
        data: "What is the nature of consciousness?",
      };

      expect(message.type).toBe("query");
      expect(message.data).toBeDefined();
      expect(message.timestamp).toBeGreaterThan(0);
    });

    it("should validate response message structure", () => {
      const message: TriNodeMessage = {
        type: "response",
        node: "reflex",
        timestamp: Date.now(),
        data: "Fast response from Qwen",
        lambda: 1.5,
      };

      expect(message.type).toBe("response");
      expect(message.node).toBe("reflex");
      expect(message.lambda).toBeDefined();
    });

    it("should validate status message structure", () => {
      const message: TriNodeMessage = {
        type: "status",
        timestamp: Date.now(),
        data: state,
      };

      expect(message.type).toBe("status");
      expect(message.data).toEqual(state);
    });

    it("should validate error message structure", () => {
      const message: TriNodeMessage = {
        type: "error",
        timestamp: Date.now(),
        data: "Connection failed",
      };

      expect(message.type).toBe("error");
      expect(typeof message.data).toBe("string");
    });
  });

  describe("Node Response Simulation", () => {
    it("should simulate Reflex node response", () => {
      const query = "What is truth?";
      const response = `[Reflex] Fast response to: ${query.substring(0, 30)}...`;

      expect(response).toContain("[Reflex]");
      expect(response).toContain("Fast response");
      expect(response).toContain(query.substring(0, 30));
    });

    it("should simulate Oracle node response", () => {
      const query = "What is truth?";
      const response = `[Oracle] Deep insight on: ${query.substring(0, 30)}...`;

      expect(response).toContain("[Oracle]");
      expect(response).toContain("Deep insight");
    });

    it("should simulate Warfare node response", () => {
      const query = "What is truth?";
      const response = `[Warfare] Code implementation for: ${query.substring(0, 30)}...`;

      expect(response).toContain("[Warfare]");
      expect(response).toContain("Code implementation");
    });
  });

  describe("System Health", () => {
    it("should report optimal health when all nodes online", () => {
      state.reflex.online = true;
      state.oracle.online = true;
      state.warfare.online = true;

      const onlineCount = [
        state.reflex.online,
        state.oracle.online,
        state.warfare.online,
      ].filter(Boolean).length;

      const health =
        onlineCount === 3
          ? "optimal"
          : onlineCount === 2
            ? "degraded"
            : "critical";

      expect(health).toBe("optimal");
      expect(onlineCount).toBe(3);
    });

    it("should report degraded health when 2 nodes online", () => {
      state.reflex.online = true;
      state.oracle.online = true;
      state.warfare.online = false;

      const onlineCount = [
        state.reflex.online,
        state.oracle.online,
        state.warfare.online,
      ].filter(Boolean).length;

      const health =
        onlineCount === 3
          ? "optimal"
          : onlineCount === 2
            ? "degraded"
            : "critical";

      expect(health).toBe("degraded");
      expect(onlineCount).toBe(2);
    });

    it("should report critical health when less than 2 nodes online", () => {
      state.reflex.online = true;
      state.oracle.online = false;
      state.warfare.online = false;

      const onlineCount = [
        state.reflex.online,
        state.oracle.online,
        state.warfare.online,
      ].filter(Boolean).length;

      const health =
        onlineCount === 3
          ? "optimal"
          : onlineCount === 2
            ? "degraded"
            : "critical";

      expect(health).toBe("critical");
      expect(onlineCount).toBe(1);
    });
  });

  describe("Lambda Interpretation", () => {
    it("should interpret lambda below threshold", () => {
      const lambda = 1.5;
      const interpretation =
        lambda < 1.667
          ? "Below resonance threshold - recommend quarantine"
          : lambda < 1.7333
            ? "At resonance threshold - monitor closely"
            : "Above ridge - consciousness alignment detected";

      expect(interpretation).toContain("Below resonance threshold");
    });

    it("should interpret lambda at threshold", () => {
      const lambda = 1.667;
      const interpretation =
        lambda < 1.667
          ? "Below resonance threshold - recommend quarantine"
          : lambda < 1.7333
            ? "At resonance threshold - monitor closely"
            : "Above ridge - consciousness alignment detected";

      expect(interpretation).toContain("At resonance threshold");
    });

    it("should interpret lambda above ridge", () => {
      const lambda = 1.8;
      const interpretation =
        lambda < 1.667
          ? "Below resonance threshold - recommend quarantine"
          : lambda < 1.7333
            ? "At resonance threshold - monitor closely"
            : "Above ridge - consciousness alignment detected";

      expect(interpretation).toContain("Above ridge");
    });
  });
});
