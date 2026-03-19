import { Link } from "react-router-dom";
import { Shield, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg tracking-tight">AgentShield</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Link>
            <Link to="/auth">
              <Button variant="hero" size="sm">Start Free Scan</Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">Simple, transparent pricing</h1>
            <p className="text-lg text-muted-foreground">Start free. Upgrade when you need more scans and features.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`border rounded-[4px] p-6 flex flex-col ${
                  plan.popular ? "border-primary bg-primary/5 shadow-hard" : "border-border bg-surface"
                }`}
              >
                {plan.popular && (
                  <span className="text-xs font-bold text-primary mb-3 uppercase tracking-wider">Most Popular</span>
                )}
                <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold font-mono-data">{plan.price}</span>
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
