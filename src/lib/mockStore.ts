export interface MockProject {
  id: number;
  project_code: string;
  name: string;
  trees_count: number;
  tree_type: string;
  assigned_credits: number;
  status: string;
  submitted_at: string;
  latitude: number | null;
  longitude: number | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  developer_wallet: string;
  files: { url: string; fileType: string; originalName?: string }[];
}

export interface MockMarketListing {
  id: number;
  title: string;
  category: string;
  location: string;
  available_quantity: number;
  price_per_credit: number;
  seller_wallet_address: string;
  project_id: number;
  project_name: string;
  trees_count: number;
  tree_type: string;
  total_credits: number;
  project_image: string;
}

export interface MockTransaction {
  id: number;
  tx_hash: string;
  tx_url: string;
  type: string;
  quantity: number;
  status: string;
  created_at: string;
}

export interface MockRetirement {
  id: number;
  quantity: number;
  burn_tx_hash: string;
  burn_tx_url: string;
  certificate_no: string;
  created_at: string;
  certificate: {
    wallet: string;
    amount: number;
    txHash: string;
    txUrl: string;
    timestamp: string;
    certificateNo: string;
  };
}

export interface MockStoreState {
  projects: MockProject[];
  listings: MockMarketListing[];
  transactions: MockTransaction[];
  retirements: MockRetirement[];
  companyBalance: number;
  verifiedTodayCount: number;
}

export const DEMO_WALLETS = {
  project_developer: "0x71C35B92aF75d40A81180f9F2a65b112E55b9319",
  company: "0x89A83c5D65B5aFE2C7E097C22C997eF721B41d24",
  admin: "0x32B164Ec5A8d035417387F0C857877c15B4d11A1",
};

const STORAGE_KEY = "gc_mock_store_v2";

