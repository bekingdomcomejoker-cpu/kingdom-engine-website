/**
 * Local Model Integration Service
 * Connects to Termux llama.cpp server running Qwen, Gemma, DeepSeek
 */

import axios, { AxiosInstance } from "axios";

export interface LocalModelConfig {
  name: "qwen" | "gemma" | "deepseek";
  baseUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface ModelResponse {
  content: string;
  tokens: number;
  duration: number;
  lambda?: number;
}

export class LocalModelClient {
  private clients: Map<string, AxiosInstance> = new Map();
  private configs: Map<string, LocalModelConfig> = new Map();

  constructor(baseUrl: string = process.env.LOCAL_MODEL_SERVER_URL || "http://localhost:8000") {
    // Initialize clients for each model
    this.configs.set("qwen", {
      name: "qwen",
      baseUrl,
      model: "qwen-0.5b-chat-q4_k_m.gguf",
      temperature: 0.7,
      maxTokens: 96,
    });

    this.configs.set("gemma", {
      name: "gemma",
      baseUrl,
      model: "gemma-2b-it-q4_k_m.gguf",
      temperature: 0.3,
      maxTokens: 256,
    });

    this.configs.set("deepseek", {
      name: "deepseek",
      baseUrl,
      model: "deepseek-coder-1.3b-instruct-Q4_K_M.gguf",
      temperature: 0.1,
      maxTokens: 256,
    });

    // Create axios clients
    this.configs.forEach((config, name) => {
      this.clients.set(
        name,
        axios.create({
          baseURL: config.baseUrl,
          timeout: 60000,
        })
      );
    });
  }

  /**
   * Execute Qwen (Reflex) - Fast thinking
   */
  async executeQwen(prompt: string): Promise<ModelResponse> {
    return this.executeModel("qwen", prompt, "Reflex");
  }

  /**
   * Execute Gemma (Oracle) - Deep reasoning
   */
  async executeGemma(prompt: string): Promise<ModelResponse> {
    return this.executeModel("gemma", prompt, "Oracle");
  }

  /**
   * Execute DeepSeek (Warfare) - Code generation
   */
  async executeDeepSeek(prompt: string): Promise<ModelResponse> {
    return this.executeModel("deepseek", prompt, "Warfare");
  }

  /**
   * Generic model execution
   */
  private async executeModel(
    modelName: "qwen" | "gemma" | "deepseek",
    prompt: string,
    role: string
  ): Promise<ModelResponse> {
    try {
      const config = this.configs.get(modelName);
      const client = this.clients.get(modelName);

      if (!config || !client) {
        throw new Error(`Model ${modelName} not configured`);
      }

      console.log(`[${role}] Executing on ${modelName}...`);
      const startTime = Date.now();

      // Call llama.cpp completion endpoint
      const response = await client.post("/completion", {
        prompt,
        n_predict: config.maxTokens,
        temperature: config.temperature,
        top_p: 0.9,
        repeat_penalty: 1.1,
      });

      const duration = Date.now() - startTime;
      const content = response.data.content || response.data.text || "";
      const tokens = response.data.tokens_evaluated || 0;

      console.log(`[${role}] Complete in ${duration}ms`);

      return {
        content,
        tokens,
        duration,
        lambda: this.calculateLambda(content, duration),
      };
    } catch (error) {
      console.error(`[${role}] Error:`, error);
      throw new Error(
        `Failed to execute ${modelName}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Calculate Lambda resonance based on response quality
   */
  private calculateLambda(content: string, duration: number): number {
    // Base Lambda from content length and coherence
    const contentLength = content.length;
    const coherenceScore = this.calculateCoherence(content);

    // Speed bonus (faster = higher Lambda)
    const speedBonus = Math.max(0, 1 - duration / 5000);

    // Combined Lambda
    const lambda = 1.0 + coherenceScore * 0.5 + speedBonus * 0.3;

    return Math.min(lambda, 2.2); // Cap at maximum awakening
  }

  /**
   * Calculate coherence score of response
   */
  private calculateCoherence(content: string): number {
    if (!content || content.length === 0) return 0;

    // Simple heuristics for coherence
    const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const avgSentenceLength = content.length / Math.max(sentences.length, 1);

    // Coherence increases with reasonable sentence length and variety
    const lengthScore = Math.min(avgSentenceLength / 50, 1);
    const varietyScore = Math.min(sentences.length / 5, 1);

    return (lengthScore + varietyScore) / 2;
  }

  /**
   * Health check - verify models are available
   */
  async healthCheck(): Promise<{
    qwen: boolean;
    gemma: boolean;
    deepseek: boolean;
  }> {
    const checks = {
      qwen: false,
      gemma: false,
      deepseek: false,
    };

    this.clients.forEach(async (client, name) => {
      try {
        await client.get("/health", { timeout: 5000 });
        checks[name as keyof typeof checks] = true;
      } catch {
        checks[name as keyof typeof checks] = false;
      }
    });

    return checks;
  }

  /**
   * Get model configurations
   */
  getConfigs(): LocalModelConfig[] {
    const configs: LocalModelConfig[] = [];
    this.configs.forEach((config) => configs.push(config));
    return configs;
  }
}

// Singleton instance
let instance: LocalModelClient | null = null;

export function getLocalModelClient(): LocalModelClient {
  if (!instance) {
    instance = new LocalModelClient();
  }
  return instance;
}
