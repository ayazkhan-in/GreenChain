import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useWeb3, type UserRole } from "@/context/Web3Context";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Leaf,
  Sprout,
  Building2,
  ShieldCheck,
  Wallet,
  ArrowRight,
  CheckCircle,
  Zap,
  Layers,
} from "lucide-react";
import { containerVariants, itemVariants, staggerContainer, staggerItem } from "@/lib/animations";

const roles: { role: UserRole; icon: typeof Sprout; title: string; desc: string }[] = [
  {
    role: "project_developer",
    icon: Sprout,
    title: "Project Developer",
    desc: "Submit reforestation projects, earn verified carbon credits, and track ecological growth.",
  },
  {
    role: "company",
    icon: Building2,
    title: "Company",
    desc: "Purchase verified carbon credits, offset corporate emissions, and retire credits with on-chain certificates.",
  },
  {
    role: "admin",
    icon: ShieldCheck,
    title: "Admin",
    desc: "Review ecological submissions, verify field telemetry, and mint credits to project developers.",
  },
];

export default function ConnectWallet() {
  const { account, connectWallet, connectDemoWallet, isConnecting, setRole } = useWeb3();
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState<"connect" | "role">(account ? "role" : "connect");
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);

  useEffect(() => {
    if (account && step === "connect") setStep("role");
  }, [account, step]);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleContinue = async () => {
    if (!selectedRole) return;
    try {
      await setRole(selectedRole);
      const destination = (location.state as any)?.from;
      if (destination && destination !== "/connect") {
        navigate(destination);
        return;
      }
      if (selectedRole === "project_developer") navigate("/dashboard");
      else if (selectedRole === "company") navigate("/marketplace");
      else if (selectedRole === "admin") navigate("/admin");
    } catch (error) {
      // Error is handled in setRole
    }
  };

  const handleQuickDemo = async (targetRole: UserRole) => {
    await connectDemoWallet(targetRole);
    if (targetRole === "project_developer") navigate("/dashboard");
    else if (targetRole === "company") navigate("/marketplace");
    else if (targetRole === "admin") navigate("/admin");
  };

  const handleBypassToRoleStep = async () => {
    await connectDemoWallet("project_developer");
    setStep("role");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <motion.div
        className="w-full max-w-4xl"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <motion.div className="text-center mb-8" variants={itemVariants}>
          <motion.div
            className="inline-flex items-center gap-2 mb-3"
            whileHover={{ scale: 1.05 }}
          >
            <Leaf className="h-8 w-8 text-primary" />
            <span className="text-2xl font-black text-foreground">GreenChain</span>
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-black text-foreground">
            {step === "connect" ? "Connect Your Wallet" : "Choose Your Role"}
          </h1>
          <p className="mt-2 text-muted-foreground max-w-md mx-auto">
            {step === "connect"
              ? "Link your MetaMask wallet or use demo access to explore the platform"
              : "Select how you want to participate in the GreenChain ecosystem"}
          </p>
        </motion.div>

        {/* Steps indicator */}
        <motion.div className="flex items-center justify-center gap-3 mb-8" variants={itemVariants}>
          <div
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              step === "connect" ? "bg-primary text-primary-foreground" : "bg-secondary text-primary"
            }`}
          >
            {account ? <CheckCircle className="h-4 w-4" /> : <Wallet className="h-4 w-4" />}
            <span>Connect Wallet</span>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <div
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              step === "role" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            <span>Select Role</span>
          </div>
        </motion.div>

        {/* Connect Step */}
        <AnimatePresence mode="wait">
          {step === "connect" && (
            <motion.div
              key="connect-step"
              className="space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Primary Wallet Box */}
              <div className="flex justify-center">
                <motion.div
                  className="rounded-2xl border border-border bg-card p-8 shadow-card text-center max-w-md w-full"
                  whileHover={{ scale: 1.01 }}
                >
                  <motion.div
                    className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    <Wallet className="h-8 w-8 text-primary" />
                  </motion.div>
                  <h2 className="text-xl font-bold text-foreground mb-1">Web3 Wallet Connection</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Connect your MetaMask wallet on Sepolia testnet to sign on-chain transactions.
                  </p>
                  <div className="space-y-3">
                    <Button
                      onClick={connectWallet}
                      disabled={isConnecting}
                      size="lg"
                      className="w-full rounded-full h-11 text-base font-semibold"
                    >
                      {isConnecting ? "Connecting..." : "Connect MetaMask"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleBypassToRoleStep}
                      size="lg"
                      className="w-full rounded-full h-11 text-sm font-medium border-border hover:bg-secondary"
                    >
                      <Zap className="h-4 w-4 mr-2 text-primary" />
                      Bypass with Demo Wallet
                    </Button>
                  </div>
                  <p className="mt-4 text-xs text-muted-foreground">
                    Don't have MetaMask? You can use the instant demo personas below.
                  </p>
                </motion.div>
              </div>

              {/* Instant Demo Personas Section */}
              <div className="rounded-2xl border border-border bg-card/60 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <Layers className="h-4 w-4" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">
                    Instant Demo Access
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Skip wallet setup and explore specific platform roles immediately with pre-loaded mock data:
                </p>

                <div className="grid md:grid-cols-3 gap-4">
                  <motion.button
                    type="button"
                    onClick={() => handleQuickDemo("project_developer")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="text-left rounded-xl border border-border bg-card p-5 hover:border-primary/50 hover:bg-secondary/20 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 group-hover:bg-emerald-100 transition-colors">
                        <Sprout className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-sm">Project Developer</h4>
                        <span className="text-xs text-muted-foreground">Submit & track reforestation</span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-primary">
                      <span>Launch Developer Dashboard</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={() => handleQuickDemo("company")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="text-left rounded-xl border border-border bg-card p-5 hover:border-primary/50 hover:bg-secondary/20 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-teal-50 text-teal-600 border border-teal-100 group-hover:bg-teal-100 transition-colors">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-sm">Corporate Buyer</h4>
                        <span className="text-xs text-muted-foreground">Marketplace & offset retirements</span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-primary">
                      <span>Launch Marketplace & Portfolio</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={() => handleQuickDemo("admin")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="text-left rounded-xl border border-border bg-card p-5 hover:border-primary/50 hover:bg-secondary/20 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 group-hover:bg-blue-100 transition-colors">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-sm">System Admin</h4>
                        <span className="text-xs text-muted-foreground">Verify submissions & mint tokens</span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-primary">
                      <span>Launch Admin Verification</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Role Selection Step */}
          {step === "role" && (
            <motion.div
              key="role-step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="grid md:grid-cols-3 gap-6 mb-8"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {roles.map((r) => (
                  <motion.button
                    key={r.role}
                    type="button"
                    onClick={() => handleRoleSelect(r.role)}
                    variants={staggerItem}
                    className={`group text-left rounded-2xl border-2 bg-card p-6 shadow-card hover:shadow-elevated transition-all ${
                      selectedRole === r.role
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-primary/30"
                    }`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div
                      className={`inline-flex items-center justify-center rounded-xl p-3 transition-colors ${
                        selectedRole === r.role
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                      }`}
                    >
                      <r.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-foreground">
                      {r.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">{r.desc}</p>
                    <AnimatePresence>
                      {selectedRole === r.role && (
                        <motion.div
                          className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-primary"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Selected
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                ))}
              </motion.div>

              <motion.div
                className="flex flex-col sm:flex-row items-center justify-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Button
                  onClick={() => void handleContinue()}
                  disabled={!selectedRole}
                  size="lg"
                  className="rounded-full px-10 h-11 text-base gap-2"
                >
                  Continue as {selectedRole ? roles.find((r) => r.role === selectedRole)?.title : "Selected Role"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setStep("connect")}
                  size="lg"
                  className="rounded-full h-11 text-sm text-muted-foreground"
                >
                  Back to Connection
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