const initialStore: MockStoreState = {
  companyBalance: 1250,
  verifiedTodayCount: 4,
  projects: [
    {
      id: 101,
      project_code: "GC-PRJ-101",
      name: "Highland Oak Reforestation",
      trees_count: 500,
      tree_type: "oak",
      assigned_credits: 5440,
      status: "verified",
      submitted_at: "2026-08-14T09:30:00Z",
      latitude: 34.0522,
      longitude: -118.2437,
      reviewed_at: "2026-08-16T14:10:00Z",
      rejection_reason: null,
      developer_wallet: DEMO_WALLETS.project_developer,
      files: [
        {
          url: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800&q=80",
          fileType: "image",
          originalName: "oak_canopy_survey.jpg",
        },
      ],
    },
    {
      id: 102,
      project_code: "GC-PRJ-102",
      name: "Coastal Mangrove Biosphere",
      trees_count: 850,
      tree_type: "mangrove",
      assigned_credits: 11750,
      status: "verified",
      submitted_at: "2026-08-28T11:45:00Z",
      latitude: 25.7617,
      longitude: -80.1918,
      reviewed_at: "2026-09-02T16:20:00Z",
      rejection_reason: null,
      developer_wallet: DEMO_WALLETS.project_developer,
      files: [
        {
          url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
          fileType: "image",
          originalName: "mangrove_estuary.jpg",
        },
      ],
    },
    {
      id: 103,
      project_code: "GC-PRJ-103",
      name: "Valley Pine Watershed Reserve",
      trees_count: 420,
      tree_type: "pine",
      assigned_credits: 0,
      status: "pending_review",
      submitted_at: "2026-09-15T08:15:00Z",
      latitude: 45.5152,
      longitude: -122.6784,
      reviewed_at: null,
      rejection_reason: null,
      developer_wallet: DEMO_WALLETS.project_developer,
      files: [
        {
          url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
          fileType: "image",
          originalName: "pine_stand_aerial.jpg",
        },
      ],
    },
    {
      id: 104,
      project_code: "GC-PRJ-104",
      name: "Temperate Beech Forest Revival",
      trees_count: 310,
      tree_type: "beech",
      assigned_credits: 0,
      status: "pending_review",
      submitted_at: "2026-09-16T15:00:00Z",
      latitude: 47.6062,
      longitude: -122.3321,
      reviewed_at: null,
      rejection_reason: null,
      developer_wallet: "0x4b78c8430e7c4f4a3e7a6839352e00d72f5d911b",
      files: [
        {
          url: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=800&q=80",
          fileType: "image",
          originalName: "beech_grove_plot.jpg",
        },
      ],
    },
  ],
  listings: [
    {
      id: 201,
      title: "Certified Highland Oak Carbon Credits",
      category: "Reforestation",
      location: "Oregon, United States",
      available_quantity: 450,
      price_per_credit: 18,
      seller_wallet_address: DEMO_WALLETS.project_developer,
      project_id: 101,
      project_name: "Highland Oak Reforestation",
      trees_count: 500,
      tree_type: "oak",
      total_credits: 5440,
      project_image: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 202,
      title: "Coastal Mangrove High-Sequestration Offsets",
      category: "Wetland Conservation",
      location: "Florida Coastal Biosphere, USA",
      available_quantity: 800,
      price_per_credit: 24,
      seller_wallet_address: DEMO_WALLETS.project_developer,
      project_id: 102,
      project_name: "Coastal Mangrove Biosphere",
      trees_count: 850,
      tree_type: "mangrove",
      total_credits: 11750,
      project_image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 203,
      title: "Solar Grid Synergy Offsets - Stage II",
      category: "Renewable Energy",
      location: "Mojave Basin, California",
      available_quantity: 1200,
      price_per_credit: 14,
      seller_wallet_address: "0x98f1b402e35a111a47738b5569c762da94010a33",
      project_id: 105,
      project_name: "Mojave Solar Offsets",
      trees_count: 0,
      tree_type: "solar",
      total_credits: 2400,
      project_image: "https://images.unsplash.com/photo-1509389928833-fe62aef36deb?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 204,
      title: "Valley Pine Agroforestry Ecosystem Credits",
      category: "Reforestation",
      location: "Cascade Foothills, Washington, USA",
      available_quantity: 620,
      price_per_credit: 16,
      seller_wallet_address: DEMO_WALLETS.project_developer,
      project_id: 103,
      project_name: "Valley Pine Watershed Reserve",
      trees_count: 420,
      tree_type: "pine",
      total_credits: 3870,
      project_image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
    },
  ],
  transactions: [
    {
      id: 301,
      tx_hash: "0x8f3c7e9140a7b521dfb638971842eb3a886f488663481e19d7d4c1b99732f7a1",
      tx_url: "https://sepolia.etherscan.io/tx/0x8f3c7e9140a7b521dfb638971842eb3a886f488663481e19d7d4c1b99732f7a1",
      type: "purchase",
      quantity: 350,
      status: "completed",
      created_at: "2026-09-08T14:22:10Z",
    },
    {
      id: 302,
      tx_hash: "0x3a91b2c45e6f78d910a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4",
      tx_url: "https://sepolia.etherscan.io/tx/0x3a91b2c45e6f78d910a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4",
      type: "retire",
      quantity: 100,
      status: "completed",
      created_at: "2026-09-12T10:05:44Z",
    },
    {
      id: 303,
      tx_hash: "0x7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8",
      tx_url: "https://sepolia.etherscan.io/tx/0x7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8",
      type: "purchase",
      quantity: 500,
      status: "completed",
      created_at: "2026-09-14T16:30:19Z",
    },
  ],
  retirements: [
    {
      id: 401,
      quantity: 100,
      burn_tx_hash: "0x3a91b2c45e6f78d910a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4",
      burn_tx_url: "https://sepolia.etherscan.io/tx/0x3a91b2c45e6f78d910a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4",
      certificate_no: "GC-CERT-2026-09121",
      created_at: "2026-09-12T10:05:44Z",
      certificate: {
        wallet: DEMO_WALLETS.company,
        amount: 100,
        txHash: "0x3a91b2c45e6f78d910a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4",
        txUrl: "https://sepolia.etherscan.io/tx/0x3a91b2c45e6f78d910a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4",
        timestamp: "2026-09-12T10:05:44Z",
        certificateNo: "GC-CERT-2026-09121",
      },
    },
  ],
};

