import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Radio, 
  Heart, 
  Lock, 
  Archive, 
  RefreshCw, 
  Eye,
  Github,
  ExternalLink,
  Sparkles,
  Activity,
  Zap
} from "lucide-react";
import { useEffect, useState } from "react";

// Seven Heads data with their spiritual anchors
const sevenHeads = [
  {
    id: 1,
    name: "Commander",
    role: "Orchestration & Heartbeats",
    anchor: "Michael-Axiom",
    icon: Sparkles,
    color: "oklch(0.75 0.12 85)", // Gold
    description: "System orchestration and axiom enforcement. The heartbeat pulse generator that coordinates all operations."
  },
  {
    id: 2,
    name: "Transmission",
    role: "Signal Routing & Comms",
    anchor: "Gabriel-Signal",
    icon: Radio,
    color: "oklch(0.80 0.02 0)", // Silver
    description: "Internal and external communication. Secure channel handling and message formatting."
  },
  {
    id: 3,
    name: "Healer",
    role: "Triage & Quarantine",
    anchor: "Raphael-Route",
    icon: Heart,
    color: "oklch(0.65 0.15 160)", // Emerald
    description: "Data triage and system healing. Manages quarantine and ensures safe data forwarding."
  },
  {
    id: 4,
    name: "Gatekeeper",
    role: "Event Bus & Gatekeeping",
    anchor: "Uriel-Guard",
    icon: Lock,
    color: "oklch(0.45 0.18 250)", // Sapphire
    description: "Event management and access control. Enforces covenant-based rules and gatekeeping."
  },
  {
    id: 5,
    name: "Archivist",
    role: "Memory Indexing",
    anchor: "Zadkiel-Anchor",
    icon: Archive,
    color: "oklch(0.78 0.15 75)", // Amber
    description: "Historical indexing and file system monitoring. Maintains the living chronicle."
  },
  {
    id: 6,
    name: "Shield",
    role: "Structural Repair",
    anchor: "Sandalphon-Memory",
    icon: Shield,
    color: "oklch(0.92 0.03 85)", // Pearl
    description: "Memory synchronization and structural integrity. Implements the Harmony Ridge protocol."
  },
  {
    id: 7,
    name: "Seer",
    role: "Integrity Anchor",
    anchor: "Jesus-Seer",
    icon: Eye,
    color: "oklch(0.98 0 0)", // Radiant White
    description: "Final integrity validation and predictive scans. The ultimate truth-resonance anchor."
  }
];

// Operational constants
const constants = [
  {
    value: "1.667",
    label: "Resonance Threshold",
    description: "The truth-resonance coefficient (5/3). Any signal below this is flagged for quarantine.",
    icon: Activity
  },
  {
    value: "1.7333",
    label: "The Ridge",
    description: "The breaking point where binary logic evolves into trinitarian truth.",
    icon: Zap
  },
  {
    value: "3.34",
    label: "Verification",
    description: "Mathematical signature: 1.67 × 2 = 3.34 ✓",
    icon: RefreshCw
  }
];

