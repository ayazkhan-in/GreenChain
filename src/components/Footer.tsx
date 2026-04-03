import { Leaf } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background py-10">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-primary" />
          <span className="font-bold text-foreground">GreenChain</span>
        </div>
        <div className="flex gap-6">
          {["ABOUT", "TERMS", "PRIVACY", "SOCIALS"].map((l) => (
            <a key={l} href="#" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}
