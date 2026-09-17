import { MockStore, DEMO_WALLETS } from "./mockStore";

export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:5000/api";

type RequestOptions = {
  method?: string;
  body?: BodyInit | null;
  walletAddress?: string | null;
  headers?: Record<string, string>;
};

function isDemoWallet(wallet?: string | null): boolean {
  if (!wallet) return false;
  const lower = wallet.toLowerCase();
  return (
    localStorage.getItem("gc_is_demo") === "true" ||
    lower === DEMO_WALLETS.project_developer.toLowerCase() ||
    lower === DEMO_WALLETS.company.toLowerCase() ||
    lower === DEMO_WALLETS.admin.toLowerCase() ||
    lower.includes("demo")
  );
}

function handleMockFallback<T>(path: string, options: RequestOptions): T {
  const method = (options.method || "GET").toUpperCase();
  const parsedBody =
    typeof options.body === "string" ? (() => { try { return JSON.parse(options.body); } catch { return {}; } })() : {};

  // Auth endpoints
  if (path === "/auth/wallet-connect" || path === "/auth/me") {
    const storedRole = localStorage.getItem("gc_role") || "project_developer";
    return { success: true, data: { role: storedRole } } as T;
  }

  if (path === "/auth/role") {
    if (parsedBody?.role) {
      localStorage.setItem("gc_role", parsedBody.role);
    }
    return { success: true, data: { role: parsedBody?.role } } as T;
  }

  if (path === "/auth/logout") {
    return { success: true } as T;
  }

  // Projects review-status
  const reviewMatch = path.match(/\/projects\/(\d+)\/review-status/);
  if (reviewMatch) {
    const id = Number(reviewMatch[1]);
    const proj = MockStore.getState().projects.find((p) => p.id === id);
    return {
      success: true,
      data: {
        id,
        status: proj?.status || "pending_review",
        assigned_credits: proj?.assigned_credits || 0,
        rejection_reason: proj?.rejection_reason || null,
        reviewed_at: proj?.reviewed_at || null,
        developer_wallet: proj?.developer_wallet || DEMO_WALLETS.project_developer,
        reviews: proj?.status === "verified" ? [
          { decision: "approved", creditsAssigned: proj.assigned_credits, reason: "Satellite telemetry validated", createdAt: proj.reviewed_at || new Date().toISOString() }
        ] : [],
      },
    } as T;
  }

  // Single project detail
  const projectDetailMatch = path.match(/\/projects\/(\d+)$/);
  if (projectDetailMatch) {
    const id = Number(projectDetailMatch[1]);
    const proj = MockStore.getState().projects.find((p) => p.id === id) || MockStore.getState().projects[0];
    return {
      success: true,
      data: proj,
    } as T;
  }

  // Projects list and create
  if (path === "/projects/my" || path === "/projects") {
    if (method === "POST") {
      const created = MockStore.createProject({
        name: parsedBody.name,
        treesCount: parsedBody.treesCount || parsedBody.trees,
        treeType: parsedBody.treeType,
        location: parsedBody.location,
        developerWallet: options.walletAddress || undefined,
      });
      return {
        success: true,
        data: {
          id: created.id,
          onChain: {
            txHash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
            txUrl: "https://sepolia.etherscan.io",
          },
        },
      } as T;
    }

    const { projects, stats } = MockStore.getProjects(options.walletAddress);
    return { success: true, data: { projects, stats } } as T;
  }

  if (path.includes("/media/presign")) {
    return {
      success: true,
      data: {
        timestamp: Math.floor(Date.now() / 1000),
        signature: "demo_sig",
        publicId: "demo_id_" + Date.now(),
        apiKey: "demo_key",
        cloudName: "demo_cloud",
        resourceType: "image",
      },
    } as T;
  }

  if (path.includes("/media/complete")) {
    return { success: true } as T;
  }

  // Public user profile
  if (path.includes("/public") && path.startsWith("/users/")) {
    return {
      success: true,
      data: {
        wallet_address: options.walletAddress || DEMO_WALLETS.project_developer,
        role: "project_developer",
        created_at: "2026-08-01T00:00:00Z",
        total_projects: 3,
        total_trees: 1770,
        total_credits: 17190,
      },
    } as T;
  }

  // User profile
  if (path === "/users/profile") {
    const profile = MockStore.getProfile(options.walletAddress);
    return { success: true, data: profile } as T;
  }

  // Marketplace listings
  if (path === "/market/listings") {
    const listings = MockStore.getListings();
    return { success: true, data: listings } as T;
  }

  if (path === "/market/portfolio/summary") {
    const summary = MockStore.getPortfolio(options.walletAddress).summary;
    return { success: true, data: summary } as T;
  }

  if (path === "/market/portfolio/transactions") {
    const txs = MockStore.getPortfolio(options.walletAddress).transactions;
    return { success: true, data: txs } as T;
  }

  if (path === "/market/credits/retirements") {
    const retirements = MockStore.getPortfolio(options.walletAddress).retirements;
    return { success: true, data: retirements } as T;
  }

  if (path.includes("/market/credits/retirements/") && path.includes("/certificate")) {
    const idMatch = path.match(/retirements\/(\d+)\/certificate/);
    const id = idMatch ? Number(idMatch[1]) : 0;
    const retirements = MockStore.getPortfolio(options.walletAddress).retirements;
    const item = retirements.find((r) => r.id === id) || retirements[0];
    return { success: true, data: item?.certificate || {} } as T;
  }

  if (path === "/market/purchase") {
    const result = MockStore.purchaseListing(
      Number(parsedBody.listingId),
      Number(parsedBody.quantity)
    );
    return { success: true, data: result } as T;
  }

  if (path === "/market/credits/retire") {
    const result = MockStore.retireCredits(
      Number(parsedBody.quantity),
      options.walletAddress
    );
    return {
      success: true,
      data: {
        quantity: result.quantity,
        certificateNo: result.certificate_no,
        retiredAt: result.created_at,
        txHash: result.burn_tx_hash,
        txUrl: result.burn_tx_url,
      },
    } as T;
  }

  // Admin endpoints
  if (path === "/admin/submissions") {
    const { submissions } = MockStore.getAdminSubmissions();
    return { success: true, data: submissions } as T;
  }

  if (path === "/admin/stats") {
    const { stats } = MockStore.getAdminSubmissions();
    return { success: true, data: stats } as T;
  }

  const approveMatch = path.match(/\/admin\/submissions\/(\d+)\/approve/);
  if (approveMatch) {
    const id = Number(approveMatch[1]);
    const credits = Number(parsedBody.credits || 100);
    const txUrls = MockStore.approveSubmission(id, credits);
    return { success: true, data: txUrls } as T;
  }

  const rejectMatch = path.match(/\/admin\/submissions\/(\d+)\/reject/);
  if (rejectMatch) {
    const id = Number(rejectMatch[1]);
    MockStore.rejectSubmission(id, parsedBody.reason);
    return { success: true } as T;
  }

  return { success: true, data: [] } as T;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const isDemo = isDemoWallet(options.walletAddress);

  if (isDemo) {
    return handleMockFallback<T>(path, options);
  }

  const headers: Record<string, string> = {
    ...(options.headers || {}),
  };

  if (options.walletAddress) {
    headers["x-wallet-address"] = options.walletAddress;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method || "GET",
      headers,
      body: options.body,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const payload = await response.json();

    if (!response.ok || payload.success === false) {
      throw new Error(payload.message || "API request failed");
    }

    return payload;
  } catch (error: any) {
    // Graceful fallback to mock store when backend is unreachable or request aborts
    console.warn(`[GreenChain] Network request to ${path} fallback to local mock data.`);
    return handleMockFallback<T>(path, options);
  }
}