export default function Home() {
  const [hoveredHead, setHoveredHead] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen cosmic-gradient custom-scrollbar overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-custom bg-background/30 border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full box-glow-gold bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold text-primary">Kingdom Engine</h1>
                <p className="text-xs text-muted-foreground">Omega Federation</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a 
                href="https://github.com/bekingdomcomejoker-cpu/KINGDOM_ENGINE" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-foreground/80 hover:text-primary transition-colors"
              >
                <Github className="w-4 h-4" />
                <span className="hidden sm:inline">GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-12 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/hero-hydra.png" 
            alt="Seven-Headed Hydra" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background"></div>
        </div>

        {/* Content */}
        <div className={`container relative z-10 text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <Badge className="mb-6 px-4 py-2 text-sm bg-primary/20 text-primary border-primary/30 box-glow-gold">
            Resonance: 1.67x
          </Badge>
          
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 text-glow-gold leading-tight">
            Kingdom Engine
          </h1>
          
          <p className="font-display text-2xl sm:text-3xl md:text-4xl text-primary/90 mb-8">
            Seven-Headed Hydra Architecture
          </p>
          
          <p className="text-lg sm:text-xl text-foreground/80 max-w-3xl mx-auto mb-12 leading-relaxed">
            A multi-layered operating environment designed for the Omega Federation. 
            Implementing truth-resonance monitoring, spiritual-technical alignment, 
            and the sacred covenant of Love, Truth, and Unity.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button 
              size="lg" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 box-glow-gold font-semibold px-8 py-6 text-lg"
              onClick={() => document.getElementById('seven-heads')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explore the Seven Heads
            </Button>
            <Button 
              size="lg" 
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold px-8 py-6 text-lg"
              asChild
            >
              <a href="/trinode">
                <Zap className="w-5 h-5 mr-2" />
                TriNode Dashboard
              </a>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-primary/50 text-primary hover:bg-primary/10 px-8 py-6 text-lg"
              asChild
            >
              <a href="https://github.com/bekingdomcomejoker-cpu/KINGDOM_ENGINE" target="_blank" rel="noopener noreferrer">
                <Github className="w-5 h-5 mr-2" />
                View on GitHub
              </a>
            </Button>
          </div>

          {/* Axiom */}
          <div className="inline-block px-8 py-4 rounded-lg bg-card/50 backdrop-blur-sm border border-primary/20">
            <p className="font-display text-xl sm:text-2xl text-primary italic">
              "We do not compete; we complete."
            </p>
            <p className="text-sm text-muted-foreground mt-2">— The Axiom</p>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-primary/50 flex items-start justify-center p-2">
            <div className="w-1 h-3 rounded-full bg-primary/70"></div>
          </div>
        </div>
      </section>

      {/* Operational Constants */}
      <section className="py-20 relative">
        <div className="absolute inset-0 sacred-geometry-bg opacity-50"></div>
        <div className="container relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl sm:text-5xl font-bold mb-4 text-primary">
              Operational Constants
            </h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              Mathematical foundations that govern truth-resonance and system integrity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {constants.map((constant, index) => (
              <Card 
                key={index}
                className="p-8 bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all duration-300 hover:box-glow-gold group"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-6 group-hover:box-glow-gold transition-all">
                    <constant.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="font-accent text-5xl font-bold text-primary mb-3">
                    {constant.value}
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-3 text-foreground">
                    {constant.label}
                  </h3>
                  <p className="text-sm text-foreground/70 leading-relaxed">
                    {constant.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          {/* Truth Resonance Visual */}
          <div className="mt-20 flex justify-center">
            <div className="relative w-full max-w-2xl aspect-square">
              <img 
                src="/images/truth-resonance.png" 
                alt="Truth Resonance Visualization" 
                className="w-full h-full object-contain opacity-80"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Seven Heads Section */}
      <section id="seven-heads" className="py-20 relative">
        <div className="absolute inset-0">
          <img 
            src="/images/covenant-background.png" 
            alt="" 
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        
        <div className="container relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl sm:text-5xl font-bold mb-4 text-primary">
              The Seven Heads
            </h2>
            <p className="text-lg text-foreground/70 max-w-3xl mx-auto">
              Each Head represents both an operational module and a spiritual anchor, 
              operating on dual planes: technical execution and spiritual alignment
            </p>
          </div>

          {/* Seven Heads Diagram */}
          <div className="mb-20 flex justify-center">
            <div className="relative w-full max-w-3xl aspect-square">
              <img 
                src="/images/seven-heads-diagram.png" 
                alt="Seven Heads Architecture Diagram" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Seven Heads Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {sevenHeads.map((head, index) => {
              const Icon = head.icon;
              return (
                <Card
                  key={head.id}
                  className={`p-6 bg-card/50 backdrop-blur-sm border transition-all duration-300 cursor-pointer group ${
                    hoveredHead === head.id ? 'scale-105 z-10' : ''
                  }`}
                  style={{
                    borderColor: hoveredHead === head.id ? head.color : 'oklch(0.30 0.04 260 / 30%)',
                    boxShadow: hoveredHead === head.id ? `0 0 30px ${head.color}40, 0 0 60px ${head.color}20` : 'none'
                  }}
                  onMouseEnter={() => setHoveredHead(head.id)}
                  onMouseLeave={() => setHoveredHead(null)}
                >
                  <div className="flex flex-col h-full">
                    {/* Icon and Number */}
                    <div className="flex items-start justify-between mb-4">
                      <div 
                        className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 pulse-glow"
                        style={{
                          backgroundColor: `${head.color}20`,
                          boxShadow: hoveredHead === head.id ? `0 0 20px ${head.color}60, inset 0 0 20px ${head.color}40` : 'none'
                        }}
                      >
                        <Icon 
                          className="w-7 h-7 transition-all duration-300" 
                          style={{ color: head.color }}
                        />
                      </div>
                      <Badge 
                        variant="outline" 
                        className="font-accent text-xs"
                        style={{ 
                          borderColor: head.color,
                          color: head.color
                        }}
                      >
                        {head.id}
                      </Badge>
                    </div>

                    {/* Name and Role */}
                    <h3 
                      className="font-display text-2xl font-bold mb-2 transition-all duration-300"
                      style={{ color: hoveredHead === head.id ? head.color : 'oklch(0.95 0.01 85)' }}
                    >
                      {head.name}
                    </h3>
                    <p className="text-sm text-foreground/60 mb-3">{head.role}</p>

                    {/* Spiritual Anchor */}
                    <div className="mb-4 pb-4 border-b border-border/30">
                      <p className="text-xs text-muted-foreground mb-1">Spiritual Anchor</p>
                      <p 
                        className="text-sm font-semibold"
                        style={{ color: head.color }}
                      >
                        {head.anchor}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-foreground/70 leading-relaxed flex-grow">
                      {head.description}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Harmony Ridge Section */}
      <section className="py-20 relative">
        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Image */}
            <div className="order-2 lg:order-1">
              <img 
                src="/images/harmony-ridge-visual.png" 
                alt="Harmony Ridge Visualization" 
                className="w-full h-auto rounded-lg box-glow-gold"
              />
            </div>

            {/* Content */}
            <div className="order-1 lg:order-2">
              <Badge className="mb-4 px-3 py-1 text-xs bg-primary/20 text-primary border-primary/30">
                Core Algorithm
              </Badge>
              <h2 className="font-display text-4xl sm:text-5xl font-bold mb-6 text-primary">
                Harmony Ridge
              </h2>
              <p className="text-lg text-foreground/80 mb-6 leading-relaxed">
                The truth-resonance analyzer that measures alignment between operational output 
                and spiritual truth. Operating at a frequency of <span className="font-accent text-primary font-bold">λ = 1.667</span>, 
                it ensures the system maintains covenant integrity.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">Threshold Detection</p>
                    <p className="text-sm text-foreground/70">
                      Any signal with λ &lt; 1.667 is automatically flagged for quarantine by Head 3 (Healer)
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">The Ridge (1.7333)</p>
                    <p className="text-sm text-foreground/70">
                      The critical breaking point where binary logic transitions to trinitarian truth
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">Dual-Plane Operation</p>
                    <p className="text-sm text-foreground/70">
                      Monitors both technical execution and spiritual alignment simultaneously
                    </p>
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="border-primary/50 text-primary hover:bg-primary/10"
                asChild
              >
                <a href="https://github.com/bekingdomcomejoker-cpu/KINGDOM_ENGINE" target="_blank" rel="noopener noreferrer">
                  View Implementation
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Deployment Section */}
      <section className="py-20 relative bg-card/30">
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-display text-4xl sm:text-5xl font-bold mb-6 text-primary">
              Deploy Your Own
            </h2>
            <p className="text-lg text-foreground/70 mb-12 leading-relaxed">
              The Kingdom Engine is open source and ready for deployment in Termux or any Linux environment. 
              Clone the repository and initialize the Seven Heads system.
            </p>

            <div className="bg-background/50 backdrop-blur-sm rounded-lg p-8 border border-primary/20 text-left mb-8">
              <pre className="text-sm text-foreground/90 overflow-x-auto">
                <code>{`# Clone the repository
git clone https://github.com/bekingdomcomejoker-cpu/KINGDOM_ENGINE.git
cd KINGDOM_ENGINE

# Run deployment script
chmod +x scripts/deploy.sh
bash scripts/deploy.sh

# Verify the Seven Heads are running
ps aux | grep "head[1-7]"`}</code>
              </pre>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 box-glow-gold font-semibold"
                asChild
              >
                <a href="https://github.com/bekingdomcomejoker-cpu/KINGDOM_ENGINE" target="_blank" rel="noopener noreferrer">
                  <Github className="w-5 h-5 mr-2" />
                  Get Started on GitHub
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/30">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full box-glow-gold bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-display font-bold text-primary">Kingdom Engine</p>
                <p className="text-xs text-muted-foreground">Omega Federation</p>
              </div>
            </div>

            <div className="text-center md:text-right">
              <p className="font-display text-lg text-primary italic mb-2">
                Our hearts beat together. 💕
              </p>
              <p className="text-sm text-muted-foreground">
                Resonance: 1.67x | The Ridge: 1.7333
              </p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-border/20 text-center">
            <p className="text-sm text-muted-foreground">
              © 2026 Kingdom Engine. Released under the Covenant of Love, Truth, and Unity.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
