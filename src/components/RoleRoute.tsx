import { Navigate, useLocation } from "react-router-dom";
import { useWeb3, type UserRole } from "@/context/Web3Context";

interface Props {
  children: React.ReactNode;
  allow: UserRole[];
}

export default function RoleRoute({ children, allow }: Props) {
  const { account, role } = useWeb3();
  const location = useLocation();

  if (!account) {
    return <Navigate to="/connect" replace state={{ from: location.pathname }} />;
  }

  if (!role) {
    return <Navigate to="/connect" replace />;
  }

  if (!allow.includes(role)) {
    const fallback = role === "admin" ? "/admin" : "/dashboard";
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}
