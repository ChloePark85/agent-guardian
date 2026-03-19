import { Link } from "react-router-dom";
import { Plus, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";
import RiskBadge from "@/components/RiskBadge";
import { supabase, type Scan, type Profile } from "@/lib/supabase";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const [scans, setScans] = useState<Scan[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(profileData);

      // Load scans
      const { data: scansData } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setScans(scansData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const scansUsed = profile?.scans_used_this_month || 0;
  const scanLimit = profile?.scan_limit || 10;
  const plan = profile?.plan || "Free";

  return (
    <AppLayout>
      <div className="max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold mb-1">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Monitor your AI agent security posture</p>
          </div>
          <Link to="/scan">
            <Button variant="hero" className="w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              New Scan
            </Button>
          </Link>
        </div>

        {/* Usage Bar */}
        <div className="border border-border rounded-[4px] bg-surface p-4 mb-6 sm:mb-8 shadow-hard">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              <span className="font-mono-data text-foreground">{scansUsed}/{scanLimit}</span> scans used
            </span>
            <span className="text-xs font-mono-data bg-accent px-2 py-0.5 rounded-[4px] text-accent-foreground">{plan}</span>
          </div>
          <div className="h-1 bg-accent rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${(scansUsed / scanLimit) * 100}%` }}
            />
          </div>
        </div>

        {/* Scan History */}
        <div className="border border-border rounded-[4px] bg-surface shadow-hard overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold">Scan History</h2>
          </div>
          {loading ? (
            <div className="py-20 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : scans.length === 0 ? (
            <div className="py-20 text-center">
              <ScanLine className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No scans yet. Run your first scan!</p>
              <Link to="/scan">
                <Button variant="hero" className="mt-4">Start Scanning</Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground text-left">
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Framework</th>
                      <th className="px-4 py-3 font-medium">Risk Score</th>
                      <th className="px-4 py-3 font-medium">Findings</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scans.map((scan) => (
                      <tr key={scan.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors cursor-pointer">
                        <td className="px-4 py-3">
                          <Link to={`/scan/${scan.id}`} className="text-foreground hover:text-primary transition-colors font-medium">
                            {scan.skill_name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground font-mono-data text-xs">{scan.framework || 'N/A'}</td>
                        <td className="px-4 py-3"><RiskBadge score={scan.risk_score} /></td>
                        <td className="px-4 py-3 font-mono-data text-muted-foreground">{scan.findings_count}</td>
                        <td className="px-4 py-3 font-mono-data text-muted-foreground text-xs">{new Date(scan.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile cards */}
              <div className="sm:hidden divide-y divide-border">
                {scans.map((scan) => (
                  <Link key={scan.id} to={`/scan/${scan.id}`} className="block p-4 hover:bg-accent/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground truncate mr-2">{scan.skill_name}</span>
                      <RiskBadge score={scan.risk_score} />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="font-mono-data">{scan.framework || 'N/A'}</span>
                      <span>{scan.findings_count} findings</span>
                      <span className="font-mono-data">{new Date(scan.created_at).toLocaleDateString()}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
