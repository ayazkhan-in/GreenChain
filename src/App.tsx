import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Web3Provider } from "@/context/Web3Context";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Landing from "@/pages/Landing";
import ConnectWallet from "@/pages/ConnectWallet";
import RoleSelect from "@/pages/RoleSelect";
import FarmerDashboard from "@/pages/FarmerDashboard";
import CompanyDashboard from "@/pages/CompanyDashboard";
import AdminPanel from "@/pages/AdminPanel";
import Marketplace from "@/pages/Marketplace";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Web3Provider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/connect" element={<ConnectWallet />} />
            <Route path="/role-select" element={<RoleSelect />} />
            <Route path="/dashboard" element={<FarmerDashboard />} />
            <Route path="/company" element={<CompanyDashboard />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </Web3Provider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
