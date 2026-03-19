import { useState, ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Shield, LayoutDashboard, ScanLine, CreditCard, LogOut, Menu, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/scan", icon: ScanLine, label: "New Scan" },
  { to: "/pricing", icon: CreditCard, label: "Pricing" },
];

const AppLayout = ({ children }: { children: ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 border-b border-border bg-surface flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <span className="font-bold text-base tracking-tight">AgentShield</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-background/80"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-[240px] border-r border-border bg-surface flex flex-col
        transition-transform duration-200
        lg:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <Link to="/" className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
          <Shield className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg tracking-tight text-foreground">AgentShield</span>
        </Link>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.to || location.pathname.startsWith(item.to + "/");
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-[4px] text-sm font-medium transition-colors duration-200 ${
                  active
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-border">
          <button
            onClick={() => {
              setSidebarOpen(false);
              handleSignOut();
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-[4px] text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors duration-200 w-full text-left"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-[240px] p-4 sm:p-6 lg:p-8 pt-18 lg:pt-8">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
