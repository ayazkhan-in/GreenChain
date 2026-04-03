import { Navigate } from "react-router-dom";
import { useWeb3 } from "@/context/Web3Context";
import FarmerDashboard from "@/pages/FarmerDashboard";
import CompanyDashboard from "@/pages/CompanyDashboard";

export default function DashboardRoute() {
  const { role } = useWeb3();

  if (role === "company") {
    return <CompanyDashboard />;
  }

  if (role === "project_developer") {
    return <FarmerDashboard />;
  }

  return <Navigate to="/connect" replace />;
}
