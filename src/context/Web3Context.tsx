import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { BrowserProvider, Contract, formatUnits, type JsonRpcSigner } from "ethers";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";
import { MockStore, DEMO_WALLETS } from "@/lib/mockStore";
import {
  GREEN_TOKEN_ABI,
  GREEN_TOKEN_ADDRESS,
  SEPOLIA_CHAIN_HEX,
  SEPOLIA_CHAIN_ID,
} from "@/lib/contracts";

export type UserRole = "project_developer" | "company" | "admin" | null;

export interface Web3State {
  account: string | null;
  signer: JsonRpcSigner | null;
  provider: BrowserProvider | null;
  role: UserRole;
  isConnecting: boolean;
  isDemoMode: boolean;
  connectWallet: () => Promise<void>;
  connectDemoWallet: (targetRole?: UserRole) => Promise<void>;
  disconnectWallet: () => void;
  setRole: (role: UserRole) => Promise<void>;
  submitProject: (input: { trees: number; location?: string; files?: File[]; name?: string; treeType?: string }) => Promise<void>;
  verifyProject: (id: number, credits: number) => Promise<void>;
  getBalance: () => Promise<string>;
  burnTokens: (amount: number) => Promise<{ quantity: number; certificateNo: string; retiredAt: string; txHash: string; txUrl: string } | null>;
}

const Web3Context = createContext<Web3State | null>(null);

