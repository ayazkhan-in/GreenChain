import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useWeb3 } from "@/context/Web3Context";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TreePine, Coins, DollarSign, ChevronRight, Upload, MapPin, Trees, Info, ShieldCheck, LineChart as LineChartIcon, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { apiRequest, API_BASE_URL } from "@/lib/api";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { containerVariants, itemVariants, staggerContainer, staggerItem } from "@/lib/animations";

type FarmerProject = {
  id: number;
  project_code: string;
  name: string;
  trees_count: number;
  assigned_credits: number;
  status: string;
  submitted_at?: string;
  files: { url: string; fileType: string; originalName?: string }[];
};

type ProjectDetail = FarmerProject & {
  latitude: number | null;
  longitude: number | null;
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

// Tree types with CO2 multipliers (kg CO2 per tree per year)
const TREE_TYPES = [
  { id: "oak", name: "Oak", multiplier: 21.77, description: "High CO2 sequestration" },
  { id: "pine", name: "Pine", multiplier: 18.41, description: "Fast-growing, reliable" },
  { id: "maple", name: "Maple", multiplier: 19.65, description: "Excellent for temperate zones" },
  { id: "birch", name: "Birch", multiplier: 15.32, description: "Hardy species" },
  { id: "spruce", name: "Spruce", multiplier: 20.12, description: "Strong CO2 absorber" },
  { id: "beech", name: "Beech", multiplier: 22.45, description: "Premium sequestration" },
  { id: "ash", name: "Ash", multiplier: 17.89, description: "Versatile species" },
  { id: "mangrove", name: "Mangrove", multiplier: 27.65, description: "Coastal champion" },
];

const BASE_TOKEN_RATE = 0.5; // Credits per kg of CO2 per year

export default function FarmerDashboard() {
  const { submitProject, account } = useWeb3();
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [treeCount, setTreeCount] = useState("");
  const [treeType, setTreeType] = useState("oak");
  const [location, setLocation] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState<"Overview" | "Projects" | "Verification" | "Analytics">("Overview");
  const [projects, setProjects] = useState<FarmerProject[]>([]);
  const [stats, setStats] = useState({ totalTrees: 0, totalCredits: 0 });
  const [profileStats, setProfileStats] = useState({ totalProjects: 0, totalTrees: 0, totalCredits: 0, totalRetirements: 0 });
  const [selectedProject, setSelectedProject] = useState<ProjectDetail | null>(null);
  const [selectedReview, setSelectedReview] = useState<ReviewStatus | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<PublicProfile | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadData = async () => {
    if (!account) return;

    try {
      const [projectResponse, profileResponse] = await Promise.all([
        apiRequest<{ success: boolean; data: { projects: FarmerProject[]; stats: { totalTrees: number; totalCredits: number } } }>("/projects/my", {
          walletAddress: account,
        }),
        apiRequest<{ success: boolean; data: { totalProjects: number; totalTrees: number; totalCredits: number; totalRetirements: number } }>("/users/profile", {
          walletAddress: account,
        }),
      ]);

      setProjects(projectResponse.data.projects || []);
      setStats(projectResponse.data.stats || { totalTrees: 0, totalCredits: 0 });
      setProfileStats(profileResponse.data || { totalProjects: 0, totalTrees: 0, totalCredits: 0, totalRetirements: 0 });
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

  const handleFillSampleProject = () => {
    setProjectName("Pacific Northwest Cedar Restoration");
    setTreeCount("450");
    setTreeType("spruce");
    setLocation("47.606200, -122.332100");
  };

  const handleSubmit = async () => {
    if (!projectName || !treeCount || !treeType) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await apiRequest("/projects", {
        method: "POST",
        walletAddress: account,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectName,
          treesCount: Number(treeCount),
          treeType,
          location: location || "47.606200, -122.332100",
        }),
      });

      toast.success("Project submitted successfully!");
      setShowModal(false);
      setProjectName("");
      setTreeCount("");
      setTreeType("oak");
      setLocation("");
      setFiles([]);
      await loadData();
    } catch (e: any) {
      console.error("Submit error:", e);
      toast.error(e.message || "Failed to submit project");
    } finally {
      setLoading(false);
    }
  };

  const calculateExpectedCredits = () => {
    if (!treeCount || !treeType) return 0;
    const selectedTree = TREE_TYPES.find(t => t.id === treeType);
    if (!selectedTree) return 0;
    const co2Total = Number(treeCount) * selectedTree.multiplier;
    return Math.round(co2Total * BASE_TOKEN_RATE);
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

  const pendingProjects = projects.filter((p) => p.status !== "verified");

  const monthlySeries = projects
    .map((p) => {
      const date = p.submitted_at ? new Date(p.submitted_at) : null;
      const month = date ? date.toLocaleString("en-US", { month: "short" }) : "Unknown";
      return {
        month,
        trees: p.trees_count,
        credits: Number(p.assigned_credits || 0),
      };
    })
    .reduce<{ month: string; trees: number; credits: number }[]>((acc, item) => {
      const existing = acc.find((row) => row.month === item.month);
      if (existing) {
        existing.trees += item.trees;
        existing.credits += item.credits;
      } else {
        acc.push(item);
      }
      return acc;
    }, []);

  const chartData = monthlySeries.length
    ? monthlySeries
    : [
        { month: "Jan", trees: 0, credits: 0 },
        { month: "Feb", trees: 0, credits: 0 },
        { month: "Mar", trees: 0, credits: 0 },
      ];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <aside className="hidden lg:flex w-64 flex-col border-r border-border p-6 min-h-[calc(100vh-4rem)]">
          <div className="mb-8">
            <h2 className="text-lg font-bold text-foreground">GreenChain</h2>
            <p className="text-xs text-primary font-semibold uppercase tracking-wider">Verified Biome</p>
          </div>
          <nav className="space-y-1 flex-1">
            {(["Overview", "Projects", "Verification", "Analytics"] as const).map((item) => (
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

        <main className="flex-1 p-6 md:p-10">
          <motion.div initial="hidden" animate="visible" variants={containerVariants}>
            <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">Active Session</span>
              </div>
              <Button onClick={() => { setShowModal(true); fetchLocation(); }} className="rounded-full">Submit Project</Button>
            </motion.div>

            {activeTab === "Overview" && (
              <>
                <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-6 mb-10">
                  <StatCard icon={<TreePine className="h-5 w-5" />} label="Total Trees Planted" value={stats.totalTrees.toLocaleString()} badge="Live" />
                  <StatCard icon={<Coins className="h-5 w-5" />} label="Credits Earned" value={stats.totalCredits.toLocaleString()} badge="Available" />
                  <StatCard icon={<DollarSign className="h-5 w-5" />} label="Total Earnings" value={`₹${(stats.totalCredits * 83).toLocaleString()}`} badge="INR Est" />
                </motion.div>

              <div className="mb-6">
                <h2 className="text-2xl font-black text-foreground">My Projects</h2>
                <p className="mt-1 text-sm text-muted-foreground">Manage your active biomes and monitor real-time verification status across the GreenChain network.</p>
              </div>

              <motion.div variants={itemVariants} className="rounded-2xl border border-border bg-card shadow-card divide-y divide-border">
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
              </motion.div>
            </>
          )}

          {activeTab === "Projects" && (
            <>
              <motion.div variants={itemVariants} className="mb-6">
                <h2 className="text-2xl font-black text-foreground">Project Management</h2>
                <p className="mt-1 text-sm text-muted-foreground">Deep view of your submissions, progress, and project health.</p>
              </motion.div>

              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid md:grid-cols-2 gap-6">
                {projects.map((p) => (
                  <motion.div key={p.id} variants={staggerItem} className="rounded-2xl border border-border bg-card p-6 shadow-card hover:shadow-elevated transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img src={p.files?.[0]?.url || "https://images.unsplash.com/photo-1476234251651-f353703a034d"} alt={p.name} className="h-12 w-12 rounded-full object-cover" />
                        <div>
                          <p className="font-bold text-foreground">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.project_code}</p>
                        </div>
                      </div>
                      <StatusBadge status={p.status === "verified" ? "verified" : "pending"} />
                    </div>

                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Trees</span>
                        <span className="font-semibold text-foreground">{p.trees_count.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Credits</span>
                        <span className="font-semibold text-foreground">{Number(p.assigned_credits || 0).toLocaleString()} VCC</span>
                      </div>
                    </div>

                    <Button className="mt-5 w-full rounded-full" variant="outline" onClick={() => void openProjectDetail(p.id)}>
                      View Details
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}

          {activeTab === "Verification" && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-black text-foreground">Verification Center</h2>
                <p className="mt-1 text-sm text-muted-foreground">Track pending submissions under review and verification status.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <StatCard icon={<ShieldCheck className="h-5 w-5" />} label="Pending Verification" value={pendingProjects.length.toString()} badge="Live Queue" />
                <StatCard icon={<Coins className="h-5 w-5" />} label="Verified Projects" value={(projects.length - pendingProjects.length).toString()} badge="Approved" />
              </div>

              <div className="space-y-4">
                {pendingProjects.length > 0 ? (
                  pendingProjects.map((p) => (
                    <div key={p.id} className="rounded-2xl border border-border bg-card p-6 shadow-card">
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <div>
                          <p className="font-bold text-foreground">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.project_code}</p>
                        </div>
                        <StatusBadge status="pending" />
                      </div>

                      <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full w-1/2 bg-primary" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">Review in progress. Satellite and admin checks pending.</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-border bg-card p-8 text-center">
                    <ShieldCheck className="h-10 w-10 text-primary mx-auto mb-3" />
                    <p className="font-semibold text-foreground">No pending verifications</p>
                    <p className="text-sm text-muted-foreground">All submitted projects are processed.</p>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === "Analytics" && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-black text-foreground">Impact Analytics</h2>
                <p className="mt-1 text-sm text-muted-foreground">Visualize growth in tree counts and verified credit outcomes.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                  <div className="flex items-center gap-2 mb-4">
                    <LineChartIcon className="h-5 w-5 text-primary" />
                    <h3 className="font-bold text-foreground">Credit Yield</h3>
                  </div>
                  <ChartContainer config={{ credits: { label: "Credits", color: "hsl(var(--primary))" } }} className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="credits" fill="var(--color-credits)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                  <div className="flex items-center gap-2 mb-4">
                    <Trees className="h-5 w-5 text-primary" />
                    <h3 className="font-bold text-foreground">Tree Growth</h3>
                  </div>
                  <ChartContainer config={{ trees: { label: "Trees", color: "hsl(var(--primary))" } }} className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area type="monotone" dataKey="trees" stroke="var(--color-trees)" fill="var(--color-trees)" fillOpacity={0.2} strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <StatCard label="Total Projects" value={profileStats.totalProjects.toString()} />
                <StatCard label="Total Trees" value={profileStats.totalTrees.toLocaleString()} />
                <StatCard label="Total Credits" value={profileStats.totalCredits.toLocaleString()} />
                <StatCard label="Total Retirements" value={profileStats.totalRetirements.toString()} />
              </div>
            </>
          )}
          </motion.div>
        </main>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-black text-primary">Submit Project</DialogTitle>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Verification Portal V1.0</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleFillSampleProject}
              className="rounded-full text-xs font-semibold text-primary border-primary/30 hover:bg-primary/10 gap-1.5 mr-6"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Fill Sample Data
            </Button>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-primary">Project Name</Label>
              <div className="relative mt-1.5">
                <Input placeholder="e.g. North Valley Restoration" value={projectName} onChange={(e) => setProjectName(e.target.value)} className="rounded-xl border-border bg-muted/50" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-primary">Number of Trees</Label>
                <div className="relative mt-1.5">
                  <Trees className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                  <Input placeholder="e.g. 500" value={treeCount} onChange={(e) => setTreeCount(e.target.value)} className="pl-10 rounded-xl border-border bg-muted/50" type="number" />
                </div>
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-primary">Tree Type</Label>
                <div className="mt-1.5">
                  <select value={treeType} onChange={(e) => setTreeType(e.target.value)} className="w-full rounded-xl border border-border bg-muted/50 px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all">
                    {TREE_TYPES.map((tree) => (
                      <option key={tree.id} value={tree.id}>
                        {tree.name} ({tree.multiplier} kg CO2/year)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            {treeType && treeCount && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-secondary/30 border border-primary/30 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Expected Credits</p>
                    <p className="text-2xl font-bold text-primary">{calculateExpectedCredits()} VCC</p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    {Number(treeCount)} trees × {TREE_TYPES.find(t => t.id === treeType)?.multiplier} kg CO2/year × {BASE_TOKEN_RATE} credits
                  </div>
                </div>
              </motion.div>
            )}
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-primary">Project Location</Label>
              <div className="relative mt-1.5 flex items-center gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                  <Input readOnly placeholder={locationLoading ? "Fetching GPS..." : "GPS Coordinates"} value={location} className="pl-10 rounded-xl border-border bg-muted/50 cursor-default" />
                </div>
                <Button type="button" variant="outline" size="sm" onClick={fetchLocation} disabled={locationLoading} className="rounded-xl shrink-0">
                  {locationLoading ? "Fetching..." : "Refresh"}
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-primary">Site Documentation</Label>
              <div
                className="mt-1.5 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 p-6 text-center cursor-pointer hover:border-primary/60 hover:bg-muted/30 transition-all relative"
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
                      <div key={i} className="flex items-center gap-2 rounded-lg bg-secondary/60 px-3 py-2 text-xs">
                        <Upload className="h-3 w-3 text-primary shrink-0" />
                        <span className="text-foreground truncate">{f.name}</span>
                        <span className="text-muted-foreground text-xs ml-auto shrink-0">{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground mt-2">Click or drop to add more files</p>
                  </div>
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-primary mb-2 opacity-60" />
                    <p className="font-semibold text-foreground text-xs">Drop high-resolution imagery</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, PNG, JPG, WEBP (Max 10MB each)</p>
                  </>
                )}
              </div>
            </div>
            <div className="rounded-xl bg-muted/50 p-3 flex items-start gap-2">
              <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">Credits are calculated automatically based on tree type and count. All submissions undergo satellite verification and peer review.</p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button onClick={handleSubmit} disabled={loading || !projectName || !treeCount} className="flex-1 rounded-xl h-10">
                {loading ? "Submitting..." : `Submit (${calculateExpectedCredits()} VCC)`}
              </Button>
              <Button variant="outline" onClick={() => { setShowModal(false); setProjectName(""); setTreeCount(""); setTreeType("oak"); }} className="rounded-xl">
                Cancel
              </Button>
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
