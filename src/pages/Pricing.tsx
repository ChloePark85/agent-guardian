import { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, Check, ArrowLeft, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    features: ["10 scans/month", "Basic results", "Community support"],
    cta: "Get Started",
  },
  {
    name: "Pro",
    price: "$49",
    period: "/month",
    features: ["100 scans/month", "PDF reports", "CI/CD integration", "Priority support"],
    cta: "Upgrade",
    popular: true,
  },
  {
    name: "Team",
    price: "$199",
    period: "/month",
    features: ["Unlimited scans", "SIEM integration", "Team dashboard", "Dedicated support"],
    cta: "Upgrade",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    features: ["Everything in Team", "On-premise deploy", "Custom SLA", "Dedicated engineer"],
    cta: "Contact Us",
  },
];

const Pricing = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg tracking-tight">AgentShield</span>
          </Link>
          <div className="hidden md:flex items-center gap-4">
            <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Link>
            <Link to="/auth">
              <Button variant="hero" size="sm">Start Free Scan</Button>
            </Link>
          </div>
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden absolute top-16 left-0 right-0 bg-surface border-b border-border z-50 px-4 py-4 space-y-3"
          >
            <Link to="/dashboard" className="block text-sm text-muted-foreground hover:text-foreground py-2" onClick={() => setMenuOpen(false)}>Dashboard</Link>
            <Link to="/auth" onClick={() => setMenuOpen(false)}>
              <Button variant="hero" size="sm" className="w-full">Start Free Scan</Button>
            </Link>
          </motion.div>
        )}
      </nav>

      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Simple, transparent pricing</h1>
            <p className="text-base sm:text-lg text-muted-foreground">Start free. Upgrade when you need more scans and features.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`border rounded-[4px] p-5 sm:p-6 flex flex-col ${
                  plan.popular ? "border-primary bg-primary/5 shadow-hard" : "border-border bg-surface"
                }`}
              >
                {plan.popular && (
                  <span className="text-xs font-bold text-primary mb-3 uppercase tracking-wider">Most Popular</span>
                )}
                <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-3xl sm:text-4xl font-bold font-mono-data">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
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
    </div>
  );
};

export default Pricing;
