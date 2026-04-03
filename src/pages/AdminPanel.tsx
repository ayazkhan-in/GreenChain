import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useWeb3 } from "@/context/Web3Context";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, BarChart3, Globe, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";
import { containerVariants, itemVariants, staggerContainer, staggerItem } from "@/lib/animations";

type Submission = {
  id: number;
  wallet_address: string;
  trees_count: number;
  submitted_at: string;
  status: string;
};

export default function AdminPanel() {
  const { verifyProject, account } = useWeb3();
  const [credits, setCredits] = useState<Record<number, string>>({});
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState({ pending: 0, verifiedToday: 0 });

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
    const c = Number(credits[id] || 0);
    if (!c) { toast.error("Enter credit amount first"); return; }
    setLoadingId(id);
    await verifyProject(id, c);
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-10">
        <motion.div initial="hidden" animate="visible" variants={containerVariants}>
          <motion.div variants={itemVariants} className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-black text-foreground">Project Verification Queue</h1>
              <p className="mt-2 text-muted-foreground max-w-lg">Review and validate ecosystem restorations. High-fidelity verification ensures the integrity of the Digital Biome.</p>
            </div>
            <div className="flex gap-4">
              <motion.div variants={staggerItem} className="rounded-2xl border border-border bg-card px-6 py-4 text-center shadow-card">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pending Requests</p>
                <p className="text-2xl font-black text-foreground">{stats.pending}</p>
              </motion.div>
              <motion.div variants={staggerItem} className="rounded-2xl border-2 border-primary bg-card px-6 py-4 text-center shadow-card">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Verified Today</p>
                <p className="text-2xl font-black text-primary">{stats.verifiedToday}</p>
              </motion.div>
            </div>
          </motion.div>

          {/* Table */}
          <motion.div variants={itemVariants} className="rounded-2xl border border-border bg-card shadow-card overflow-hidden mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Developer Address", "Trees Planted", "Date Submitted", "Status", "Assign Credits", "Actions"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {submissions.map((s) => (
                <tr key={s.id} className="hover:bg-accent/50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-primary">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <span className="text-sm font-mono text-muted-foreground">{`${s.wallet_address.slice(0, 6)}...${s.wallet_address.slice(-4)}`}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-primary">{s.trees_count.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(s.submitted_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4"><StatusBadge status={s.status === "verified" ? "verified" : "pending"} /></td>
                  <td className="px-6 py-4">
                    <Input type="number" placeholder="0.00" value={credits[s.id] || ""} onChange={(e) => setCredits({ ...credits, [s.id]: e.target.value })} className="w-24 rounded-lg" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="rounded-full" onClick={() => handleReject(s.id)}>Reject</Button>
                      <Button size="sm" className="rounded-full" onClick={() => handleApprove(s.id)} disabled={loadingId === s.id}>
                        {loadingId === s.id ? "..." : "Approve"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
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
