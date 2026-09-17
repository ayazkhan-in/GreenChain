import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useWeb3 } from "@/context/Web3Context";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, BarChart3, Globe, ChevronLeft, ChevronRight, Trees, Leaf, Sparkles, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";
import { MockStore } from "@/lib/mockStore";
import { containerVariants, itemVariants, staggerContainer, staggerItem } from "@/lib/animations";

// Tree types with CO2 multipliers (kg CO2 per tree per year)
const TREE_TYPES = [
  { id: "oak", name: "Oak", multiplier: 21.77 },
  { id: "pine", name: "Pine", multiplier: 18.41 },
  { id: "maple", name: "Maple", multiplier: 19.65 },
  { id: "birch", name: "Birch", multiplier: 15.32 },
  { id: "spruce", name: "Spruce", multiplier: 20.12 },
  { id: "beech", name: "Beech", multiplier: 22.45 },
  { id: "ash", name: "Ash", multiplier: 17.89 },
  { id: "mangrove", name: "Mangrove", multiplier: 27.65 },
];

const BASE_TOKEN_RATE = 0.5; // Credits per kg of CO2 per year

type Submission = {
  id: number;
  wallet_address: string;
  trees_count: number;
  tree_type?: string;
  project_name?: string;
  submitted_at: string;
  status: string;
};

