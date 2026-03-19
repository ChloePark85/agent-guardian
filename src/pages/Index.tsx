import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ScanLine, FileText, Layers, Check, ArrowRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import LiveTerminal from "@/components/LiveTerminal";

const ease = [0.16, 1, 0.3, 1] as const;

const features = [
  {
    icon: ScanLine,
    title: "Deep Scan",
    desc: "AST-level analysis of AI agent code. Detect prompt injections, unauthorized API calls, and data exfiltration vectors.",
  },
  {
    icon: FileText,
    title: "Compliance Reports",
    desc: "Generate PDF audit reports for SOC 2, ISO 27001, and internal governance. One-click export.",
  },
  {
    icon: Layers,
    title: "Multi-Framework",
    desc: "Support for LangChain, CrewAI, OpenClaw, and custom agent frameworks. Drop your .zip and go.",
  },
];

const plans = [
  { name: "Free", price: "$0", period: "/month", features: ["10 scans/month", "Basic results", "Community support"], cta: "Start Free" },
  { name: "Pro", price: "$49", period: "/month", features: ["100 scans/month", "PDF reports", "CI/CD integration", "Priority support"], cta: "Upgrade", popular: true },
  { name: "Team", price: "$199", period: "/month", features: ["Unlimited scans", "SIEM integration", "Team dashboard", "Dedicated support"], cta: "Upgrade" },
  { name: "Enterprise", price: "Custom", period: "", features: ["Everything in Team", "On-premise deploy", "Custom SLA", "Dedicated engineer"], cta: "Contact Us" },
];

const Index = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg tracking-tight">AgentShield</span>
          </Link>
          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            <Link to="/auth">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button variant="hero" size="sm">Start Free Scan</Button>
            </Link>
          </div>
          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {/* Mobile menu */}
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden absolute top-16 left-0 right-0 bg-surface border-b border-border z-50 px-4 py-4 space-y-3"
          >
            <Link to="/pricing" className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-2" onClick={() => setMenuOpen(false)}>Pricing</Link>
            <Link to="/auth" onClick={() => setMenuOpen(false)}>
              <Button variant="outline" size="sm" className="w-full">Sign In</Button>
            </Link>
            <Link to="/auth" onClick={() => setMenuOpen(false)}>
              <Button variant="hero" size="sm" className="w-full mt-2">Start Free Scan</Button>
            </Link>
          </motion.div>
        )}
      </nav>

      {/* Hero */}
      <section className="py-16 sm:py-32 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4 sm:mb-6">
              Your AI agents are a security blind spot.{" "}
              <span className="text-primary">Fix it in 5 minutes.</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6 sm:mb-8 max-w-lg">
              Scan AI agents, plugins, and skills for malicious code before they hit production.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link to="/auth">
                <Button variant="hero" size="lg" className="w-full sm:w-auto">
                  Start Free Scan
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">View Pricing</Button>
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.2 }}
          >
            <LiveTerminal />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-32 px-4 sm:px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-2xl sm:text-3xl font-bold text-center mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Security at every layer
          </motion.h2>
          <p className="text-center text-muted-foreground mb-10 sm:mb-16 max-w-md mx-auto text-sm sm:text-base">
            Three pillars of AI agent security. Automated, thorough, production-ready.
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="border border-border rounded-[4px] bg-surface p-5 sm:p-6 shadow-hard"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease, delay: i * 0.1 }}
              >
                <f.icon className="w-7 h-7 sm:w-8 sm:h-8 text-primary mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 sm:py-32 px-4 sm:px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">Simple, transparent pricing</h2>
          <p className="text-center text-muted-foreground mb-10 sm:mb-16 text-sm sm:text-base">Start free. Upgrade when you need more.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`border rounded-[4px] p-5 sm:p-6 flex flex-col ${
                  plan.popular
                    ? "border-primary bg-primary/5 shadow-hard"
                    : "border-border bg-surface"
                }`}
              >
                {plan.popular && (
                  <span className="text-xs font-bold text-primary mb-3 uppercase tracking-wider">Most Popular</span>
                )}
                <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold font-mono-data">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/auth">
                  <Button variant={plan.popular ? "hero" : "outline"} className="w-full">
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 text-primary" />
            <span>AgentShield © 2026</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <a href="#" className="hover:text-foreground transition-colors">Docs</a>
            <a href="#" className="hover:text-foreground transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
