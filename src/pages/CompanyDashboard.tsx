import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useWeb3 } from "@/context/Web3Context";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coins, Leaf, Award, Flame, TrendingUp, Download, Share2, BarChart3, TrendingDown, Trees, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";
import { containerVariants, itemVariants, staggerContainer, staggerItem } from "@/lib/animations";

const INR_RATE = 83; // USD to INR conversion rate

type Tx = {
  id: number;
  tx_hash: string;
  tx_url?: string;
  type: string;
  quantity: number;
  status: string;
  created_at: string;
};

type Retirement = {
  id: number;
  quantity: number;
  burn_tx_hash?: string;
  burn_tx_url?: string;
  certificate_no: string;
  created_at: string;
};

export default function CompanyDashboard() {
  const { burnTokens, account, role, signer } = useWeb3();
  const [activeTab, setActiveTab] = useState<"Overview" | "Purchases" | "Retirement" | "Analytics">("Overview");
  const [showRetire, setShowRetire] = useState(false);
  const [retireAmount, setRetireAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCert, setShowCert] = useState(false);
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [summary, setSummary] = useState({ totalPurchased: 0, totalRetired: 0, balance: 0 });
  const [retirements, setRetirements] = useState<Retirement[]>([]);
  const [certificate, setCertificate] = useState<{ certificateNo?: string; amount: number; wallet: string; timestamp: string; txHash?: string; txUrl?: string } | null>(null);
  const [profile, setProfile] = useState<{ totalProjects: number; totalTrees: number; totalCredits: number; totalRetirements: number } | null>(null);
  
  // Marketplace state
  const [marketProjects, setMarketProjects] = useState<any[]>([]);
  const [filter, setFilter] = useState("All Projects");
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [purchaseAmount, setPurchaseAmount] = useState("");

  const loadData = async () => {
    if (!account) return;
    try {
      const [summaryRes, txRes, retirementsRes, profileRes, marketRes] = await Promise.all([
        apiRequest<{ success: boolean; data: { totalPurchased: number; totalRetired: number; balance: number } }>("/market/portfolio/summary", { walletAddress: account }),
        apiRequest<{ success: boolean; data: Tx[] }>("/market/portfolio/transactions", { walletAddress: account }),
        apiRequest<{ success: boolean; data: Retirement[] }>("/market/credits/retirements", { walletAddress: account }),
        apiRequest<{ success: boolean; data: { totalProjects: number; totalTrees: number; totalCredits: number; totalRetirements: number } }>("/users/profile", { walletAddress: account }),
        apiRequest<{ success: boolean; data: any[] }>("/market/listings", { walletAddress: account }),
      ]);
      setSummary(summaryRes.data || { totalPurchased: 0, totalRetired: 0, balance: 0 });
      setTransactions(txRes.data || []);
      setRetirements(retirementsRes.data || []);
      setProfile(profileRes.data || null);
      setMarketProjects(marketRes.data || []);
    } catch (e: any) {
      toast.error(e.message || "Failed to load company data");
    }
  };

  const viewCertificate = async (retirementId: number) => {
    if (!account) return;
    try {
      const certRes = await apiRequest<{ success: boolean; data: { amount: number; certificateNo: string; wallet: string; timestamp: string; txHash: string; txUrl: string } }>(`/market/credits/retirements/${retirementId}/certificate`, {
        walletAddress: account,
      });
      setCertificate(certRes.data);
      setShowCert(true);
    } catch (e: any) {
      toast.error(e.message || "Failed to load retirement certificate");
    }
  };

  const handleBuy = (project: any) => {
    if (role !== "company") {
      toast.error("Only companies can purchase credits");
      return;
    }
    setSelectedListing(project);
    setShowPurchaseModal(true);
    setPurchaseAmount("");
  };

  const submitPurchase = async () => {
    if (!purchaseAmount || !selectedListing || !account) return;
    
    const quantity = Number(purchaseAmount);
    setLoading(true);
    try {
      const listing = selectedListing;

      if (!listing.id) {
        throw new Error("Invalid listing");
      }

      if (quantity <= 0 || quantity > Number(listing.available_quantity)) {
        throw new Error("Invalid purchase quantity");
      }

      // Call backend API to process the purchase
      // The backend handles credit allocation and balance updates
      const response = await apiRequest<{ success: boolean; data: { id: number; txHash?: string } }>("/market/purchase", {
        method: "POST",
        walletAddress: account,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: listing.id, quantity, txHash: "0x" + Math.random().toString(16).slice(2) }),
      });

      toast.success(`Purchased ${quantity} credits successfully! Your balance has been updated.`);
      setShowPurchaseModal(false);
      setPurchaseAmount("");
      await loadData();
    } catch (e: any) {
      toast.error(e.message || "Purchase failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [account]);

  const handleRetire = async () => {
    if (!retireAmount) return;
    setLoading(true);
    const retirementResult = await burnTokens(Number(retireAmount));
    setLoading(false);
    setShowRetire(false);
    await loadData();
    if (retirementResult) {
      setCertificate({
        certificateNo: retirementResult.certificateNo,
        amount: retirementResult.quantity,
        wallet: account || "",
        timestamp: retirementResult.retiredAt,
        txHash: retirementResult.txHash,
        txUrl: retirementResult.txUrl,
      });
      setShowCert(true);
    }
  };

  const co2Offset = summary.totalRetired * 1.39;
  const totalValue = summary.balance * 83;
  
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="hidden lg:flex w-64 flex-col border-r border-border p-6 min-h-[calc(100vh-4rem)]">
          <div className="mb-8">
            <h2 className="text-lg font-bold text-foreground">GreenChain</h2>
            <p className="text-xs text-primary font-semibold uppercase tracking-wider">Carbon Portfolio</p>
          </div>
          <nav className="space-y-1 flex-1">
            {(["Overview", "Purchases", "Retirement", "Analytics"] as const).map((item) => (
              <button
                key={item}
                onClick={() => setActiveTab(item)}
                className={`flex items-center gap-3 w-full rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === item ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
              >
                {item}
              </button>
            ))}
          </nav>
          <div className="space-y-2 mt-auto">
            <button className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Settings</button>
            <button className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Support</button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-10">
          <motion.div initial="hidden" animate="visible" variants={containerVariants}>
            {/* Header */}
            <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">Portfolio Manager</span>
              </div>
              <Button onClick={() => { setShowRetire(true); }} className="rounded-full gap-2">
                <Flame className="h-4 w-4" /> Retire Credits
              </Button>
            </motion.div>

            {/* Mobile Tab Navigation */}
            <div className="lg:hidden mb-6 flex gap-2 overflow-x-auto pb-2">
              {(["Overview", "Purchases", "Retirement", "Analytics"] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => setActiveTab(item)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${activeTab === item ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === "Overview" && (
              <>
                {/* KPI Cards */}
                <motion.div variants={itemVariants} className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <StatCard 
                    icon={<Coins className="h-5 w-5" />} 
                    label="Active Balance" 
                    value={`${summary.balance.toLocaleString()} VCC`}
                    badge={`₹${(summary.balance * 83).toLocaleString()}`}
                  />
                  <StatCard 
                    icon={<TrendingUp className="h-5 w-5" />} 
                    label="Total Purchased" 
                    value={`${summary.totalPurchased.toLocaleString()} VCC`}
                    badge={`₹${(summary.totalPurchased * 83).toLocaleString()}`}
                  />
                  <StatCard 
                    icon={<Flame className="h-5 w-5" />} 
                    label="Total Retired" 
                    value={`${summary.totalRetired.toLocaleString()} VCC`}
                    badge={`₹${(summary.totalRetired * 83).toLocaleString()}`}
                  />
                  <StatCard 
                    icon={<Leaf className="h-5 w-5" />} 
                    label="CO2 Offset" 
                    value={`${co2Offset.toLocaleString(undefined, { maximumFractionDigits: 0 })} TONS`}
                    badge="Est. sequestered"
                  />
                </motion.div>

                {/* Portfolio Breakdown */}
                <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-6">
                  {/* Credits Distribution */}
                  <div className="rounded-2xl border border-border bg-card shadow-card p-6">
                    <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                      <Coins className="h-4 w-4 text-primary" />
                      Credits Distribution
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Active</span>
                          <span className="font-semibold text-foreground">{Math.round((summary.balance / (summary.balance + summary.totalRetired + 0.01)) * 100)}%</span>
                        </div>
                        <Progress value={(summary.balance / (summary.balance + summary.totalRetired + 0.01)) * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Retired</span>
                          <span className="font-semibold text-foreground">{Math.round((summary.totalRetired / (summary.balance + summary.totalRetired + 0.01)) * 100)}%</span>
                        </div>
                        <Progress value={(summary.totalRetired / (summary.balance + summary.totalRetired + 0.01)) * 100} className="h-2 bg-destructive/10" />
                      </div>
                    </div>
                  </div>

                  {/* Impact Summary */}
                  <div className="rounded-2xl border border-border bg-card shadow-card p-6">
                    <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" />
                      Environmental Impact
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">CO₂ Offset</span>
                        <span className="font-semibold">{co2Offset.toLocaleString(undefined, { maximumFractionDigits: 1 })} T</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Trees Supported</span>
                        <span className="font-semibold">{profile?.totalTrees.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Retirement Count</span>
                        <span className="font-semibold">{retirements.length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Wallet Info */}
                  <div className="rounded-2xl border border-border bg-card shadow-card p-6">
                    <h3 className="font-bold text-foreground mb-4">Wallet Summary</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Account</p>
                        <p className="font-mono text-xs bg-muted rounded px-2 py-1 text-foreground overflow-hidden text-ellipsis">
                          {account ? `${account.slice(0, 12)}...${account.slice(-8)}` : "Not connected"}
                        </p>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Portfolio Value</span>
                        <span className="font-semibold text-primary">₹{totalValue.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </>
            )}

            {/* Purchases Tab */}
            {activeTab === "Purchases" && (
              <>
                <motion.div variants={itemVariants} className="mb-6">
                  <h2 className="text-2xl font-black text-foreground">Purchase History</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Track all your carbon credit purchases from the marketplace.</p>
                </motion.div>

                <motion.div variants={itemVariants} className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
                  {transactions.length === 0 ? (
                    <div className="p-8 text-center">
                      <TrendingUp className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-foreground font-semibold">No purchases yet</p>
                      <p className="text-sm text-muted-foreground">Start by browsing and purchasing credits from the marketplace</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          {["Date", "Type", "Amount", "Value", "Status", "Link"].map((h) => (
                            <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {transactions.slice(0, 50).map((t) => (
                          <tr key={t.id} className="hover:bg-accent/50 transition-colors">
                            <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-sm font-semibold">
                              <Badge variant={t.type === "purchase" ? "default" : "secondary"}>
                                {t.type === "purchase" ? "Purchase" : "Transfer"}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-foreground">{t.quantity} VCC</td>
                            <td className="px-6 py-4 text-sm font-semibold text-primary">₹{(t.quantity * 83).toLocaleString()}</td>
                            <td className="px-6 py-4 text-sm">
                              <Badge variant="outline" className="capitalize">{t.status}</Badge>
                            </td>
                            <td className="px-6 py-4">
                              {t.tx_url ? (
                                <a href={t.tx_url} target="_blank" rel="noreferrer" className="text-xs text-primary underline-offset-2 hover:underline">
                                  View Tx
                                </a>
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </motion.div>
              </>
            )}

            {/* Retirement Tab */}
            {activeTab === "Retirement" && (
              <>
                <motion.div variants={itemVariants} className="mb-6">
                  <h2 className="text-2xl font-black text-foreground">Retirement Certificates</h2>
                  <p className="mt-1 text-sm text-muted-foreground">View and download your carbon credit retirement certificates.</p>
                </motion.div>

                <motion.div variants={itemVariants} className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
                  {retirements.length === 0 ? (
                    <div className="p-8 text-center">
                      <Flame className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-foreground font-semibold">No retirements yet</p>
                      <p className="text-sm text-muted-foreground">Start offsetting your carbon footprint by retiring credits</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          {["Certificate", "Amount", "Value", "Date", "Action"].map((h) => (
                            <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {retirements.map((retirement) => (
                          <tr key={retirement.id} className="hover:bg-accent/50 transition-colors">
                            <td className="px-6 py-4 text-sm font-mono text-muted-foreground">{retirement.certificate_no}</td>
                            <td className="px-6 py-4 text-sm font-semibold text-foreground">{retirement.quantity} VCC</td>
                            <td className="px-6 py-4 text-sm font-semibold text-primary">₹{(retirement.quantity * 83).toLocaleString()}</td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(retirement.created_at).toLocaleString()}</td>
                            <td className="px-6 py-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => void viewCertificate(retirement.id)}
                                className="text-xs gap-1"
                              >
                                <Download className="h-3 w-3" />
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </motion.div>
              </>
            )}

            {/* Analytics Tab */}
            {activeTab === "Analytics" && (
              <>
                <motion.div variants={itemVariants} className="mb-6">
                  <h2 className="text-2xl font-black text-foreground">Portfolio Analytics</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Key metrics and insights about your carbon offset portfolio.</p>
                </motion.div>

                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid md:grid-cols-2 gap-6">
                  {/* Summary Stats */}
                  <motion.div variants={staggerItem} className="rounded-2xl border border-border bg-card shadow-card p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      <h3 className="font-bold text-foreground">Portfolio Summary</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-4 border-b border-border">
                        <span className="text-sm text-muted-foreground">Active Credits</span>
                        <span className="font-bold text-lg text-foreground">{summary.balance.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center pb-4 border-b border-border">
                        <span className="text-sm text-muted-foreground">Total Purchased</span>
                        <span className="font-bold text-lg text-foreground">{summary.totalPurchased.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center pb-4 border-b border-border">
                        <span className="text-sm text-muted-foreground">Total Retired</span>
                        <span className="font-bold text-lg text-primary">{summary.totalRetired.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Retirement Rate</span>
                        <span className="font-bold text-lg text-foreground">
                          {summary.totalPurchased > 0 ? ((summary.totalRetired / summary.totalPurchased) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Impact Metrics */}
                  <motion.div variants={staggerItem} className="rounded-2xl border border-border bg-card shadow-card p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <Award className="h-5 w-5 text-primary" />
                      <h3 className="font-bold text-foreground">Impact Metrics</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-4 border-b border-border">
                        <span className="text-sm text-muted-foreground">CO₂ Offset (Tons)</span>
                        <span className="font-bold text-lg text-foreground">{co2Offset.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
                      </div>
                      <div className="flex justify-between items-center pb-4 border-b border-border">
                        <span className="text-sm text-muted-foreground">Retirement Count</span>
                        <span className="font-bold text-lg text-foreground">{retirements.length}</span>
                      </div>
                      <div className="flex justify-between items-center pb-4 border-b border-border">
                        <span className="text-sm text-muted-foreground">Trees Supported</span>
                        <span className="font-bold text-lg text-foreground">{profile?.totalTrees.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Portfolio Value (INR)</span>
                        <span className="font-bold text-lg text-primary">₹{totalValue.toLocaleString()}</span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Trend Stats Grid */}
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid md:grid-cols-4 gap-4 mt-6">
                  <motion.div variants={staggerItem} className="rounded-2xl border border-border bg-card p-4 text-center">
                    <div className="text-muted-foreground text-xs uppercase font-semibold mb-2">Avg Purchase Size</div>
                    <div className="text-2xl font-bold text-foreground">
                      {transactions.length > 0 
                        ? Math.round(transactions.reduce((sum, t) => sum + t.quantity, 0) / transactions.length)
                        : 0}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">VCC</div>
                  </motion.div>
                  <motion.div variants={staggerItem} className="rounded-2xl border border-border bg-card p-4 text-center">
                    <div className="text-muted-foreground text-xs uppercase font-semibold mb-2">Avg Retirement Size</div>
                    <div className="text-2xl font-bold text-foreground">
                      {retirements.length > 0
                        ? Math.round(retirements.reduce((sum, r) => sum + r.quantity, 0) / retirements.length)
                        : 0}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">VCC</div>
                  </motion.div>
                  <motion.div variants={staggerItem} className="rounded-2xl border border-border bg-card p-4 text-center">
                    <div className="text-muted-foreground text-xs uppercase font-semibold mb-2">Total Transactions</div>
                    <div className="text-2xl font-bold text-foreground">{transactions.length}</div>
                    <div className="text-xs text-muted-foreground mt-1">purchases</div>
                  </motion.div>
                  <motion.div variants={staggerItem} className="rounded-2xl border border-border bg-card p-4 text-center">
                    <div className="text-muted-foreground text-xs uppercase font-semibold mb-2">Portfolio Activity</div>
                    <div className="text-2xl font-bold text-foreground flex items-center justify-center gap-1">
                      {transactions.length + retirements.length}
                      <TrendingDown className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">actions</div>
                  </motion.div>
                </motion.div>
              </>
            )}
          </motion.div>

          {/* Marketplace Section */}
          <motion.div initial="hidden" animate="visible" variants={containerVariants} className="mt-16">
            <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-foreground">Carbon Credit Marketplace</h2>
                <p className="text-sm text-muted-foreground mt-2">Browse and purchase verified carbon credits from projects</p>
              </div>
            </motion.div>

            {/* Filters */}
            <motion.div variants={itemVariants} className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {["All Projects", "Reforestation", "Renewable Energy", "Wetland Conservation"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors border ${filter === f ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-foreground"}`}
                >
                  {f}
                </button>
              ))}
            </motion.div>

            {/* Marketplace Projects Grid */}
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {marketProjects.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-border bg-card shadow-card p-8 text-center">
                  <p className="text-muted-foreground">No carbon credits available at the moment</p>
                </div>
              ) : (
                marketProjects.map((p) => {
                  const totalCredits = Number(p.total_credits || 0);
                  const availableCredits = Number(p.available_quantity || 0);
                  const progressPercent = totalCredits > 0 ? (availableCredits / totalCredits) * 100 : 0;
                  
                  return (
                    <motion.div key={p.id} variants={staggerItem} className="rounded-2xl border border-border bg-card shadow-card overflow-hidden hover:shadow-elevated transition-shadow">
                      <div className="relative h-40 overflow-hidden bg-muted">
                        <img 
                          src={p.project_image || "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80"} 
                          alt={p.project_name || p.title} 
                          className="w-full h-full object-cover" 
                          loading="lazy" 
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80";
                          }}
                        />
                        <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] uppercase tracking-wider">Verified</Badge>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-foreground text-sm truncate">{p.project_name || p.title || 'Unnamed Project'}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {p.tree_type && <Badge variant="outline" className="text-[10px]">{p.tree_type}</Badge>}
                          {p.trees_count && <span className="text-xs text-muted-foreground flex items-center gap-1"><Trees className="h-3 w-3" />{p.trees_count.toLocaleString()}</span>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-1">{p.location}</p>
                        
                        {/* Progress Bar */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Credits Available</p>
                            <p className="text-xs font-bold text-foreground">{availableCredits.toLocaleString()}</p>
                          </div>
                          <Progress value={progressPercent} className="h-2" />
                        </div>
                        
                        <div className="mt-3 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Price / Credit</p>
                            <p className="font-bold text-foreground">₹{(Number(p.price_per_credit || 0) * 83).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Est. CO2</p>
                            <p className="text-xs text-foreground font-semibold">{(availableCredits * 1.39).toFixed(0)} T</p>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full mt-4 rounded-full" 
                          onClick={() => handleBuy(p)}
                          disabled={availableCredits <= 0}
                        >
                          {availableCredits > 0 ? 'Buy Credits' : 'Sold Out'}
                        </Button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          </motion.div>
        </main>
      </div>

      {/* Retire Modal */}
      <Dialog open={showRetire} onOpenChange={setShowRetire}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-primary">Retire Carbon Credits</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider">Amount to Retire (VCC)</Label>
              <Input
                type="number"
                value={retireAmount}
                onChange={(e) => setRetireAmount(e.target.value)}
                placeholder="e.g. 500"
                min="1"
                max={summary.balance}
                className="mt-1.5 rounded-xl"
              />
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-xs text-muted-foreground mr-1">Presets:</span>
                {[25, 50, 100].map((val) => (
                  <Button
                    key={val}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setRetireAmount(String(Math.min(val, summary.balance)))}
                    className="h-7 text-xs rounded-lg border-primary/30 text-primary hover:bg-primary/10 px-2.5"
                  >
                    {val} VCC
                  </Button>
                ))}
                {summary.balance > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setRetireAmount(String(summary.balance))}
                    className="h-7 text-xs rounded-lg border-primary/30 text-primary hover:bg-primary/10 px-2.5"
                  >
                    Max
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Available: {summary.balance.toLocaleString()} VCC (₹{(summary.balance * 83).toLocaleString()})
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              <p className="text-muted-foreground">CO₂ to offset: <span className="font-bold text-foreground">{(Number(retireAmount || 0) * 1.39).toFixed(2)} TONS</span></p>
            </div>
            <Button onClick={handleRetire} disabled={loading || !retireAmount} className="w-full rounded-xl h-12">
              {loading ? "Processing..." : "Burn & Retire"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Certificate Modal */}
      <Dialog open={showCert} onOpenChange={setShowCert}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-primary flex items-center gap-2">
              <Award className="h-5 w-5" />
              Retirement Certificate
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="rounded-lg bg-muted/50 p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Wallet</span>
                <span className="font-mono font-semibold">{certificate?.wallet ? `${certificate.wallet.slice(0, 6)}...${certificate.wallet.slice(-4)}` : account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Retired</span>
                <span className="font-bold">{certificate?.amount || 0} VCC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">INR Value</span>
                <span className="font-bold text-primary">₹{((certificate?.amount || 0) * 83).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">CO₂ Offset</span>
                <span className="font-bold">{((certificate?.amount || 0) * 1.39).toFixed(1)} TONS</span>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Certificate No</span>
                  <span className="font-mono">{certificate?.certificateNo || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span>{certificate?.timestamp ? new Date(certificate.timestamp).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            {certificate?.txUrl && (
              <a href={certificate.txUrl} target="_blank" rel="noreferrer">
                <Button variant="outline" className="w-full gap-2">
                  <Share2 className="h-4 w-4" />
                  View on Etherscan
                </Button>
              </a>
            )}
            <Button onClick={() => setShowCert(false)} variant="outline" className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Purchase Modal */}
      <Dialog open={showPurchaseModal} onOpenChange={setShowPurchaseModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-primary">{selectedListing?.project_name || selectedListing?.title || 'Buy Credits'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {selectedListing && (
              <>
                <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Available Credits</span>
                    <span className="font-bold">{Number(selectedListing.available_quantity).toLocaleString()} VCC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price per Credit</span>
                    <span className="font-bold">₹{(Number(selectedListing.price_per_credit || 0) * 83).toLocaleString()}</span>
                  </div>
                  {selectedListing.trees_count && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Project Trees</span>
                      <span className="font-bold flex items-center gap-1"><Trees className="h-3 w-3" />{selectedListing.trees_count.toLocaleString()}</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider text-primary">Amount to Purchase (VCC)</Label>
                  <Input
                    type="number"
                    value={purchaseAmount}
                    onChange={(e) => setPurchaseAmount(e.target.value)}
                    min="1"
                    max={selectedListing.available_quantity}
                    placeholder="e.g. 100"
                    className="mt-1.5 rounded-xl"
                  />
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-xs text-muted-foreground mr-1">Presets:</span>
                    {[25, 50, 100].map((val) => (
                      <Button
                        key={val}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPurchaseAmount(String(Math.min(val, Number(selectedListing.available_quantity))))}
                        className="h-7 text-xs rounded-lg border-primary/30 text-primary hover:bg-primary/10 px-2.5"
                      >
                        {val} VCC
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Total: ₹{(Number(purchaseAmount || 0) * Number(selectedListing.price_per_credit || 0) * 83).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>
                
                <Button
                  onClick={submitPurchase}
                  disabled={loading || !purchaseAmount || Number(purchaseAmount) <= 0}
                  className="w-full rounded-xl h-12"
                >
                  {loading ? "Processing..." : "Buy Credits"}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
