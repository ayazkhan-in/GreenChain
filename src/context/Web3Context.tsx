import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { BrowserProvider, type JsonRpcSigner } from "ethers";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";

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
  burnTokens: (amount: number) => Promise<{ quantity: number; certificateNo: string; retiredAt: string } | null>;
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

  const setRole = useCallback(async (r: UserRole) => {
    if (!account) {
      toast.error("Connect wallet first");
      return;
    }

    if (r) {
      await apiRequest("/auth/role", {
        method: "POST",
        walletAddress: account,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: r }),
      });
    }

    setRoleState(r);
    if (r) localStorage.setItem("gc_role", r);
    else localStorage.removeItem("gc_role");
  }, [account]);

  const connectWallet = useCallback(async () => {
    if (!(window as any).ethereum) {
      toast.error("MetaMask not detected. Please install MetaMask.");
      return;
    }
    setIsConnecting(true);
    try {
      const p = new BrowserProvider((window as any).ethereum);
      const accounts = await p.send("eth_requestAccounts", []);
      const s = await p.getSigner();
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
  }, []);

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
      const createResponse = await apiRequest<{ success: boolean; data: { id: number } }>("/projects", {
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

      toast.success("Project submitted successfully!");
    } catch (e: any) {
      toast.error(e.message || "Failed to submit project");
    }
  }, [account]);

  const verifyProject = useCallback(async (id: number, credits: number) => {
    if (!account) { toast.error("Connect wallet first"); return; }
    try {
      await apiRequest(`/admin/submissions/${id}/approve`, {
        method: "POST",
        walletAddress: account,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credits }),
      });
      toast.success("Project verified and tokens minted!");
    } catch (e: any) {
      toast.error(e.message || "Failed to verify project");
    }
  }, [account]);

  const getBalance = useCallback(async (): Promise<string> => {
    if (!account) return "0";
    try {
      const response = await apiRequest<{ success: boolean; data: { balance: number } }>("/market/portfolio/summary", {
        walletAddress: account,
      });
      return String(response.data.balance || 0);
    } catch {
      return "0";
    }
  }, [account]);

  const burnTokens = useCallback(async (amount: number) => {
    if (!account) { toast.error("Connect wallet first"); return; }
    try {
      const response = await apiRequest<{ success: boolean; data: { quantity: number; certificateNo: string; retiredAt: string } }>("/market/credits/retire", {
        method: "POST",
        walletAddress: account,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: amount }),
      });
      toast.success("Credits retired successfully!");
      return response.data;
    } catch (e: any) {
      toast.error(e.message || "Failed to retire credits");
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
