import { useNavigate } from "react-router-dom";
import { useWeb3, type UserRole } from "@/context/Web3Context";
import { Sprout, Building2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const roles: { role: UserRole; icon: typeof Sprout; title: string; desc: string }[] = [
  { role: "farmer", icon: Sprout, title: "Farmer 🌾", desc: "Submit reforestation projects, earn carbon credits, and track your ecological impact." },
  { role: "company", icon: Building2, title: "Company 🏢", desc: "Purchase verified carbon credits, offset emissions, and retire credits on-chain." },
  { role: "admin", icon: ShieldCheck, title: "Admin 🛡️", desc: "Review and verify projects, assign credits, and maintain ecosystem integrity." },
];

export default function RoleSelect() {
  const { setRole } = useWeb3();
  const navigate = useNavigate();

  const handleSelect = (role: UserRole) => {
    setRole(role);
    if (role === "farmer") navigate("/dashboard");
    else if (role === "company") navigate("/marketplace");
    else if (role === "admin") navigate("/admin");
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12">
      <div className="w-full max-w-3xl animate-fade-in">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-foreground">Select Your Role</h1>
          <p className="mt-2 text-muted-foreground">Choose how you want to participate in the GreenChain ecosystem</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((r) => (
            <div key={r.role} className="group rounded-2xl border border-border bg-card p-6 shadow-card hover:shadow-elevated hover:border-primary/30 transition-all cursor-pointer" onClick={() => handleSelect(r.role)}>
              <div className="inline-flex items-center justify-center rounded-xl bg-secondary p-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <r.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-foreground">{r.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{r.desc}</p>
              <Button className="mt-5 w-full rounded-full" variant="outline">Continue</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