export default function AdminPanel() {
  const { verifyProject, account } = useWeb3();
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState({ pending: 0, verifiedToday: 0 });

  const calculateExpectedCredits = (submission: Submission) => {
    const treeType = submission.tree_type || "oak";
    const selectedTree = TREE_TYPES.find(t => t.id === treeType);
    if (!selectedTree) return 0;
    const co2Total = submission.trees_count * selectedTree.multiplier;
    return Math.round(co2Total * BASE_TOKEN_RATE);
  };

  const loadData = async () => {
    if (!account) return;
    try {
      const [queueRes, statsRes] = await Promise.all([
        apiRequest<{ success: boolean; data: Submission[] }>("/admin/submissions", { walletAddress: account }),
        apiRequest<{ success: boolean; data: { pending: number; verifiedToday: number } }>("/admin/stats", { walletAddress: account }),
      ]);

      setSubmissions(queueRes.data || []);
      setStats(statsRes.data || { pending: 0, verifiedToday: 0 });
    } catch (e: any) {
      toast.error(e.message || "Failed to load admin queue");
    }
  };

  useEffect(() => {
    void loadData();
  }, [account]);

  const handleApprove = async (id: number) => {
    const submission = submissions.find(s => s.id === id);
    if (!submission) return;
    const creditsToAllot = calculateExpectedCredits(submission);
    if (!creditsToAllot) { 
      toast.error("Invalid credits calculation"); 
      return; 
    }
    setLoadingId(id);
    await verifyProject(id, creditsToAllot);
    setLoadingId(null);
    await loadData();
  };

  const handleReject = async (id: number) => {
    if (!account) return;
    try {
      await apiRequest(`/admin/submissions/${id}/reject`, {
        method: "POST",
        walletAddress: account,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Rejected by admin" }),
      });
      toast.success("Submission rejected");
      await loadData();
    } catch (e: any) {
      toast.error(e.message || "Reject failed");
    }
  };

  const handleSeedSubmissions = async () => {
    MockStore.seedAdminSubmissions();
    toast.success("Added sample submissions to verification queue");
    await loadData();
  };

  const handleApproveAll = async () => {
    if (submissions.length === 0) return;
    for (const sub of submissions) {
      const credits = calculateExpectedCredits(sub);
      await verifyProject(sub.id, credits || 500);
    }
    toast.success("Approved all pending submissions");
    await loadData();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-10">
        <motion.div initial="hidden" animate="visible" variants={containerVariants}>
          <motion.div variants={itemVariants} className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-black text-foreground">Project Verification Queue</h1>
              <p className="mt-2 text-muted-foreground max-w-lg">Review and validate ecosystem restorations. High-fidelity verification ensures the integrity of the Digital Biome.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSeedSubmissions}
                  className="rounded-full text-xs font-semibold text-primary border-primary/30 hover:bg-primary/10 gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Seed Sample Submissions
                </Button>
                {submissions.length > 0 && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleApproveAll}
                    className="rounded-full text-xs font-semibold gap-1.5"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Verify All Pending
                  </Button>
                )}
              </div>
              <div className="flex gap-3">
                <motion.div variants={staggerItem} className="rounded-2xl border border-border bg-card px-5 py-3 text-center shadow-card">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pending</p>
                  <p className="text-xl font-black text-foreground">{stats.pending}</p>
                </motion.div>
                <motion.div variants={staggerItem} className="rounded-2xl border-2 border-primary bg-card px-5 py-3 text-center shadow-card">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Verified Today</p>
                  <p className="text-xl font-black text-primary">{stats.verifiedToday}</p>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Table */}
          <motion.div variants={itemVariants} className="rounded-2xl border border-border bg-card shadow-card overflow-hidden mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Project Name", "Developer", "Trees", "Type", "Expected Credits", "Submitted", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                    <p className="text-sm font-semibold text-foreground mb-2">No pending submissions in verification queue</p>
                    <p className="text-xs text-muted-foreground mb-4">Click below to add sample projects ready for verification:</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSeedSubmissions}
                      className="rounded-full text-xs font-semibold text-primary border-primary/30 hover:bg-primary/10 gap-1.5"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Seed Sample Submissions
                    </Button>
                  </td>
                </tr>
              ) : (
                submissions.map((s) => (
                <tr key={s.id} className="hover:bg-accent/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-foreground">{s.project_name || "Unnamed Project"}</td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-primary text-xs">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">{`${s.wallet_address.slice(0, 6)}...${s.wallet_address.slice(-4)}`}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-primary">{s.trees_count.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <Badge variant="secondary" className="text-xs gap-1">
                      <Leaf className="h-3 w-3" />
                      {TREE_TYPES.find(t => t.id === s.tree_type)?.name || "Oak"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-foreground">
                    {calculateExpectedCredits(s)} <span className="text-xs text-muted-foreground">VCC</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(s.submitted_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4"><StatusBadge status={s.status === "verified" ? "verified" : "pending"} /></td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => handleReject(s.id)}>Reject</Button>
                      <Button size="sm" className="rounded-full text-xs" onClick={() => handleApprove(s.id)} disabled={loadingId === s.id}>
                        {loadingId === s.id ? "..." : "Approve"}
                      </Button>
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Showing {submissions.length} pending submissions</p>
            <div className="flex gap-1">
              <button className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-accent"><ChevronLeft className="h-4 w-4" /></button>
              {[1, 2, 3].map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm font-medium ${page === p ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:bg-accent"}`}>{p}</button>
              ))}
              <button className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-accent"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        </motion.div>

        {/* Info Cards */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid md:grid-cols-3 gap-6">
          {[
            { icon: <CheckCircle className="h-5 w-5" />, tag: "Efficiency", title: "Automated Checks", desc: "Satellite data has pre-screened 85% of these entries for canopy density compliance.", color: "border-t-4 border-t-primary" },
            { icon: <BarChart3 className="h-5 w-5" />, tag: "Live Data", title: "Registry Load", desc: "The minting engine is currently operating at 12% capacity. Optimal time for credit distribution." },
            { icon: <Globe className="h-5 w-5" />, tag: "Audit Log", title: "Immutable Trace", desc: "Every approval is hashed and pinned to the global biome ledger for permanent transparency." },
          ].map((c) => (
            <motion.div key={c.title} variants={staggerItem} className={`rounded-2xl border border-border bg-card p-6 shadow-card ${c.color || ""}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-primary">{c.icon}</div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">{c.tag}</span>
              </div>
              <h3 className="font-bold text-foreground">{c.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
            </motion.div>
          ))}
        </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
