import { Link, useLocation } from "react-router-dom";
import { Shield, LayoutDashboard, ScanLine, CreditCard, LogOut } from "lucide-react";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/scan", icon: ScanLine, label: "New Scan" },
  { to: "/pricing", icon: CreditCard, label: "Pricing" },
];

const AppSidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-[240px] h-screen fixed left-0 top-0 border-r border-border bg-surface flex flex-col">
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
        <Link
          to="/auth"
          className="flex items-center gap-3 px-3 py-2.5 rounded-[4px] text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors duration-200"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Link>
      </div>
    </aside>
  );
};

export default AppSidebar;
