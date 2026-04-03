import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import amazonImg from "@/assets/amazon-basin.jpg";
import windImg from "@/assets/wind-farm.jpg";
import solarImg from "@/assets/solar-farm.jpg";
import congoImg from "@/assets/congo-peatlands.jpg";
import { useState } from "react";

const projects = [
  { id: 1, name: "Amazon Basin Reserve", location: "Brazil • Reforestation", available: "2,400 VCC", price: "$18.50", img: amazonImg },
  { id: 2, name: "Northern Wind Farm", location: "Denmark • Wind Energy", available: "1,150 VCC", price: "$14.20", img: windImg },
  { id: 3, name: "Sahara Solar Initiative", location: "Morocco • Solar Power", available: "5,800 VCC", price: "$12.90", img: solarImg },
  { id: 4, name: "Congo Peatlands", location: "Congo • Wetland Protect", available: "950 VCC", price: "$24.00", img: congoImg },
];

export default function Marketplace() {
  const [filter, setFilter] = useState("All Projects");

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-10">
        <h1 className="text-3xl font-black text-foreground mb-2">Credit Marketplace</h1>
        <p className="text-muted-foreground mb-8">Browse and purchase verified carbon credits from global projects.</p>

        <div className="flex gap-2 mb-8">
          {["All Projects", "Reforestation", "Renewable Energy"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${filter === f ? "border-foreground text-foreground" : "border-border text-muted-foreground hover:border-foreground"}`}>
              {f}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {projects.map((p) => (
            <div key={p.id} className="rounded-2xl border border-border bg-card shadow-card overflow-hidden hover:shadow-elevated transition-shadow">
              <div className="relative h-44 overflow-hidden">
                <img src={p.img} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] uppercase tracking-wider">Verified</Badge>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-foreground">{p.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{p.location}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Available</p>
                    <p className="font-bold text-foreground">{p.available}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Price</p>
                    <p className="font-bold text-foreground">{p.price}</p>
                  </div>
                </div>
                <Button className="w-full mt-4 rounded-full">Buy Credits</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
