import { useNavigate } from "react-router-dom";
import { useWeb3 } from "@/context/Web3Context";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ConnectWallet() {
  const { account, connectWallet, isConnecting } = useWeb3();
  const navigate = useNavigate();

  useEffect(() => {
    if (account) navigate("/role-select");
  }, [account, navigate]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
          <svg className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        </div>
        <h1 className="text-3xl font-black text-foreground">Connect Your Wallet</h1>
        <p className="mt-2 text-muted-foreground">Link your MetaMask wallet to access the GreenChain ecosystem</p>
        <Button onClick={connectWallet} disabled={isConnecting} size="lg" className="mt-8 rounded-full px-10">
          {isConnecting ? "Connecting..." : "Connect MetaMask"}
        </Button>
      </div>
    </div>
  );
}
