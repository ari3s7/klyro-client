import { createBrowserRouter } from "react-router-dom";

import LoginPage from "@/features/auth/pages/login-page";
import RegisterPage from "@/features/auth/pages/register-page";
import DashboardPage from "@/features/dashboard/pages/dashboard-page";
import ProtectedRoute from "./protected-route";
import PublicRoute from "./public-route";
import HomePage from "@/features/home/pages/home-page";

export const router = createBrowserRouter([
    {
  element: <PublicRoute />,
  children: [
    {
       path: "/",
       element: <HomePage />
    },
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