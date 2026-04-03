import { useState } from "react";
import { useWeb3 } from "@/context/Web3Context";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TreePine, Coins, DollarSign, ChevronRight, Upload, MapPin, Trees, Info } from "lucide-react";
import amazonImg from "@/assets/amazon-basin.jpg";
import pineImg from "@/assets/northern-pine.jpg";
import borealImg from "@/assets/boreal-forest.jpg";

const projects = [
  { id: 1, name: "Amazon Basin Restoration", code: "GC-4492-B", trees: 4500, credits: "1,200 GRC", status: "verified" as const, img: amazonImg },
  { id: 2, name: "Northern Pine Initiative", code: "GC-9912-X", trees: 8340, credits: "3,050 GRC", status: "pending" as const, img: pineImg },
  { id: 3, name: "Boreal Growth Reserve", code: "GC-2104-Z", trees: 12100, credits: "Pending", status: "verified" as const, img: borealImg },
];

export default function FarmerDashboard() {
  const { submitProject, account } = useWeb3();
  const [showModal, setShowModal] = useState(false);
  const [treeCount, setTreeCount] = useState("");
  const [location, setLocation] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleSubmit = async () => {
    if (!treeCount) return;
    setLoading(true);
    await submitProject(Number(treeCount));
    setLoading(false);
    setShowModal(false);
    setTreeCount("");
    setLocation("");
    setFiles([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col border-r border-border p-6 min-h-[calc(100vh-4rem)]">
          <div className="mb-8">
            <h2 className="text-lg font-bold text-foreground">GreenChain</h2>
            <p className="text-xs text-primary font-semibold uppercase tracking-wider">Verified Biome</p>
          </div>
          <nav className="space-y-1 flex-1">
            {["Overview", "Projects", "Verification", "Analytics"].map((item, i) => (
              <button key={item} className={`flex items-center gap-3 w-full rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${i === 0 ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}>
                {item}
              </button>
            ))}
          </nav>
          <div className="space-y-2 mt-auto">
            <button className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Settings</button>
            <button className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Support</button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 md:p-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Active Session</span>
            </div>
            <Button onClick={() => setShowModal(true)} className="rounded-full">Submit Project</Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <StatCard icon={<TreePine className="h-5 w-5" />} label="Total Trees Planted" value="12,840" badge="+12% Month" />
            <StatCard icon={<Coins className="h-5 w-5" />} label="Credits Earned" value="4,250" badge="Available" />
            <StatCard icon={<DollarSign className="h-5 w-5" />} label="Total Earnings" value="$84,120" badge="USD Value" />
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-black text-foreground">My Projects</h2>
            <p className="mt-1 text-sm text-muted-foreground">Manage your active biomes and monitor real-time verification status across the GreenChain network.</p>
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-card divide-y divide-border">
            {projects.map((p) => (
              <div key={p.id} className="flex items-center gap-4 p-5 hover:bg-accent/50 transition-colors">
                <img src={p.img} alt={p.name} className="h-12 w-12 rounded-full object-cover" loading="lazy" width={48} height={48} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">ID: {p.code}</p>
                </div>
                <div className="text-center hidden sm:block">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Tree Count</p>
                  <p className="text-lg font-bold text-foreground">{p.trees.toLocaleString()}</p>
                </div>
                <div className="text-center hidden sm:block">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Credits</p>
                  <p className="text-lg font-bold text-foreground">{p.credits}</p>
                </div>
                <StatusBadge status={p.status} />
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Submit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-primary">Submit Project</DialogTitle>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Verification Portal V1.0</p>
          </DialogHeader>
          <div className="space-y-5 mt-4">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-primary">Number of Trees</Label>
              <div className="relative mt-1.5">
                <Trees className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                <Input placeholder="e.g. 500" value={treeCount} onChange={(e) => setTreeCount(e.target.value)} className="pl-10 rounded-xl border-border bg-muted/50" type="number" />
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-primary">Project Location</Label>
              <div className="relative mt-1.5">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                <Input placeholder="GPS Coordinates or Address" value={location} onChange={(e) => setLocation(e.target.value)} className="pl-10 rounded-xl border-border bg-muted/50" />
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-primary">Site Documentation</Label>
              <div
                className="mt-1.5 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-8 text-center cursor-pointer hover:border-primary/50 transition-colors relative"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {files.length > 0 ? (
                  <div className="space-y-2 w-full">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm">
                        <Upload className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-foreground truncate">{f.name}</span>
                        <span className="text-muted-foreground text-xs ml-auto shrink-0">{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground mt-1">Click or drop to add more</p>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-primary mb-2" />
                    <p className="font-semibold text-primary text-sm">Drop high-resolution imagery</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG or Drone Footage (Max 50MB)</p>
                  </>
                )}
              </div>
            </div>
            <div className="rounded-xl bg-muted/50 p-4 flex items-start gap-3">
              <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">All submissions undergo automated satellite verification and manual peer review within the GreenChain biome. Ensure images show clear canopy visibility.</p>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={handleSubmit} disabled={loading} className="flex-1 rounded-xl h-12">
                {loading ? "Submitting..." : "Submit for Verification"}
              </Button>
              <Button variant="ghost" onClick={() => setShowModal(false)}>Save as Draft</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
