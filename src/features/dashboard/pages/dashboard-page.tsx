import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { logout } from "@/features/auth/api/auth-api";
import { queryClient } from "@/lib/query-client";

export default function DashboardPage() {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["me"] });

      navigate("/login", {
        replace: true,
      });
    },
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">Dashboard</h1>

      <button
        onClick={() => mutation.mutate()}
        className="rounded-md bg-red-500 px-4 py-2 text-white"
      >
        Logout
      </button>
    </div>
  );
}