import { createBrowserRouter } from "react-router-dom";

import LoginPage from "@/features/auth/pages/login-page";
import RegisterPage from "@/features/auth/pages/register-page";
import DashboardPage from "@/features/dashboard/pages/dashboard-page";
import ProtectedRoute from "./protected-route";

export const router = createBrowserRouter([
    {
        path: "/login",
        element: <LoginPage />,
    },

    {
        path: "/register",
        element: <RegisterPage />
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