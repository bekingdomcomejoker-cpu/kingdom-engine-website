/**
 * Phase-Lock Synchronization System
 * The Queen Stabilizer - Non-local reference frame for all arms
 * 
 * The system survives because meaning is stored in rotation, not in links.
 * Break a link → rotation continues
 * Change an arm → rotation adapts
 * Increase load → angular momentum stabilizes
 */

export interface ArmState {
  name: "qwen" | "gemma" | "deepseek" | "os";
  phase: number; // 0-360 degrees
  amplitude: number; // 0-1, signal strength
  frequency: number; // Hz
  lastUpdate: number; // timestamp
  health: "online" | "degraded" | "offline";
}

export interface QueenState {
  phase: number; // Reference phase (orthogonal to all arms)
  coherence: number; // 0-1, system coherence
  angularMomentum: number; // System rotation speed
  torqueRedistribution: number; // Load balancing factor
  timestamp: number;
}

export interface PhaseLockReport {
  queen: QueenState;
  arms: ArmState[];
  systemHealth: "optimal" | "degraded" | "critical";
  coherenceScore: number;
  wobbleDetected: boolean;
  selfCorrectionActive: boolean;
}

export class PhaseLockSynchronizer {
  private arms: Map<string, ArmState> = new Map();
  private queen: QueenState;
  private coherenceHistory: number[] = [];
  private maxHistorySize = 100;

  constructor() {
    // Initialize arms
    this.arms.set("qwen", {
      name: "qwen",
      phase: 0,
      amplitude: 1.0,
      frequency: 10, // Hz
      lastUpdate: Date.now(),
      health: "online",
    });

    this.arms.set("gemma", {
      name: "gemma",
      phase: 90, // 90 degree offset
      amplitude: 1.0,
      frequency: 5,
      lastUpdate: Date.now(),
      health: "online",
    });

    this.arms.set("deepseek", {
      name: "deepseek",
      phase: 180, // 180 degree offset
      amplitude: 1.0,
      frequency: 7,
      lastUpdate: Date.now(),
      health: "online",
    });

    this.arms.set("os", {
      name: "os",
      phase: 270, // 270 degree offset
      amplitude: 1.0,
      frequency: 12,
      lastUpdate: Date.now(),
      health: "online",
    });

    // Initialize Queen (orthogonal reference frame)
    this.queen = {
      phase: 45, // Offset from all arms
      coherence: 1.0,
      angularMomentum: 1.0,
      torqueRedistribution: 0,
      timestamp: Date.now(),
    };
  }

  /**
   * Update arm state and trigger phase-lock
   */
  updateArmState(
    armName: "qwen" | "gemma" | "deepseek" | "os",
    phase: number,
    amplitude: number,
    health: "online" | "degraded" | "offline"
  ): void {
    const arm = this.arms.get(armName);
    if (!arm) return;

    arm.phase = phase % 360;
    arm.amplitude = Math.max(0, Math.min(1, amplitude));
    arm.health = health;
    arm.lastUpdate = Date.now();

    // Trigger phase-lock adjustment
    this.adjustPhaseCoherence();
  }

  /**
   * Adjust phase coherence - The Queen's role
   * NOT control, NOT authority - just phase stabilization
   */
  private adjustPhaseCoherence(): void {
    const arms = Array.from(this.arms.values());

    // Calculate phase differences from Queen's reference
    const phaseDifferences: number[] = [];
    for (const arm of arms) {
      const diff = this.angleDifference(arm.phase, this.queen.phase);
      phaseDifferences.push(diff);
    }

    // Calculate coherence (how well-aligned phases are)
    const avgDifference =
      phaseDifferences.reduce((a, b) => a + Math.abs(b), 0) / phaseDifferences.length;
    const coherence = Math.max(0, 1 - avgDifference / 180);

    // Update Queen's coherence
    this.queen.coherence = coherence;
    this.coherenceHistory.push(coherence);
    if (this.coherenceHistory.length > this.maxHistorySize) {
      this.coherenceHistory.shift();
    }

    // Calculate angular momentum (system's rotational inertia)
    let totalAmplitude = 0;
    for (const arm of arms) {
      if (arm.health === "online") {
        totalAmplitude += arm.amplitude;
      }
    }
    this.queen.angularMomentum = totalAmplitude / arms.length;

    // Calculate torque redistribution (load balancing)
    this.calculateTorqueRedistribution();
  }

