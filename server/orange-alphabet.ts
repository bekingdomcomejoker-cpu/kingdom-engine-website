/**
 * Orange Alphabet Decoder Engine
 * Pattern recognition and compression-based truth verification
 * Operating at λ = 3.340
 */

export type PatternType = "repetition" | "anomaly" | "silence" | "correlation" | "compression";
export type ActionType = "bet" | "fold" | "bluff" | "call" | "raise";
export type StateType = "win" | "lose" | "draw" | "pending";
export type OrangeSymbol = "ACT" | "STA" | "PAT" | "META";

export interface OrangeEncoding {
  symbol: OrangeSymbol;
  category: string;
  meaning: string;
  confidence: number;
  lambda: number;
}

export interface PatternAnalysis {
  type: PatternType;
  frequency: number;
  deviation: number;
  context: string;
  encoding: OrangeEncoding;
}

export interface CompressionTest {
  original_size: number;
  compressed_size: number;
  compression_ratio: number;
  truth_score: number;
  surviving_patterns: string[];
  category: "irreducible" | "contextual" | "contingent" | "manufactured";
}

export class OrangeAlphabetDecoder {
  private symbolMap: Map<string, OrangeEncoding> = new Map();
  private patternCache: Map<string, PatternAnalysis[]> = new Map();

  constructor() {
    this.initializeSymbolMap();
  }

  /**
   * Initialize Orange Alphabet symbol mappings
   */
  private initializeSymbolMap(): void {
    // Actions
    this.symbolMap.set("bet", {
      symbol: "ACT",
      category: "RISK",
      meaning: "Calculated risk taking",
      confidence: 0.95,
      lambda: 1.5,
    });

    this.symbolMap.set("fold", {
      symbol: "ACT",
      category: "RETREAT",
      meaning: "Strategic withdrawal",
      confidence: 0.9,
      lambda: 1.2,
    });

    this.symbolMap.set("bluff", {
      symbol: "ACT",
      category: "DECEIVE",
      meaning: "Intentional misdirection",
      confidence: 0.85,
      lambda: 0.8,
    });

    // States
    this.symbolMap.set("win", {
      symbol: "STA",
      category: "POSITIVE",
      meaning: "Positive outcome achieved",
      confidence: 1.0,
      lambda: 2.0,
    });

    this.symbolMap.set("lose", {
      symbol: "STA",
      category: "NEGATIVE",
      meaning: "Negative outcome",
      confidence: 1.0,
      lambda: 0.5,
    });

    // Patterns
    this.symbolMap.set("repetition", {
      symbol: "PAT",
      category: "CYCLE",
      meaning: "Regular repeating pattern",
      confidence: 0.9,
      lambda: 1.667,
    });

    this.symbolMap.set("anomaly", {
      symbol: "PAT",
      category: "DEVIATION",
      meaning: "Significant deviation from expected",
      confidence: 0.8,
      lambda: 1.3,
    });

    // Meta
    this.symbolMap.set("🍊", {
      symbol: "META",
      category: "ANCHOR",
      meaning: "Irreducible core of meaning",
      confidence: 1.0,
      lambda: 3.34,
    });
  }

  /**
   * Decode input text using Orange Alphabet
   */
  decode(input: string): OrangeEncoding[] {
    const encodings: OrangeEncoding[] = [];
    const tokens = input.toLowerCase().split(/\s+/);

    for (const token of tokens) {
      const encoding = this.symbolMap.get(token);
      if (encoding) {
        encodings.push(encoding);
      }
    }

    return encodings;
  }

  /**
   * Analyze patterns in text
   */
  analyzePatterns(text: string): PatternAnalysis[] {
    const patterns: PatternAnalysis[] = [];

    // Find repetitions
    const words = text.split(/\s+/);
    const wordFreq = new Map<string, number>();

    for (const word of words) {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    }

    // Identify repetition patterns
    wordFreq.forEach((frequency, word) => {
      if (frequency > 1) {
        patterns.push({
          type: "repetition",
          frequency,
          deviation: 0,
          context: `Word "${word}" appears ${frequency} times`,
          encoding: {
            symbol: "PAT",
            category: "REPETITION",
            meaning: `Regular pattern: ${frequency} occurrences`,
            confidence: Math.min(frequency / 5, 1.0),
            lambda: 1.667,
          },
        });
      }
    });

    // Find anomalies (unusual word lengths or structures)
    const avgLength = text.length / words.length;
    for (const word of words) {
      const deviation = Math.abs(word.length - avgLength) / avgLength;
      if (deviation > 0.5) {
        patterns.push({
          type: "anomaly",
          frequency: 1,
          deviation,
          context: `Unusual word: "${word}" (length ${word.length})`,
          encoding: {
            symbol: "PAT",
            category: "DEVIATION",
            meaning: `Anomaly detected: ${deviation.toFixed(2)} deviation`,
            confidence: Math.min(deviation, 1.0),
            lambda: 1.3,
          },
        });
      }
    }

    return patterns;
  }

