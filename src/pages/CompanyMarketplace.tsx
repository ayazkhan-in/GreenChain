import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useWeb3 } from "@/context/Web3Context";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trees, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";
import { containerVariants, itemVariants, staggerContainer, staggerItem } from "@/lib/animations";

type MarketListing = {
  id: number;
  title: string;
  category: string;
  location: string;
  available_quantity: number;
  price_per_credit: number;
  seller_wallet_address?: string;
  project_id?: number;
  project_name?: string;
  trees_count?: number;
  tree_type?: string;
  total_credits?: number;
  project_image?: string;
};

export default function CompanyMarketplace() {
  const { account, role } = useWeb3();
  const [marketProjects, setMarketProjects] = useState<MarketListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<MarketListing | null>(null);
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const categories = ["All", "Reforestation", "Renewable Energy", "Wetland Conservation"];

  const loadListings = async () => {
    if (!account) return;
    try {
      const res = await apiRequest<{ success: boolean; data: MarketListing[] }>("/market/listings", {
        walletAddress: account,
      });
      setMarketProjects(res.data || []);
    } catch (e: any) {
      toast.error(e.message || "Failed to load marketplace listings");
    }
  };

  useEffect(() => {
    void loadListings();
  }, [account]);

  const handleBuy = (listing: MarketListing) => {
    setSelectedListing(listing);
    setPurchaseAmount(String(Math.min(100, listing.available_quantity)));
    setShowPurchaseModal(true);
  };

  const submitPurchase = async () => {
    if (!selectedListing || !purchaseAmount || !account) return;

    const quantity = Number(purchaseAmount);
    if (quantity <= 0 || quantity > selectedListing.available_quantity) {
      toast.error("Invalid purchase amount");
      return;
    }

    setLoading(true);
    try {
      const listing = selectedListing;

      if (!listing.id) {
        throw new Error("Invalid listing");
      }

      // Call backend API to process the purchase
      // The backend handles credit allocation and balance updates
      await apiRequest("/market/purchase", {
        method: "POST",
        walletAddress: account,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: listing.id, quantity, txHash: "0x" + Math.random().toString(16).slice(2) }),
      });

      toast.success(`Purchased ${quantity} credits successfully! Your balance has been updated.`);
      setShowPurchaseModal(false);
      setPurchaseAmount("");
      await loadListings();
    } catch (e: any) {
      toast.error(e.message || "Purchase failed");
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = marketProjects.filter((p) => {
    const matchesSearch =
      (p.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (p.location?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const matchesCategory = filterCategory === "All" || (p.category?.includes(filterCategory) ?? false);

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-10">
        <motion.div initial="hidden" animate="visible" variants={containerVariants}>
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-4xl font-black text-foreground">Carbon Credit Marketplace</h1>
            <p className="text-sm text-muted-foreground mt-2">Browse and purchase verified carbon credits from sustainable projects worldwide</p>
          </motion.div>

          {/* Search & Filter */}
          <motion.div variants={itemVariants} className="mb-8 space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-xl"
                />
              </div>
              <div className="flex gap-2">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={filterCategory === cat ? "default" : "outline"}
                    onClick={() => setFilterCategory(cat)}
                    className="rounded-full text-sm"
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Showing {filteredProjects.length} of {marketProjects.length} projects
            </p>
          </motion.div>

          {/* Projects Grid */}
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
            {filteredProjects.map((p) => {
              const totalCredits = Number(p.total_credits || 0);
              const availableCredits = Number(p.available_quantity);
              const progressPercent = totalCredits > 0 ? (availableCredits / totalCredits) * 100 : 0;

              return (
                <motion.div
                  key={p.id}
                  variants={staggerItem}
                  className="rounded-2xl border border-border bg-card shadow-card overflow-hidden hover:shadow-elevated transition-all"
                >
                  <div className="relative h-40 overflow-hidden bg-muted">
                    <img
                      src={p.project_image || "https://images.unsplash.com/photo-1448375240586-882707db888b"}
                      alt={p.project_name || p.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] uppercase tracking-wider">
                      Verified
                    </Badge>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-foreground text-sm line-clamp-2">{p.project_name || p.title || "Unnamed Project"}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {p.tree_type && <Badge variant="outline" className="text-[10px]">{p.tree_type}</Badge>}
                      {p.trees_count && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Trees className="h-3 w-3" />
                          {p.trees_count.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-1">{p.location}</p>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Available</p>
                        <p className="text-xs font-bold text-foreground">
                          {availableCredits.toLocaleString()} / {totalCredits.toLocaleString()}
                        </p>
                      </div>
                      <Progress value={progressPercent} className="h-2" />
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Price</p>
                        <p className="font-bold text-foreground">₹{(Number(p.price_per_credit) * 83).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Est. CO₂</p>
                        <p className="text-xs text-foreground font-semibold">{(availableCredits * 1.39).toFixed(0)} T</p>
                      </div>
                    </div>

                    {role === "company" ? (
                      <Button
                        className="w-full mt-4 rounded-full"
                        onClick={() => handleBuy(p)}
                        disabled={availableCredits <= 0}
                      >
                        {availableCredits > 0 ? "Buy Credits" : "Sold Out"}
                      </Button>
                    ) : (
                      <Button className="w-full mt-4 rounded-full" variant="outline" disabled>
                        View Only
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No projects found matching your criteria.</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Purchase Modal */}
      <Dialog open={showPurchaseModal} onOpenChange={setShowPurchaseModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-primary">{selectedListing?.project_name || selectedListing?.title || "Buy Credits"}</DialogTitle>
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
                    <span className="font-bold">₹{(Number(selectedListing.price_per_credit) * 83).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                  {selectedListing.trees_count && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Project Trees</span>
                      <span className="font-bold flex items-center gap-1">
                        <Trees className="h-3 w-3" />
                        {selectedListing.trees_count.toLocaleString()}
                      </span>
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
                  <p className="text-xs text-muted-foreground mt-2">
                    Total: ₹{((Number(purchaseAmount || 0) * Number(selectedListing.price_per_credit)) * 83).toLocaleString(undefined, { maximumFractionDigits: 0 })}
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