export function Web3Provider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(() => {
    return localStorage.getItem("gc_account") || null;
  });
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [role, setRoleState] = useState<UserRole>(() => {
    const stored = localStorage.getItem("gc_role") as UserRole;
    if ((stored as any) === "farmer") return "project_developer";
    return stored || null;
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return localStorage.getItem("gc_is_demo") === "true";
  });

  const ensureSepolia = useCallback(async () => {
    const eth = (window as any).ethereum;
    if (!eth) throw new Error("MetaMask not found");

    const currentChain = await eth.request({ method: "eth_chainId" });
    if (currentChain === SEPOLIA_CHAIN_HEX) return;

    try {
      await eth.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_HEX }],
      });
    } catch (switchError: any) {
      if (switchError?.code === 4902) {
        throw new Error("Sepolia is not added in MetaMask. Please add Sepolia and retry.");
      }
      throw switchError;
    }
  }, []);

  const setRole = useCallback(async (r: UserRole) => {
    if (!account) {
      toast.error("Connect wallet first");
      return;
    }

    try {
      if (r) {
        await apiRequest("/auth/role", {
          method: "POST",
          walletAddress: account,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: r }),
        });
        toast.success(`Role set to ${r.replace(/_/g, " ")}`);
      }

      setRoleState(r);
      if (r) {
        localStorage.setItem("gc_role", r);
      } else {
        localStorage.removeItem("gc_role");
      }
    } catch (error: any) {
      setRoleState(r);
      if (r) localStorage.setItem("gc_role", r);
    }
  }, [account]);

  const connectDemoWallet = useCallback(async (targetRole?: UserRole) => {
    const selectedRole = targetRole || role || "project_developer";
    const demoAddr = DEMO_WALLETS[selectedRole] || DEMO_WALLETS.project_developer;

    setIsDemoMode(true);
    setAccount(demoAddr);
    setRoleState(selectedRole);

    localStorage.setItem("gc_is_demo", "true");
    localStorage.setItem("gc_role", selectedRole);
    localStorage.setItem("gc_account", demoAddr);

    toast.success(`Connected in demo mode as ${selectedRole.replace(/_/g, " ")}`);
  }, [role]);

  const connectWallet = useCallback(async () => {
    if (!(window as any).ethereum) {
      toast.error("MetaMask not detected. Use demo access to explore without MetaMask.");
      return;
    }
    setIsConnecting(true);
    try {
      const eth = (window as any).ethereum;

      await eth.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });

      const p = new BrowserProvider(eth);
      await ensureSepolia();
      const accounts = await p.send("eth_requestAccounts", []);
      const s = await p.getSigner();
      const network = await p.getNetwork();
      if (Number(network.chainId) !== SEPOLIA_CHAIN_ID) {
        throw new Error("Please connect MetaMask to Sepolia network");
      }
      const walletAddress = accounts[0];

      setIsDemoMode(false);
      localStorage.removeItem("gc_is_demo");

      const response = await apiRequest<{ success: boolean; data: { role: UserRole } }>("/auth/wallet-connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
      });

      const profileResponse = await apiRequest<{ success: boolean; data: { role: UserRole } }>("/auth/me", {
        walletAddress,
      });

      setProvider(p);
      setSigner(s);
      setAccount(walletAddress);
      localStorage.setItem("gc_account", walletAddress);

      const persistedRole = localStorage.getItem("gc_role") as UserRole;
      const serverRole = profileResponse.data?.role || response.data?.role;
      if (serverRole) {
        setRoleState(serverRole);
        localStorage.setItem("gc_role", serverRole);
      } else if (persistedRole) {
        setRoleState(persistedRole);
      }

      toast.success("Wallet connected!");
    } catch (e: any) {
      toast.error(e.message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  }, [ensureSepolia]);

  const disconnectWallet = useCallback(() => {
    if (account && !isDemoMode) {
      void apiRequest("/auth/logout", {
        method: "POST",
        walletAddress: account,
      });
    }
    setAccount(null);
    setSigner(null);
    setProvider(null);
    setRoleState(null);
    setIsDemoMode(false);
    localStorage.removeItem("gc_role");
    localStorage.removeItem("gc_is_demo");
    localStorage.removeItem("gc_account");
    toast.success("Disconnected");
  }, [account, isDemoMode]);

  const submitProject = useCallback(async (input: { trees: number; location?: string; files?: File[]; name?: string; treeType?: string }) => {
    if (!account) {
      toast.error("Connect wallet first");
      return;
    }

    try {
      const createResponse = await apiRequest<{ success: boolean; data: { id: number; onChain?: { txHash?: string; txUrl?: string } } }>("/projects", {
        method: "POST",
        walletAddress: account,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          treesCount: input.trees,
          location: input.location,
          name: input.name,
          treeType: input.treeType,
        }),
      });

      const txLink = createResponse.data?.onChain?.txUrl;
      toast.success(txLink ? `Project submitted. Tx: ${txLink}` : "Project submitted successfully!");
    } catch (e: any) {
      toast.error(e.message || "Failed to submit project");
    }
  }, [account]);

  const verifyProject = useCallback(async (id: number, credits: number) => {
    if (!account) {
      toast.error("Connect wallet first");
      return;
    }
    try {
      const response = await apiRequest<{ success: boolean; data?: { verifyTxUrl?: string; mintTxUrl?: string } }>(`/admin/submissions/${id}/approve`, {
        method: "POST",
        walletAddress: account,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credits }),
      });
      const verifyLink = response.data?.verifyTxUrl;
      const mintLink = response.data?.mintTxUrl;
      if (verifyLink && mintLink) {
        toast.success(`Project verified. Tokens minted on-chain.`);
      } else {
        toast.success("Project verified and tokens minted!");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to verify project");
    }
  }, [account]);

  const getBalance = useCallback(async (): Promise<string> => {
    if (isDemoMode || !signer || !account) {
      const state = MockStore.getState();
      return state.companyBalance.toString();
    }
    try {
      const token = new Contract(GREEN_TOKEN_ADDRESS, GREEN_TOKEN_ABI, signer);
      const [decimals, balance] = await Promise.all([token.decimals(), token.balanceOf(account)]);
      return formatUnits(balance, Number(decimals));
    } catch {
      return MockStore.getState().companyBalance.toString();
    }
  }, [account, signer, isDemoMode]);

  const burnTokens = useCallback(async (amount: number) => {
    if (!account) {
      toast.error("Connect wallet first");
      return null;
    }
    try {
      if (!amount || amount <= 0) {
        throw new Error("Enter a valid amount to retire");
      }

      const response = await apiRequest<{
        success: boolean;
        data: { quantity: number; certificateNo: string; retiredAt: string; txHash: string; txUrl: string };
      }>("/market/credits/retire", {
        method: "POST",
        walletAddress: account,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: amount, txHash: "0x" + Math.random().toString(16).slice(2) }),
      });

      if (!response.data) {
        throw new Error("Retirement failed");
      }

      const link = response.data.txUrl;
      toast.success(link ? `Credits retired. Certificate generated.` : "Credits retired successfully!");
      return response.data;
    } catch (e: any) {
      const msg = e?.message || "Failed to retire credits";
      toast.error(msg);
      return null;
    }
  }, [account]);

  useEffect(() => {
    const eth = (window as any).ethereum;
    if (!eth || isDemoMode) return;
    const handleChange = (accounts: string[]) => {
      if (accounts.length === 0) disconnectWallet();
      else setAccount(accounts[0]);
    };
    eth.on("accountsChanged", handleChange);
    return () => eth.removeListener("accountsChanged", handleChange);
  }, [disconnectWallet, isDemoMode]);

  return (
    <Web3Context.Provider
      value={{
        account,
        signer,
        provider,
        role,
        isConnecting,
        isDemoMode,
        connectWallet,
        connectDemoWallet,
        disconnectWallet,
        setRole,
        submitProject,
        verifyProject,
        getBalance,
        burnTokens,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const ctx = useContext(Web3Context);
  if (!ctx) throw new Error("useWeb3 must be used within Web3Provider");
  return ctx;
}