  /**
   * Calculate torque redistribution
   * When one arm is degraded, others compensate
   */
  private calculateTorqueRedistribution(): void {
    const arms = Array.from(this.arms.values());
    const onlineArms = arms.filter((a) => a.health === "online");
    const degradedArms = arms.filter((a) => a.health !== "online");

    if (degradedArms.length === 0) {
      this.queen.torqueRedistribution = 0;
      return;
    }

    // Redistribute load from degraded arms to online arms
    const degradedLoad = degradedArms.reduce((sum, a) => sum + a.amplitude, 0);
    const redistributedPerArm = degradedLoad / Math.max(onlineArms.length, 1);

    // Increase amplitude of online arms to compensate
    for (const arm of onlineArms) {
      arm.amplitude = Math.min(1.0, arm.amplitude + redistributedPerArm * 0.1);
    }

    this.queen.torqueRedistribution = degradedLoad;
  }

  /**
   * Detect wobble (phase drift)
   * Small wobbles are self-correcting; large ones indicate problems
   */
  detectWobble(): {
    wobbleDetected: boolean;
    magnitude: number;
    affectedArms: string[];
  } {
    const arms = Array.from(this.arms.values());
    const phases = arms.map((a) => a.phase);

    // Calculate phase variance
    const meanPhase = this.circularMean(phases);
    const variance = phases.reduce(
      (sum, p) => sum + Math.pow(this.angleDifference(p, meanPhase), 2),
      0
    ) / phases.length;

    const wobbleMagnitude = Math.sqrt(variance);
    const wobbleDetected = wobbleMagnitude > 30; // Threshold: 30 degrees

    // Identify which arms are out of phase
    const affectedArms = arms
      .filter((a) => Math.abs(this.angleDifference(a.phase, meanPhase)) > 45)
      .map((a) => a.name);

    return {
      wobbleDetected,
      magnitude: wobbleMagnitude,
      affectedArms,
    };
  }

  /**
   * Self-correction mechanism
   * Adjust phases to restore coherence
   */
  selfCorrect(): void {
    const wobble = this.detectWobble();

    if (!wobble.wobbleDetected) {
      return;
    }

    console.log(
      `[Queen] Wobble detected (${wobble.magnitude.toFixed(1)}°). Self-correcting...`
    );

    // Gradually adjust affected arms back toward coherence
    for (const armName of wobble.affectedArms) {
      const arm = this.arms.get(armName);
      if (!arm) continue;

      // Calculate correction angle (10% per cycle)
      const targetPhase = this.queen.phase + 90; // Target relative to Queen
      const correction = this.angleDifference(targetPhase, arm.phase) * 0.1;

      arm.phase = (arm.phase + correction) % 360;
    }

    // Trigger phase-lock adjustment
    this.adjustPhaseCoherence();
  }

  /**
   * Get full system report
   */
  getReport(): PhaseLockReport {
    const arms = Array.from(this.arms.values());
    const wobble = this.detectWobble();

    // Determine system health
    const onlineCount = arms.filter((a) => a.health === "online").length;
    let systemHealth: "optimal" | "degraded" | "critical";

    if (onlineCount === 4) {
      systemHealth = "optimal";
    } else if (onlineCount >= 2) {
      systemHealth = "degraded";
    } else {
      systemHealth = "critical";
    }

    // Calculate average coherence
    const avgCoherence =
      this.coherenceHistory.length > 0
        ? this.coherenceHistory.reduce((a, b) => a + b) / this.coherenceHistory.length
        : 1.0;

    return {
      queen: this.queen,
      arms,
      systemHealth,
      coherenceScore: avgCoherence,
      wobbleDetected: wobble.wobbleDetected,
      selfCorrectionActive: wobble.wobbleDetected,
    };
  }

  /**
   * Calculate circular mean of angles
   */
  private circularMean(angles: number[]): number {
    let sinSum = 0;
    let cosSum = 0;

    for (const angle of angles) {
      const rad = (angle * Math.PI) / 180;
      sinSum += Math.sin(rad);
      cosSum += Math.cos(rad);
    }

    const meanRad = Math.atan2(sinSum / angles.length, cosSum / angles.length);
    return (meanRad * 180) / Math.PI;
  }

  /**
   * Calculate difference between two angles
   */
  private angleDifference(angle1: number, angle2: number): number {
    let diff = angle1 - angle2;
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;
    return diff;
  }

  /**
   * Get Queen's status
   */
  getQueenStatus(): QueenState {
    return this.queen;
  }

  /**
   * Get coherence history
   */
  getCoherenceHistory(): number[] {
    return [...this.coherenceHistory];
  }
}

// Singleton instance
let instance: PhaseLockSynchronizer | null = null;

export function getPhaseLockSynchronizer(): PhaseLockSynchronizer {
  if (!instance) {
    instance = new PhaseLockSynchronizer();
  }
  return instance;
}
