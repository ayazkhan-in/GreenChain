import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { BrowserProvider, Contract, formatUnits, parseUnits, type JsonRpcSigner } from "ethers";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";
import {
  GREEN_TOKEN_ABI,
  GREEN_TOKEN_ADDRESS,
  SEPOLIA_CHAIN_HEX,
  SEPOLIA_CHAIN_ID,
  etherscanTxUrl,
} from "@/lib/contracts";

export type UserRole = "project_developer" | "company" | "admin" | null;

interface Web3State {
  account: string | null;
  signer: JsonRpcSigner | null;
  provider: BrowserProvider | null;
  role: UserRole;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  setRole: (role: UserRole) => Promise<void>;
  submitProject: (input: { trees: number; location?: string; files?: File[] }) => Promise<void>;
  verifyProject: (id: number, credits: number) => Promise<void>;
  getBalance: () => Promise<string>;
  burnTokens: (amount: number) => Promise<{ quantity: number; certificateNo: string; retiredAt: string; txHash: string; txUrl: string } | null>;
}

const Web3Context = createContext<Web3State | null>(null);

export function Web3Provider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [role, setRoleState] = useState<UserRole>(() => {
    const stored = localStorage.getItem("gc_role") as UserRole;
    if (stored === "farmer" as any) return "project_developer";
    return stored || null;
  });
  const [isConnecting, setIsConnecting] = useState(false);

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
      if (r) localStorage.setItem("gc_role", r);
      else localStorage.removeItem("gc_role");
    } catch (error: any) {
      toast.error(error.message || "Failed to set role");
      throw error;
    }
  }, [account]);

  const connectWallet = useCallback(async () => {
    if (!(window as any).ethereum) {
      toast.error("MetaMask not detected. Please install MetaMask.");
      return;
    }
    setIsConnecting(true);
    try {
      const eth = (window as any).ethereum;
      
      // Request permissions to show popup even if already connected
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
    if (account) {
      void apiRequest("/auth/logout", {
        method: "POST",
        walletAddress: account,
      });
    }
    setAccount(null);
    setSigner(null);
    setProvider(null);
    setRoleState(null);
    localStorage.removeItem("gc_role");
    toast.success("Wallet disconnected");
  }, [account]);

  const submitProject = useCallback(async (input: { trees: number; location?: string; files?: File[] }) => {
    if (!account) { toast.error("Connect wallet first"); return; }

    try {
      const createResponse = await apiRequest<{ success: boolean; data: { id: number; onChain?: { txHash?: string; txUrl?: string } } }>("/projects", {
        method: "POST",
        walletAddress: account,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ treesCount: input.trees, location: input.location }),
      });

      const projectId = createResponse.data?.id;

      for (const file of input.files || []) {
        const resourceType = file.type === "application/pdf" ? "raw" : "image";
        const presignResponse = await apiRequest<{
          success: boolean;
          data: {
            timestamp: number;
            signature: string;
            publicId: string;
            apiKey: string;
            cloudName: string;
            resourceType: string;
          };
        }>(`/projects/${projectId}/media/presign`, {
          method: "POST",
          walletAddress: account,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName: file.name, resourceType }),
        });

        const uploadUrl = `https://api.cloudinary.com/v1_1/${presignResponse.data.cloudName}/${resourceType}/upload`;
        const uploadForm = new FormData();
        uploadForm.append("file", file);
        uploadForm.append("api_key", presignResponse.data.apiKey);
        uploadForm.append("timestamp", String(presignResponse.data.timestamp));
        uploadForm.append("signature", presignResponse.data.signature);
        uploadForm.append("public_id", presignResponse.data.publicId);

        const uploadResult = await fetch(uploadUrl, {
          method: "POST",
          body: uploadForm,
        });

        if (!uploadResult.ok) {
          throw new Error(`Cloudinary upload failed for ${file.name}`);
        }

        const uploaded = await uploadResult.json();

        await apiRequest(`/projects/${projectId}/media/complete`, {
          method: "POST",
          walletAddress: account,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileUrl: uploaded.secure_url,
            publicId: uploaded.public_id,
            fileType: file.type === "application/pdf" ? "pdf" : "image",
            originalName: file.name,
          }),
        });
      }

      const txLink = createResponse.data?.onChain?.txUrl;
      toast.success(txLink ? `Project submitted. Tx: ${txLink}` : "Project submitted successfully!");
    } catch (e: any) {
      toast.error(e.message || "Failed to submit project");
    }
  }, [account]);

  const verifyProject = useCallback(async (id: number, credits: number) => {
    if (!account) { toast.error("Connect wallet first"); return; }
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
        toast.success(`Project verified. Verify Tx: ${verifyLink} | Mint Tx: ${mintLink}`);
      } else if (verifyLink) {
        toast.success(`Project verified. Verify Tx: ${verifyLink}`);
      } else {
        toast.success("Project verified and tokens minted!");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to verify project");
    }
  }, [account]);

  const getBalance = useCallback(async (): Promise<string> => {
    if (!account || !signer) return "0";
    try {
      const token = new Contract(GREEN_TOKEN_ADDRESS, GREEN_TOKEN_ABI, signer);
      const [decimals, balance] = await Promise.all([token.decimals(), token.balanceOf(account)]);
      return formatUnits(balance, Number(decimals));
    } catch {
      return "0";
    }
  }, [account, signer]);

  const burnTokens = useCallback(async (amount: number) => {
    if (!account) { toast.error("Connect wallet first"); return; }
    try {
      if (!amount || amount <= 0) {
        throw new Error("Enter a valid amount to retire");
      }

      // Call backend to check balance and retire credits
      // The backend will verify the user has sufficient balance in the database
      const response = await apiRequest<{ success: boolean; data: { quantity: number; certificateNo: string; retiredAt: string; txHash: string; txUrl: string } }>("/market/credits/retire", {
        method: "POST",
        walletAddress: account,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: amount, txHash: "0x" + Math.random().toString(16).slice(2) }),
      });

      if (!response.data) {
        throw new Error("Retirement failed");
      }

      const link = response.data.txUrl;
      toast.success(link ? `Credits retired. Tx: ${link}` : "Credits retired successfully!");
      return response.data;
    } catch (e: any) {
      const msg = e?.message || "Failed to retire credits";
      toast.error(msg);
      return null;
    }
  }, [account]);

  useEffect(() => {
    const eth = (window as any).ethereum;
    if (!eth) return;
    const handleChange = (accounts: string[]) => {
      if (accounts.length === 0) disconnectWallet();
      else setAccount(accounts[0]);
    };
    eth.on("accountsChanged", handleChange);
    return () => eth.removeListener("accountsChanged", handleChange);
  }, [disconnectWallet]);

  return (
    <Web3Context.Provider value={{ account, signer, provider, role, isConnecting, connectWallet, disconnectWallet, setRole, submitProject, verifyProject, getBalance, burnTokens }}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const ctx = useContext(Web3Context);
  if (!ctx) throw new Error("useWeb3 must be used within Web3Provider");
  return ctx;
}
