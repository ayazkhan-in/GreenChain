import { Link } from "react-router-dom";
import { useWeb3 } from "@/context/Web3Context";
import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf, Shield, Coins } from "lucide-react";
import heroForest from "@/assets/hero-forest.jpg";

export default function Landing() {
  const { account, connectWallet, isConnecting } = useWeb3();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 to-background" />
        <div className="container relative z-10 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-secondary-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Verified Ecological Assets
          </span>
          <h1 className="mt-6 text-4xl md:text-6xl font-black text-foreground leading-tight">
            Earn Carbon Credits by<br />
            <span className="text-gradient-green">Planting Trees</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            The leading decentralized infrastructure connecting regenerative agriculture with global corporate liquidity.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            {account ? (
              <Button asChild size="lg" className="rounded-full px-8">
                <Link to="/role-select">Get Started</Link>
              </Button>
            ) : (
              <Button size="lg" className="rounded-full px-8" onClick={connectWallet} disabled={isConnecting}>
                {isConnecting ? "Connecting..." : "Get Started"}
              </Button>
            )}
            <Button variant="outline" size="lg" className="rounded-full px-8" onClick={connectWallet}>
              Connect Wallet
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-black text-foreground">
            High-fidelity climate<br />infrastructure.
          </h2>
          <p className="mt-3 max-w-lg text-muted-foreground">
            We replace trust with verification. Our protocol utilizes distributed ledgers to ensure every asset is backed by real-world biological growth.
          </p>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              { icon: <Coins className="h-6 w-6" />, title: "Yield Generation", desc: "Project developers earn direct digital asset yields for verified ecological restoration efforts.", link: "Explore Yields" },
              { icon: <Shield className="h-6 w-6" />, title: "Asset Liquidity", desc: "Permissionless secondary markets provide instant settlement for corporate offsets.", link: "Trade Now" },
              { icon: <Leaf className="h-6 w-6" />, title: "On-Chain Proof", desc: "Immutable verification records eliminate the risk of double-spending offsets.", link: "View Protocol" },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-border bg-card p-6 shadow-card hover:shadow-elevated transition-shadow">
                <div className="inline-flex items-center justify-center rounded-xl bg-secondary p-3 text-primary">{f.icon}</div>
                <h3 className="mt-4 text-lg font-bold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                <a href="#" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                  {f.link} <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Impact */}
      <section className="py-20">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img src={heroForest} alt="Tropical rainforest" className="rounded-2xl shadow-elevated" width={1280} height={864} />
              <div className="absolute bottom-4 left-4 rounded-xl bg-primary px-5 py-3">
                <p className="text-2xl font-black text-primary-foreground">1.2M+</p>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/80">Trees Verified On-Chain</p>
              </div>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-foreground">
                Global impact,<br />pixel-perfect proof.
              </h2>
              <p className="mt-4 text-muted-foreground">
                By merging satellite computer vision with hardware-attested IoT sensors, GreenChain provides the most rigorous verification layer in the decentralized carbon economy.
              </p>
              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-md bg-secondary p-1.5"><Shield className="h-4 w-4 text-primary" /></div>
                  <div>
                    <h4 className="font-bold text-foreground">Biometric Digital Twins</h4>
                    <p className="text-sm text-muted-foreground">Every organism is mapped to a unique non-fungible identifier (NFT).</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-md bg-secondary p-1.5"><Coins className="h-4 w-4 text-primary" /></div>
                  <div>
                    <h4 className="font-bold text-foreground">Real-time Oracle Data</h4>
                    <p className="text-sm text-muted-foreground">Live sensor feeds pipe ecological health metrics directly to the ledger.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container">
          <div className="rounded-3xl bg-primary px-8 py-16 text-center">
            <h2 className="text-3xl md:text-4xl font-black text-primary-foreground">Ready to green your chain?</h2>
            <p className="mx-auto mt-3 max-w-md text-primary-foreground/80">
              Join the world's most transparent carbon ecosystem and start minting verified assets.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Button variant="secondary" size="lg" className="rounded-full px-8" asChild>
                <Link to={account ? "/role-select" : "#"} onClick={!account ? connectWallet : undefined}>Launch Application</Link>
              </Button>
              <Button variant="outline" size="lg" className="rounded-full px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                View Ecosystem
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
