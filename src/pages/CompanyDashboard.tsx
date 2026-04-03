import { useState } from "react";
import { useWeb3 } from "@/context/Web3Context";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Coins, Leaf, Award, Flame } from "lucide-react";
import amazonImg from "@/assets/amazon-basin.jpg";
import windImg from "@/assets/wind-farm.jpg";
import solarImg from "@/assets/solar-farm.jpg";
import congoImg from "@/assets/congo-peatlands.jpg";

const marketProjects = [
  { id: 1, name: "Amazon Basin Reserve", location: "Brazil • Reforestation", available: "2,400 VCC", price: "$18.50", img: amazonImg },
  { id: 2, name: "Northern Wind Farm", location: "Denmark • Wind Energy", available: "1,150 VCC", price: "$14.20", img: windImg },
  { id: 3, name: "Sahara Solar Initiative", location: "Morocco • Solar Power", available: "5,800 VCC", price: "$12.90", img: solarImg },
  { id: 4, name: "Congo Peatlands", location: "Congo • Wetland Protect", available: "950 VCC", price: "$24.00", img: congoImg },
];

const transactions = [
  { tx: "0x9a...3e21", project: "Amazon Basin Reserve", type: "Purchase", amount: "+500 VCC", status: "Completed", date: "Oct 24, 2024" },
  { tx: "0x4f...88b2", project: "Global Offset Pool", type: "Retire", amount: "-1,200 VCC", status: "Completed", date: "Oct 21, 2024" },
  { tx: "0x1c...ac5a", project: "Northern Wind Farm", type: "Purchase", amount: "+1,000 VCC", status: "Completed", date: "Oct 18, 2024" },
];

export default function CompanyDashboard() {
  const { burnTokens, account } = useWeb3();
  const [showRetire, setShowRetire] = useState(false);
  const [retireAmount, setRetireAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCert, setShowCert] = useState(false);
  const [filter, setFilter] = useState("All Projects");

  const handleRetire = async () => {
    if (!retireAmount) return;
    setLoading(true);
    await burnTokens(Number(retireAmount));
    setLoading(false);
    setShowRetire(false);
    setShowCert(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-foreground">Portfolio Overview</h1>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mt-1">Verified Biome Statistics</p>
          </div>
          <Button onClick={() => setShowRetire(true)} className="rounded-full gap-2">
            <Flame className="h-4 w-4" /> Retire Credits
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <StatCard icon={<Coins className="h-5 w-5" />} label="Total Purchased" value="12,450 VCC" />
          <StatCard icon={<Leaf className="h-5 w-5" />} label="CO2 Offset" value="8,922 TONS" badge="Equates to 148,700 tree seedlings grown for 10 years." />
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary font-black text-lg">A+</div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Market Impact</p>
              <p className="font-bold text-foreground">Top 5% Contributor</p>
              <p className="text-xs text-muted-foreground">Verified across 12 projects</p>
            </div>
          </div>
        </div>

        {/* Marketplace */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-foreground">Credit Marketplace</h2>
          <div className="flex gap-2">
            {["All Projects", "Reforestation", "Renewable Energy"].map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${filter === f ? "border-foreground text-foreground" : "border-border text-muted-foreground hover:border-foreground"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {marketProjects.map((p) => (
            <div key={p.id} className="rounded-2xl border border-border bg-card shadow-card overflow-hidden hover:shadow-elevated transition-shadow">
              <div className="relative h-40 overflow-hidden">
                <img src={p.img} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] uppercase tracking-wider">Verified</Badge>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-foreground">{p.name}</h3>
                <p className="text-xs text-muted-foreground">{p.location}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Available</p>
                    <p className="font-bold text-foreground">{p.available}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Price</p>
                    <p className="font-bold text-foreground">{p.price}</p>
                  </div>
                </div>
                <Button className="w-full mt-4 rounded-full">Buy Credits</Button>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <h2 className="text-2xl font-black text-foreground mb-6">Recent Activity</h2>
        <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Transaction", "Project", "Type", "Amount", "Status", "Date"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {transactions.map((t) => (
                <tr key={t.tx} className="hover:bg-accent/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-muted-foreground">{t.tx}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-foreground">{t.project}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{t.type}</td>
                  <td className={`px-6 py-4 text-sm font-semibold ${t.amount.startsWith("+") ? "text-primary" : "text-destructive"}`}>{t.amount}</td>
                  <td className="px-6 py-4"><Badge variant="secondary" className="text-xs">Completed</Badge></td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{t.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Retire Modal */}
      <Dialog open={showRetire} onOpenChange={setShowRetire}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-primary">Retire Credits</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-primary">Amount to Retire (VCC)</label>
              <input type="number" value={retireAmount} onChange={(e) => setRetireAmount(e.target.value)} placeholder="e.g. 500" className="mt-1.5 w-full rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <Button onClick={handleRetire} disabled={loading} className="w-full rounded-xl h-12">
              {loading ? "Processing..." : "Burn & Retire"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Certificate Modal */}
      <Dialog open={showCert} onOpenChange={setShowCert}>
        <DialogContent className="sm:max-w-md text-center">
          <div className="py-4">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
              <Award className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-black text-primary">Retirement Certificate</h2>
            <div className="mt-6 space-y-3 text-sm text-left rounded-xl bg-muted/50 p-5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Wallet</span>
                <span className="font-mono font-semibold text-foreground">{account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "0x71C...39A2"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Credits Retired</span>
                <span className="font-bold text-foreground">{retireAmount || "500"} VCC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Timestamp</span>
                <span className="text-foreground">{new Date().toLocaleString()}</span>
              </div>
            </div>
            <Button className="mt-6 rounded-full px-8" onClick={() => setShowCert(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