export class MockStore {
  private static loadState(): MockStoreState {
    try {
      localStorage.removeItem("gc_mock_store_v1");
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed: MockStoreState = JSON.parse(data);
        let updated = false;
        if (Array.isArray(parsed.listings)) {
          parsed.listings = parsed.listings.map((l) => {
            if (!l.project_image || l.project_image.includes("photo-1511497584788") || l.project_image.includes("photo-1509391365360")) {
              updated = true;
              if (l.id === 202 || l.category?.includes("Wetland") || l.title?.includes("Mangrove")) {
                l.project_image = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80";
              } else if (l.id === 203 || l.category?.includes("Renewable") || l.title?.includes("Solar")) {
                l.project_image = "https://images.unsplash.com/photo-1509389928833-fe62aef36deb?auto=format&fit=crop&w=800&q=80";
              } else {
                l.project_image = "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800&q=80";
              }
            }
            return l;
          });
        }
        if (updated) {
          MockStore.saveState(parsed);
        }
        return parsed;
      }
    } catch {
      // Fall through to initialStore
    }
    MockStore.saveState(initialStore);
    return initialStore;
  }

  private static saveState(state: MockStoreState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // LocalStorage error fallback
    }
  }

  public static reset(): void {
    MockStore.saveState(initialStore);
  }

  public static getState(): MockStoreState {
    return MockStore.loadState();
  }

  public static getProjects(wallet?: string | null): { projects: MockProject[]; stats: { totalTrees: number; totalCredits: number } } {
    const state = MockStore.loadState();
    const projects = state.projects;
    const totalTrees = projects.reduce((sum, p) => sum + p.trees_count, 0);
    const totalCredits = projects.reduce((sum, p) => sum + p.assigned_credits, 0);
    return { projects, stats: { totalTrees, totalCredits } };
  }

  public static createProject(data: {
    name?: string;
    treesCount: number;
    treeType?: string;
    location?: string;
    developerWallet?: string;
  }): MockProject {
    const state = MockStore.loadState();
    const id = Date.now();
    const newProject: MockProject = {
      id,
      project_code: `GC-PRJ-${id.toString().slice(-4)}`,
      name: data.name || "Community Reforestation Initiative",
      trees_count: Number(data.treesCount) || 100,
      tree_type: data.treeType || "oak",
      assigned_credits: 0,
      status: "pending_review",
      submitted_at: new Date().toISOString(),
      latitude: 37.7749,
      longitude: -122.4194,
      reviewed_at: null,
      rejection_reason: null,
      developer_wallet: data.developerWallet || DEMO_WALLETS.project_developer,
      files: [
        {
          url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
          fileType: "image",
          originalName: "project_overview.jpg",
        },
      ],
    };

    state.projects = [newProject, ...state.projects];
    MockStore.saveState(state);
    return newProject;
  }

  public static getListings(): MockMarketListing[] {
    const state = MockStore.loadState();
    return state.listings.filter((l) => l.available_quantity > 0);
  }

  public static purchaseListing(listingId: number, quantity: number): { id: number; txHash: string } {
    const state = MockStore.loadState();
    const listing = state.listings.find((l) => l.id === listingId);
    if (!listing) throw new Error("Listing not found");
    if (listing.available_quantity < quantity) throw new Error("Insufficient credits available");

    listing.available_quantity -= quantity;
    state.companyBalance += quantity;

    const fakeHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    const tx: MockTransaction = {
      id: Date.now(),
      tx_hash: fakeHash,
      tx_url: `https://sepolia.etherscan.io/tx/${fakeHash}`,
      type: "purchase",
      quantity,
      status: "completed",
      created_at: new Date().toISOString(),
    };
    state.transactions = [tx, ...state.transactions];

    MockStore.saveState(state);
    return { id: tx.id, txHash: fakeHash };
  }

  public static getPortfolio(wallet?: string | null) {
    const state = MockStore.loadState();
    const totalPurchased = state.transactions
      .filter((t) => t.type === "purchase")
      .reduce((sum, t) => sum + t.quantity, 0);
    const totalRetired = state.retirements.reduce((sum, r) => sum + r.quantity, 0);

    return {
      summary: {
        totalPurchased,
        totalRetired,
        balance: state.companyBalance,
      },
      transactions: state.transactions,
      retirements: state.retirements,
    };
  }

  public static retireCredits(quantity: number, wallet?: string | null): MockRetirement {
    const state = MockStore.loadState();
    if (quantity <= 0) throw new Error("Invalid quantity");
    if (state.companyBalance < quantity) throw new Error("Insufficient credit balance to retire");

    state.companyBalance -= quantity;
    const fakeHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    const certNo = `GC-CERT-${Date.now().toString().slice(-6)}`;
    const timestamp = new Date().toISOString();

    const retirement: MockRetirement = {
      id: Date.now(),
      quantity,
      burn_tx_hash: fakeHash,
      burn_tx_url: `https://sepolia.etherscan.io/tx/${fakeHash}`,
      certificate_no: certNo,
      created_at: timestamp,
      certificate: {
        wallet: wallet || DEMO_WALLETS.company,
        amount: quantity,
        txHash: fakeHash,
        txUrl: `https://sepolia.etherscan.io/tx/${fakeHash}`,
        timestamp,
        certificateNo: certNo,
      },
    };

    const tx: MockTransaction = {
      id: Date.now(),
      tx_hash: fakeHash,
      tx_url: `https://sepolia.etherscan.io/tx/${fakeHash}`,
      type: "retire",
      quantity,
      status: "completed",
      created_at: timestamp,
    };

    state.retirements = [retirement, ...state.retirements];
    state.transactions = [tx, ...state.transactions];

    MockStore.saveState(state);
    return retirement;
  }

  public static getAdminSubmissions() {
    const state = MockStore.loadState();
    const pending = state.projects
      .filter((p) => p.status === "pending_review")
      .map((p) => ({
        id: p.id,
        wallet_address: p.developer_wallet,
        trees_count: p.trees_count,
        tree_type: p.tree_type,
        project_name: p.name,
        submitted_at: p.submitted_at,
        status: p.status,
      }));

    return {
      submissions: pending,
      stats: {
        pending: pending.length,
        verifiedToday: state.verifiedTodayCount,
      },
    };
  }

  public static approveSubmission(id: number, credits: number) {
    const state = MockStore.loadState();
    const proj = state.projects.find((p) => p.id === id);
    if (!proj) throw new Error("Submission not found");

    proj.status = "verified";
    proj.assigned_credits = credits;
    proj.reviewed_at = new Date().toISOString();
    state.verifiedTodayCount += 1;

    // Also add to marketplace listing if not already present
    const existingListing = state.listings.find((l) => l.project_id === id);
    if (!existingListing) {
      state.listings.push({
        id: Date.now(),
        title: `${proj.name} Credits`,
        category: "Reforestation",
        location: "Verified Reserve",
        available_quantity: credits,
        price_per_credit: 20,
        seller_wallet_address: proj.developer_wallet,
        project_id: proj.id,
        project_name: proj.name,
        trees_count: proj.trees_count,
        tree_type: proj.tree_type,
        total_credits: credits,
        project_image: proj.files[0]?.url || "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800&q=80",
      });
    }

    MockStore.saveState(state);
    const fakeVerifyHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    const fakeMintHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

    return {
      verifyTxUrl: `https://sepolia.etherscan.io/tx/${fakeVerifyHash}`,
      mintTxUrl: `https://sepolia.etherscan.io/tx/${fakeMintHash}`,
    };
  }

  public static rejectSubmission(id: number, reason?: string) {
    const state = MockStore.loadState();
    const proj = state.projects.find((p) => p.id === id);
    if (!proj) throw new Error("Submission not found");

    proj.status = "rejected";
    proj.rejection_reason = reason || "Rejected by administrator";
    proj.reviewed_at = new Date().toISOString();

    MockStore.saveState(state);
  }

  public static seedAdminSubmissions() {
    const state = MockStore.loadState();
    const sampleProjects: MockProject[] = [
      {
        id: Date.now() + 1,
        project_code: `GC-PRJ-${Date.now().toString().slice(-4)}`,
        name: "Olympic Peninsula Cedar Renewal",
        trees_count: 650,
        tree_type: "spruce",
        assigned_credits: 0,
        status: "pending_review",
        submitted_at: new Date().toISOString(),
        latitude: 47.8021,
        longitude: -123.6044,
        reviewed_at: null,
        rejection_reason: null,
        developer_wallet: "0x51A7C203E78411D5A3F0B9C23D61B9E75B4180A2",
        files: [
          {
            url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
            fileType: "image",
            originalName: "cedar_stand.jpg",
          },
        ],
      },
      {
        id: Date.now() + 2,
        project_code: `GC-PRJ-${(Date.now() + 1).toString().slice(-4)}`,
        name: "Adirondack Sugar Maple Project",
        trees_count: 380,
        tree_type: "maple",
        assigned_credits: 0,
        status: "pending_review",
        submitted_at: new Date(Date.now() - 3600000).toISOString(),
        latitude: 44.1001,
        longitude: -73.9002,
        reviewed_at: null,
        rejection_reason: null,
        developer_wallet: DEMO_WALLETS.project_developer,
        files: [
          {
            url: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=800&q=80",
            fileType: "image",
            originalName: "maple_plot.jpg",
          },
        ],
      },
    ];

    state.projects = [...sampleProjects, ...state.projects];
    MockStore.saveState(state);
  }

  public static getProfile(wallet?: string | null) {
    const state = MockStore.loadState();
    const projects = state.projects;
    const totalProjects = projects.length;
    const totalTrees = projects.reduce((sum, p) => sum + p.trees_count, 0);
    const totalCredits = projects.reduce((sum, p) => sum + p.assigned_credits, 0);
    const totalRetirements = state.retirements.length;

    return {
      totalProjects,
      totalTrees,
      totalCredits,
      totalRetirements,
      balance: state.companyBalance,
    };
  }
}
