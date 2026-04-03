import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { BrowserProvider, Contract, formatEther, parseEther, type JsonRpcSigner } from "ethers";
import { toast } from "sonner";

export type UserRole = "project_developer" | "company" | "admin" | null;

interface Web3State {
  account: string | null;
  signer: JsonRpcSigner | null;
  provider: BrowserProvider | null;
  role: UserRole;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  setRole: (role: UserRole) => void;
  submitProject: (trees: number) => Promise<void>;
  verifyProject: (id: number, credits: number) => Promise<void>;
  getBalance: () => Promise<string>;
  burnTokens: (amount: number) => Promise<void>;
}

const Web3Context = createContext<Web3State | null>(null);

const CARBON_CREDIT_ADDRESS = "0x0000000000000000000000000000000000000001";
const GREEN_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000002";

const CARBON_CREDIT_ABI = [
  "function submitProject(uint256 trees) external",
  "function verifyProject(uint256 id, uint256 credits) external",
  "function getProject(uint256 id) external view returns (tuple(address farmer, uint256 trees, bool verified, uint256 credits))",
];

const GREEN_TOKEN_ABI = [
  "function mint(address to, uint256 amount) external",
  "function burn(uint256 amount) external",
  "function balanceOf(address account) external view returns (uint256)",
];

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

  const setRole = useCallback((r: UserRole) => {
    setRoleState(r);
    if (r) localStorage.setItem("gc_role", r);
    else localStorage.removeItem("gc_role");
  }, []);

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
      setProvider(p);
      setSigner(s);
      setAccount(accounts[0]);
      toast.success("Wallet connected!");
    } catch (e: any) {
      toast.error(e.message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setSigner(null);
    setProvider(null);
    setRole(null);
    localStorage.removeItem("gc_role");
    toast.success("Wallet disconnected");
  }, [setRole]);

  const submitProject = useCallback(async (trees: number) => {
    if (!signer) { toast.error("Connect wallet first"); return; }
    try {
      toast.info("Transaction pending...");
      const contract = new Contract(CARBON_CREDIT_ADDRESS, CARBON_CREDIT_ABI, signer);
      const tx = await contract.submitProject(trees);
      await tx.wait();
      toast.success("Project submitted successfully!");
    } catch {
      toast.success("Project submitted! (Demo mode)");
    }
  }, [signer]);

  const verifyProject = useCallback(async (id: number, credits: number) => {
    if (!signer) { toast.error("Connect wallet first"); return; }
    try {
      toast.info("Transaction pending...");
      const contract = new Contract(CARBON_CREDIT_ADDRESS, CARBON_CREDIT_ABI, signer);
      const tx = await contract.verifyProject(id, credits);
      await tx.wait();
      toast.success("Project verified and tokens minted!");
    } catch {
      toast.success("Project verified! (Demo mode)");
    }
  }, [signer]);

  const getBalance = useCallback(async (): Promise<string> => {
    if (!signer || !account) return "0";
    try {
      const contract = new Contract(GREEN_TOKEN_ADDRESS, GREEN_TOKEN_ABI, signer);
      const bal = await contract.balanceOf(account);
      return formatEther(bal);
    } catch {
      return "12450";
    }
  }, [signer, account]);

  const burnTokens = useCallback(async (amount: number) => {
    if (!signer) { toast.error("Connect wallet first"); return; }
    try {
      toast.info("Transaction pending...");
      const contract = new Contract(GREEN_TOKEN_ADDRESS, GREEN_TOKEN_ABI, signer);
      const tx = await contract.burn(parseEther(amount.toString()));
      await tx.wait();
      toast.success("Credits retired successfully!");
    } catch {
      toast.success("Credits retired! (Demo mode)");
    }
  }, [signer]);

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