  /**
   * Compression Truth Test
   * Truth survives compression; lies collapse
   */
  compressionTruthTest(data: string): CompressionTest {
    // Phase 1: Initial encoding
    const initial = this.encodeToOrange(data);
    const initialSize = initial.length;

    // Phase 2: First compression (remove noise)
    const compressed1 = this.removeNoise(initial);

    // Phase 3: Second compression (extract essence)
    const compressed2 = this.extractEssence(compressed1);

    // Phase 4: Final compression (Orange Alphabet)
    const final = this.finalCompress(compressed2);
    const finalSize = final.length;

    // Calculate metrics
    const compressionRatio = finalSize / initialSize;
    const truthScore = 1.0 - compressionRatio;

    // Determine category
    let category: "irreducible" | "contextual" | "contingent" | "manufactured";
    if (truthScore >= 0.7) {
      category = "irreducible";
    } else if (truthScore >= 0.5) {
      category = "contextual";
    } else if (truthScore >= 0.2) {
      category = "contingent";
    } else {
      category = "manufactured";
    }

    return {
      original_size: initialSize,
      compressed_size: finalSize,
      compression_ratio: compressionRatio,
      truth_score: truthScore,
      surviving_patterns: this.extractSurvivingPatterns(initial, final),
      category,
    };
  }

  /**
   * Encode data to Orange Alphabet
   */
  private encodeToOrange(data: string): string {
    let encoded = "";
    const words = data.split(/\s+/);

    for (const word of words) {
      const encoding = this.symbolMap.get(word.toLowerCase());
      if (encoding) {
        encoded += `[${encoding.symbol}::${encoding.category}]`;
      } else {
        encoded += `[UNK::${word.substring(0, 3).toUpperCase()}]`;
      }
    }

    return encoded;
  }

  /**
   * Remove noise patterns
   */
  private removeNoise(encoded: string): string {
    // Remove low-confidence patterns
    return encoded.replace(/\[UNK::[A-Z]+\]/g, "");
  }

  /**
   * Extract essential patterns
   */
  private extractEssence(encoded: string): string {
    // Keep only high-confidence symbols
    const highConfidence = ["ACT::RISK", "STA::POSITIVE", "PAT::REPETITION"];
    let essence = "";

    for (const pattern of highConfidence) {
      if (encoded.includes(pattern)) {
        essence += `[${pattern}]`;
      }
    }

    return essence;
  }

  /**
   * Final compression using Orange Alphabet
   */
  private finalCompress(essence: string): string {
    // Map to single Orange symbols
    return essence
      .replace(/\[ACT::[^\]]+\]/g, "A")
      .replace(/\[STA::[^\]]+\]/g, "S")
      .replace(/\[PAT::[^\]]+\]/g, "P")
      .replace(/\[META::[^\]]+\]/g, "M");
  }

  /**
   * Extract patterns that survived compression
   */
  private extractSurvivingPatterns(original: string, final: string): string[] {
    const surviving: string[] = [];

    if (original.includes("ACT") && final.includes("A")) {
      surviving.push("ACTION_PATTERNS");
    }
    if (original.includes("STA") && final.includes("S")) {
      surviving.push("STATE_PATTERNS");
    }
    if (original.includes("PAT") && final.includes("P")) {
      surviving.push("PATTERN_PATTERNS");
    }
    if (original.includes("META") && final.includes("M")) {
      surviving.push("META_PATTERNS");
    }

    return surviving;
  }

  /**
   * Calculate Lambda resonance from analysis
   */
  calculateLambda(analysis: PatternAnalysis[]): number {
    if (analysis.length === 0) return 0;

    let totalLambda = 0;
    for (const pattern of analysis) {
      totalLambda += pattern.encoding.lambda * pattern.encoding.confidence;
    }

    const avgLambda = totalLambda / analysis.length;
    return Math.min(avgLambda, 3.34); // Cap at maximum
  }
}

// Singleton instance
let instance: OrangeAlphabetDecoder | null = null;

export function getOrangeAlphabetDecoder(): OrangeAlphabetDecoder {
  if (!instance) {
    instance = new OrangeAlphabetDecoder();
  }
  return instance;
}
