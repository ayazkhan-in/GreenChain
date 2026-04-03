import { Link, useLocation } from "react-router-dom";
import { useWeb3 } from "@/context/Web3Context";
import { Copy, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const roleLabels: Record<string, string> = {
  project_developer: "Project Developer",
  company: "Company",
  admin: "Admin",
};

export default function Navbar() {
  const { account, role, connectWallet, isConnecting } = useWeb3();
  const location = useLocation();

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const navLinks =
    role === "admin"
      ? [{ to: "/admin", label: "Admin" }]
      : role === "company"
        ? [
            { to: "/dashboard", label: "Dashboard" },
            { to: "/marketplace", label: "Marketplace" },
          ]
        : role === "project_developer"
          ? [
              { to: "/dashboard", label: "Dashboard" },
              { to: "/marketplace", label: "Marketplace" },
            ]
          : [];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">GreenChain</span>
          </Link>
          {account && (
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive(l.to) ? "text-foreground underline underline-offset-4" : "text-muted-foreground"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
        <div className="flex items-center gap-3">
          {account ? (
            <>
              {role && (
                <Badge variant="secondary" className="capitalize">
                  {roleLabels[role] || role}
                </Badge>
              )}
              <button
                onClick={() => { navigator.clipboard.writeText(account); toast.success("Address copied!"); }}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-mono text-muted-foreground hover:bg-accent transition-colors"
              >
                <Copy className="h-3.5 w-3.5" />
                {truncate(account)}
              </button>
            </>
          ) : (
            <Button onClick={connectWallet} disabled={isConnecting} className="rounded-full">
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
