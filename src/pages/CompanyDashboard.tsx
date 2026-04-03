import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useWeb3 } from "@/context/Web3Context";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Coins, Leaf, Award, Flame } from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";
import { Contract, parseUnits } from "ethers";
import { GREEN_TOKEN_ABI, GREEN_TOKEN_ADDRESS, etherscanTxUrl } from "@/lib/contracts";
import { containerVariants, itemVariants, staggerContainer, staggerItem } from "@/lib/animations";

type MarketListing = {
  id: number;
  title: string;
  category: string;
  location: string;
  available_quantity: number;
  price_per_credit: number;
  seller_wallet_address?: string;
};

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
  const [showRetire, setShowRetire] = useState(false);
  const [retireAmount, setRetireAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCert, setShowCert] = useState(false);
  const [filter, setFilter] = useState("All Projects");
  const [marketProjects, setMarketProjects] = useState<MarketListing[]>([]);
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [summary, setSummary] = useState({ totalPurchased: 0, totalRetired: 0, balance: 0 });
  const [retirements, setRetirements] = useState<Retirement[]>([]);
  const [certificate, setCertificate] = useState<{ certificateNo?: string; amount: number; wallet: string; timestamp: string; txHash?: string; txUrl?: string } | null>(null);
  const [profile, setProfile] = useState<{ totalProjects: number; totalTrees: number; totalCredits: number; totalRetirements: number } | null>(null);

  const loadData = async () => {
    if (!account) return;
    try {
      const [listingsRes, summaryRes, txRes, retirementsRes, profileRes] = await Promise.all([
        apiRequest<{ success: boolean; data: MarketListing[] }>("/market/listings", { walletAddress: account }),
        apiRequest<{ success: boolean; data: { totalPurchased: number; totalRetired: number; balance: number } }>("/market/portfolio/summary", { walletAddress: account }),
        apiRequest<{ success: boolean; data: Tx[] }>("/market/portfolio/transactions", { walletAddress: account }),
        apiRequest<{ success: boolean; data: Retirement[] }>("/market/credits/retirements", { walletAddress: account }),
        apiRequest<{ success: boolean; data: { totalProjects: number; totalTrees: number; totalCredits: number; totalRetirements: number } }>("/users/profile", { walletAddress: account }),
      ]);
      setMarketProjects(listingsRes.data || []);
      setSummary(summaryRes.data || { totalPurchased: 0, totalRetired: 0, balance: 0 });
      setTransactions(txRes.data || []);
      setRetirements(retirementsRes.data || []);
      setProfile(profileRes.data || null);
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

  useEffect(() => {
    void loadData();
  }, [account]);

  const handleBuy = async (listingId: number) => {
    if (!account || !signer) return;
    try {
      const listing = marketProjects.find((item) => item.id === listingId);
      if (!listing) {
        throw new Error("Listing not found");
      }

      const sellerWallet = listing.seller_wallet_address;
      if (!sellerWallet) {
        throw new Error("Seller wallet not available for this listing");
      }

      const token = new Contract(GREEN_TOKEN_ADDRESS, GREEN_TOKEN_ABI, signer);
      const decimals = Number(await token.decimals());
      const quantity = 100;
      const units = parseUnits(String(quantity), decimals);

      if (sellerWallet.toLowerCase() === account.toLowerCase()) {
        throw new Error("Seller and buyer wallet are the same for this listing.");
      }

      const [sellerBalance, buyerAllowance] = await Promise.all([
        token.balanceOf(sellerWallet),
        token.allowance(sellerWallet, account),
      ]);

      if (sellerBalance < units) {
        throw new Error("Seller wallet does not have enough token balance for this purchase.");
      }

      if (buyerAllowance < units) {
        throw new Error("Seller must approve your wallet first before you can buy these credits.");
      }

      const transferTx = await token.transferFrom(sellerWallet, account, units);
      await transferTx.wait();

      await apiRequest("/market/purchase", {
        method: "POST",
        walletAddress: account,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, quantity, txHash: transferTx.hash }),
      });

      const link = etherscanTxUrl(transferTx.hash);
      toast.success(link ? `Purchase completed. Tx: ${link}` : "Purchased 100 credits successfully");
      await loadData();
    } catch (e: any) {
      toast.error(e.message || "Purchase failed");
    }
  };

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

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-10">
        <motion.div initial="hidden" animate="visible" variants={containerVariants}>
          <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-black text-foreground">Portfolio Overview</h1>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary mt-1">Verified Biome Statistics</p>
            </div>
            {role === "company" && (
              <Button onClick={() => setShowRetire(true)} className="rounded-full gap-2">
                <Flame className="h-4 w-4" /> Retire Credits
              </Button>
            )}
          </motion.div>

          <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-6 mb-12">
          {role === "company" && (
            <>
              <StatCard icon={<Coins className="h-5 w-5" />} label="Total Purchased" value={`${summary.totalPurchased.toLocaleString()} VCC`} />
              <StatCard icon={<Leaf className="h-5 w-5" />} label="CO2 Offset" value={`${(summary.totalPurchased * 0.72).toLocaleString(undefined, { maximumFractionDigits: 2 })} TONS`} badge="Estimated conversion" />
              <div className="rounded-2xl border border-border bg-card p-6 shadow-card flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary font-black text-lg">A+</div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Market Impact</p>
                  <p className="font-bold text-foreground">Balance {summary.balance.toLocaleString()} VCC</p>
                  <p className="text-xs text-muted-foreground">Retired {summary.totalRetired.toLocaleString()} VCC</p>
                  <p className="text-xs text-muted-foreground">Projects {profile?.totalProjects ?? 0} | Trees {profile?.totalTrees ?? 0}</p>
                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* Marketplace */}
        <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-foreground">Credit Marketplace</h2>
          <div className="flex gap-2">
            {["All Projects", "Reforestation", "Renewable Energy"].map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${filter === f ? "border-foreground text-foreground" : "border-border text-muted-foreground hover:border-foreground"}`}>
                {f}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid md:grid-cols-4 gap-6 mb-12">
          {marketProjects.map((p) => (
            <motion.div key={p.id} variants={staggerItem} className="rounded-2xl border border-border bg-card shadow-card overflow-hidden hover:shadow-elevated transition-shadow">
              <div className="relative h-40 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1448375240586-882707db888b" alt={p.title} className="w-full h-full object-cover" loading="lazy" />
                <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] uppercase tracking-wider">Verified</Badge>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-foreground">{p.title}</h3>
                <p className="text-xs text-muted-foreground">{p.location}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Available</p>
                    <p className="font-bold text-foreground">{Number(p.available_quantity).toLocaleString()} VCC</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Price</p>
                    <p className="font-bold text-foreground">${Number(p.price_per_credit).toFixed(2)}</p>
                  </div>
                </div>
                {role === "company" ? (
                  <Button className="w-full mt-4 rounded-full" onClick={() => void handleBuy(p.id)}>Buy 100 Credits</Button>
                ) : (
                  <Button className="w-full mt-4 rounded-full" variant="outline" disabled>
                    View Only
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Recent Activity */}
        {role === "company" && (
          <>
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
                    <tr key={t.id} className="hover:bg-accent/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-muted-foreground">
                        {t.tx_url ? (
                          <a href={t.tx_url} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
                            {t.tx_hash || "-"}
                          </a>
                        ) : (t.tx_hash || "-")}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-foreground">{t.type === "purchase" ? "Marketplace" : "Offset Pool"}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{t.type}</td>
                      <td className={`px-6 py-4 text-sm font-semibold ${t.type === "purchase" ? "text-primary" : "text-destructive"}`}>{t.type === "purchase" ? "+" : "-"}{t.quantity} VCC</td>
                      <td className="px-6 py-4"><Badge variant="secondary" className="text-xs">{t.status}</Badge></td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {role === "company" && (
          <div className="mt-12">
            <h2 className="text-2xl font-black text-foreground mb-6">Retirement History</h2>
            <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {["Certificate", "Quantity", "Date", "Action"].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {retirements.map((retirement) => (
                    <tr key={retirement.id} className="hover:bg-accent/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-muted-foreground">{retirement.certificate_no}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-foreground">{retirement.quantity} VCC</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(retirement.created_at).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <Button variant="outline" size="sm" onClick={() => void viewCertificate(retirement.id)}>View Certificate</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        </motion.div>
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
                <span className="font-mono font-semibold text-foreground">{certificate?.wallet ? `${certificate.wallet.slice(0, 6)}...${certificate.wallet.slice(-4)}` : account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "0x71C...39A2"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Credits Retired</span>
                <span className="font-bold text-foreground">{certificate?.amount || retireAmount || "500"} VCC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Certificate No</span>
                <span className="font-mono font-semibold text-foreground">{certificate?.certificateNo || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Burn Tx</span>
                {certificate?.txUrl ? (
                  <a href={certificate.txUrl} target="_blank" rel="noreferrer" className="font-mono font-semibold text-foreground underline-offset-2 hover:underline">
                    {certificate.txHash?.slice(0, 10)}...
                  </a>
                ) : (
                  <span className="font-mono font-semibold text-foreground">-</span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Timestamp</span>
                <span className="text-foreground">{certificate?.timestamp ? new Date(certificate.timestamp).toLocaleString() : new Date().toLocaleString()}</span>
              </div>
            </div>
            <Button className="mt-6 rounded-full px-8" onClick={() => setShowCert(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {role === "company" && retirements.length > 0 && (
        <div className="container pb-10">
          <h3 className="text-xl font-black text-foreground mb-4">Recent Retirement Certificates</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {retirements.slice(0, 4).map((retirement) => (
              <div key={retirement.id} className="rounded-2xl border border-border bg-card p-4 shadow-card flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{retirement.certificate_no}</p>
                  <p className="font-bold text-foreground">{retirement.quantity} VCC</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => void viewCertificate(retirement.id)}>View</Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
