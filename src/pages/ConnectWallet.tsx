import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useWeb3, type UserRole } from "@/context/Web3Context";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Leaf, Sprout, Building2, ShieldCheck, Wallet, ArrowRight, CheckCircle } from "lucide-react";
import { containerVariants, itemVariants, staggerContainer, staggerItem } from "@/lib/animations";

const roles: { role: UserRole; icon: typeof Sprout; title: string; emoji: string; desc: string }[] = [
  { role: "project_developer", icon: Sprout, emoji: "🌾", title: "Project Developer", desc: "Submit reforestation projects, earn carbon credits, and track your ecological impact." },
  { role: "company", icon: Building2, emoji: "🏢", title: "Company", desc: "Purchase verified carbon credits, offset emissions, and retire credits on-chain." },
  { role: "admin", icon: ShieldCheck, emoji: "🛡️", title: "Admin", desc: "Review and verify projects, assign credits, and maintain ecosystem integrity." },
];

export default function ConnectWallet() {
  const { account, connectWallet, isConnecting, setRole } = useWeb3();
  const navigate = useNavigate();
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
      if (selectedRole === "project_developer") navigate("/dashboard");
      else if (selectedRole === "company") navigate("/marketplace");
      else if (selectedRole === "admin") navigate("/admin");
    } catch (error) {
      // Error is already handled by setRole toast
    }
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
        <motion.div className="text-center mb-10" variants={itemVariants}>
          <motion.div 
            className="inline-flex items-center gap-2 mb-4"
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
              ? "Link your MetaMask wallet to access the GreenChain ecosystem"
              : "Select how you want to participate in the GreenChain ecosystem"}
          </p>
        </motion.div>

        {/* Steps indicator */}
        <motion.div className="flex items-center justify-center gap-3 mb-10" variants={itemVariants}>
          <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${step === "connect" ? "bg-primary text-primary-foreground" : "bg-secondary text-primary"}`}>
            {account ? <CheckCircle className="h-4 w-4" /> : <Wallet className="h-4 w-4" />}
            <span>Connect Wallet</span>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${step === "role" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            <span>Select Role</span>
          </div>
        </motion.div>

        {/* Connect Step */}
        <AnimatePresence mode="wait">
          {step === "connect" && (
            <motion.div 
              key="connect-step"
              className="flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="rounded-2xl border border-border bg-card p-10 shadow-card text-center max-w-md w-full"
                whileHover={{ scale: 1.02 }}
              >
                <motion.div 
                  className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <Wallet className="h-10 w-10 text-primary" />
                </motion.div>
                <h2 className="text-xl font-bold text-foreground mb-2">MetaMask Wallet</h2>
                <p className="text-sm text-muted-foreground mb-8">
                  Connect your MetaMask wallet to get started with GreenChain's decentralized carbon credit platform.
                </p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button onClick={connectWallet} disabled={isConnecting} size="lg" className="w-full rounded-full h-12 text-base">
                    {isConnecting ? "Connecting..." : "Connect MetaMask"}
                  </Button>
                </motion.div>
                <p className="mt-4 text-xs text-muted-foreground">
                  Don't have MetaMask?{" "}
                  <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">
                    Install here
                  </a>
                </p>
              </motion.div>
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
                    onClick={() => handleRoleSelect(r.role)}
                    variants={staggerItem}
                    className={`group text-left rounded-2xl border-2 bg-card p-6 shadow-card hover:shadow-elevated transition-all ${
                      selectedRole === r.role
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-primary/30"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className={`inline-flex items-center justify-center rounded-xl p-3 transition-colors ${
                      selectedRole === r.role
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                    }`}>
                      <r.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-foreground">
                      {r.title} {r.emoji}
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
                className="flex justify-center" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 0.4 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => void handleContinue()}
                    disabled={!selectedRole}
                    size="lg"
                    className="rounded-full px-12 h-12 text-base gap-2"
                  >
                    Continue as {selectedRole ? roles.find(r => r.role === selectedRole)?.title : "..."}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
