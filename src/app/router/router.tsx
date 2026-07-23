import { createBrowserRouter } from "react-router-dom";

import LoginPage from "@/features/auth/pages/login-page";
import RegisterPage from "@/features/auth/pages/register-page";
import DashboardPage from "@/features/dashboard/pages/dashboard-page";
import ProtectedRoute from "./protected-route";
import PublicRoute from "./public-route";

export const router = createBrowserRouter([
    {
  element: <PublicRoute />,
  children: [
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      path: "/register",
      element: <RegisterPage />,
    },
  ],
},
    {
        element: <ProtectedRoute />,
        children: [
    {
        path: "/dashboard",
        element: <DashboardPage />,
    },
  ],
}
])