import { useState } from "react";
import { useWeb3 } from "@/context/Web3Context";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, BarChart3, Globe, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const submissions = [
  { id: 1, wallet: "0x71C...4e21", trees: 1240, date: "Oct 24, 2024", status: "pending" as const },
  { id: 2, wallet: "0x3A2...9F1b", trees: 850, date: "Oct 23, 2024", status: "pending" as const },
  { id: 3, wallet: "0xBC1...12D9", trees: 3120, date: "Oct 22, 2024", status: "pending" as const },
  { id: 4, wallet: "0xDD4...A8E1", trees: 15000, date: "Oct 21, 2024", status: "pending" as const },
];

export default function AdminPanel() {
  const { verifyProject } = useWeb3();
  const [credits, setCredits] = useState<Record<number, string>>({});
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const handleApprove = async (id: number) => {
    const c = Number(credits[id] || 0);
    if (!c) { toast.error("Enter credit amount first"); return; }
    setLoadingId(id);
    await verifyProject(id, c);
    setLoadingId(null);
  };

  const handleReject = (id: number) => {
    toast.success("Submission rejected");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-10">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-foreground">Project Verification Queue</h1>
            <p className="mt-2 text-muted-foreground max-w-lg">Review and validate ecosystem restorations. High-fidelity verification ensures the integrity of the Digital Biome.</p>
          </div>
          <div className="flex gap-4">
            <div className="rounded-2xl border border-border bg-card px-6 py-4 text-center shadow-card">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pending Requests</p>
              <p className="text-2xl font-black text-foreground">12</p>
            </div>
            <div className="rounded-2xl border-2 border-primary bg-card px-6 py-4 text-center shadow-card">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Verified Today</p>
              <p className="text-2xl font-black text-primary">48</p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden mb-6">
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
                    <span className="text-sm font-mono text-muted-foreground">{s.wallet}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-primary">{s.trees.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{s.date}</td>
                  <td className="px-6 py-4"><StatusBadge status={s.status} /></td>
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
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Showing 4 of 12 submissions</p>
            <div className="flex gap-1">
              <button className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-accent"><ChevronLeft className="h-4 w-4" /></button>
              {[1, 2, 3].map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm font-medium ${page === p ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:bg-accent"}`}>{p}</button>
              ))}
              <button className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-accent"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: <CheckCircle className="h-5 w-5" />, tag: "Efficiency", title: "Automated Checks", desc: "Satellite data has pre-screened 85% of these entries for canopy density compliance.", color: "border-t-4 border-t-primary" },
            { icon: <BarChart3 className="h-5 w-5" />, tag: "Live Data", title: "Registry Load", desc: "The minting engine is currently operating at 12% capacity. Optimal time for credit distribution." },
            { icon: <Globe className="h-5 w-5" />, tag: "Audit Log", title: "Immutable Trace", desc: "Every approval is hashed and pinned to the global biome ledger for permanent transparency." },
          ].map((c) => (
            <div key={c.title} className={`rounded-2xl border border-border bg-card p-6 shadow-card ${c.color || ""}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-primary">{c.icon}</div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">{c.tag}</span>
              </div>
              <h3 className="font-bold text-foreground">{c.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
