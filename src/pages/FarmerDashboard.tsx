import { useEffect, useState } from "react";
import { useWeb3 } from "@/context/Web3Context";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TreePine, Coins, DollarSign, ChevronRight, Upload, MapPin, Trees, Info } from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";

type FarmerProject = {
  id: number;
  project_code: string;
  name: string;
  trees_count: number;
  assigned_credits: number;
  status: string;
  files: { url: string; fileType: string }[];
};

type ProjectDetail = FarmerProject & {
  latitude: number | null;
  longitude: number | null;
  submitted_at: string;
  reviewed_at: string | null;
  rejection_reason: string | null;
};

type ReviewStatus = {
  id: number;
  status: string;
  assigned_credits: number;
  rejection_reason: string | null;
  reviewed_at: string | null;
  developer_wallet: string;
  reviews: { decision: string; creditsAssigned: number; reason: string | null; createdAt: string }[];
};

type PublicProfile = {
  wallet_address: string;
  role: string;
  created_at: string;
  total_projects: number;
  total_trees: number;
  total_credits: number;
};

export default function FarmerDashboard() {
  const { submitProject, account } = useWeb3();
  const [showModal, setShowModal] = useState(false);
  const [treeCount, setTreeCount] = useState("");
  const [location, setLocation] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [projects, setProjects] = useState<FarmerProject[]>([]);
  const [stats, setStats] = useState({ totalTrees: 0, totalCredits: 0 });
  const [selectedProject, setSelectedProject] = useState<ProjectDetail | null>(null);
  const [selectedReview, setSelectedReview] = useState<ReviewStatus | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<PublicProfile | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadData = async () => {
    if (!account) return;
    try {
      const response = await apiRequest<{ success: boolean; data: { projects: FarmerProject[]; stats: { totalTrees: number; totalCredits: number } } }>("/projects/my", {
        walletAddress: account,
      });
      setProjects(response.data.projects || []);
      setStats(response.data.stats || { totalTrees: 0, totalCredits: 0 });
    } catch (e: any) {
      toast.error(e.message || "Failed to load projects");
    }
  };

  useEffect(() => {
    void loadData();
  }, [account]);

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

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      setLocation("Geolocation not supported");
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`);
        setLocationLoading(false);
      },
      () => {
        setLocation("Unable to fetch location");
        setLocationLoading(false);
      }
    );
  };

  const handleSubmit = async () => {
    if (!treeCount) return;
    setLoading(true);
    await submitProject({
      trees: Number(treeCount),
      location,
      files,
    });
    setLoading(false);
    setShowModal(false);
    setTreeCount("");
    setLocation("");
    setFiles([]);
    await loadData();
  };

  const openProjectDetail = async (projectId: number) => {
    if (!account) return;
    try {
      const [projectRes, reviewRes] = await Promise.all([
        apiRequest<{ success: boolean; data: ProjectDetail }>(`/projects/${projectId}`, { walletAddress: account }),
        apiRequest<{ success: boolean; data: ReviewStatus }>(`/projects/${projectId}/review-status`, { walletAddress: account }),
      ]);
      const publicProfileRes = await apiRequest<{ success: boolean; data: PublicProfile }>(`/users/${reviewRes.data.developer_wallet}/public`, {
        walletAddress: account,
      });
      setSelectedProject(projectRes.data);
      setSelectedReview(reviewRes.data);
      setSelectedProfile(publicProfileRes.data);
      setDetailOpen(true);
    } catch (e: any) {
      toast.error(e.message || "Failed to load project details");
    }
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
            <Button onClick={() => { setShowModal(true); fetchLocation(); }} className="rounded-full">Submit Project</Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <StatCard icon={<TreePine className="h-5 w-5" />} label="Total Trees Planted" value={stats.totalTrees.toLocaleString()} badge="Live" />
            <StatCard icon={<Coins className="h-5 w-5" />} label="Credits Earned" value={stats.totalCredits.toLocaleString()} badge="Available" />
            <StatCard icon={<DollarSign className="h-5 w-5" />} label="Total Earnings" value={`$${(stats.totalCredits * 18.5).toLocaleString()}`} badge="USD Est" />
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-black text-foreground">My Projects</h2>
            <p className="mt-1 text-sm text-muted-foreground">Manage your active biomes and monitor real-time verification status across the GreenChain network.</p>
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-card divide-y divide-border">
            {projects.map((p) => (
              <div key={p.id} className="flex items-center gap-4 p-5 hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => void openProjectDetail(p.id)}>
                <img src={p.files?.[0]?.url || "https://images.unsplash.com/photo-1476234251651-f353703a034d"} alt={p.name} className="h-12 w-12 rounded-full object-cover" loading="lazy" width={48} height={48} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">ID: {p.project_code}</p>
                </div>
                <div className="text-center hidden sm:block">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Tree Count</p>
                  <p className="text-lg font-bold text-foreground">{p.trees_count.toLocaleString()}</p>
                </div>
                <div className="text-center hidden sm:block">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Credits</p>
                  <p className="text-lg font-bold text-foreground">{p.assigned_credits > 0 ? `${p.assigned_credits} VCC` : "Pending"}</p>
                </div>
                <StatusBadge status={p.status === "verified" ? "verified" : "pending"} />
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
              <div className="relative mt-1.5 flex items-center gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                  <Input readOnly placeholder={locationLoading ? "Fetching GPS..." : "GPS Coordinates"} value={location} className="pl-10 rounded-xl border-border bg-muted/50 cursor-default" />
                </div>
                <Button type="button" variant="outline" size="sm" onClick={fetchLocation} disabled={locationLoading} className="rounded-xl shrink-0">
                  {locationLoading ? "Fetching…" : "Refresh"}
                </Button>
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
                  accept="application/pdf,image/*"
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
                    <p className="text-xs text-muted-foreground">PDF, PNG, JPG, WEBP (Max 10MB each)</p>
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

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-primary">Project Details</DialogTitle>
          </DialogHeader>
          {selectedProject && selectedReview && (
            <div className="space-y-5 mt-4 text-sm">
              <div className="grid md:grid-cols-2 gap-4 rounded-xl bg-muted/50 p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Project Code</p>
                  <p className="font-semibold text-foreground">{selectedProject.project_code}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</p>
                  <p className="font-semibold text-foreground">{selectedProject.status}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Trees</p>
                  <p className="font-semibold text-foreground">{selectedProject.trees_count.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Credits</p>
                  <p className="font-semibold text-foreground">{selectedProject.assigned_credits.toLocaleString()} VCC</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Location</p>
                  <p className="font-semibold text-foreground">{selectedProject.latitude ?? "-"}, {selectedProject.longitude ?? "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reviewed</p>
                  <p className="font-semibold text-foreground">{selectedProject.reviewed_at ? new Date(selectedProject.reviewed_at).toLocaleString() : "Pending"}</p>
                </div>
              </div>
              {selectedProfile && (
                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Developer Profile</p>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div>Projects: <span className="font-semibold text-foreground">{selectedProfile.total_projects}</span></div>
                    <div>Trees: <span className="font-semibold text-foreground">{selectedProfile.total_trees}</span></div>
                    <div>Credits: <span className="font-semibold text-foreground">{selectedProfile.total_credits}</span></div>
                    <div>Role: <span className="font-semibold text-foreground">{selectedProfile.role}</span></div>
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Files</p>
                <div className="space-y-2">
                  {selectedProject.files.length > 0 ? selectedProject.files.map((file, index) => (
                    <a key={`${file.url}-${index}`} href={file.url} target="_blank" rel="noreferrer" className="block rounded-lg border border-border px-3 py-2 hover:bg-accent/50">
                      {file.originalName || file.fileType}
                    </a>
                  )) : <p className="text-muted-foreground">No files uploaded.</p>}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Review Trail</p>
                <div className="space-y-2 rounded-xl bg-muted/50 p-4">
                  {selectedReview.reviews.length > 0 ? selectedReview.reviews.map((review, index) => (
                    <div key={`${review.createdAt}-${index}`} className="flex items-center justify-between gap-3">
                      <span className="capitalize">{review.decision}</span>
                      <span>{review.creditsAssigned || 0} credits</span>
                      <span className="text-muted-foreground">{review.createdAt ? new Date(review.createdAt).toLocaleString() : "-"}</span>
                    </div>
                  )) : <p className="text-muted-foreground">No review history yet.</p>}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
