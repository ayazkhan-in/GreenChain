import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Web3Provider } from "@/context/Web3Context";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RoleRoute from "@/components/RoleRoute";
import Landing from "@/pages/Landing";
import ConnectWallet from "@/pages/ConnectWallet";
import DashboardRoute from "@/components/DashboardRoute";
import CompanyDashboard from "@/pages/CompanyDashboard";
import CompanyMarketplace from "@/pages/CompanyMarketplace";
import AdminPanel from "@/pages/AdminPanel";
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
            <Route path="/dashboard" element={<RoleRoute allow={["project_developer", "company"]}><DashboardRoute /></RoleRoute>} />
            <Route path="/marketplace" element={<RoleRoute allow={["company", "project_developer"]}><CompanyMarketplace /></RoleRoute>} />
            <Route path="/company" element={<RoleRoute allow={["company"]}><CompanyDashboard /></RoleRoute>} />
            <Route path="/admin" element={<RoleRoute allow={["admin"]}><AdminPanel /></RoleRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </Web3Provider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
