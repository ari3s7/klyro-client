import { Navigate, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { getMe } from "@/features/auth/api/auth-api";

export default function ProtectedRoute() {
  const { data, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    retry: false,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}