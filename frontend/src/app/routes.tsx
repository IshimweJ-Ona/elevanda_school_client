import { createBrowserRouter, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { RequireAuth } from "./components/RequireAuth";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DeviceVerificationPage } from "./pages/DeviceVerificationPage";
import { SessionExpiredPage } from "./pages/SessionExpiredPage";
import { RegistrationPendingPage } from "./pages/RegistrationPendingPage";
import { DashboardRedirectPage } from "./pages/DashboardRedirectPage";
import { ParentDashboardPage } from "./pages/ParentDashboardPage";
import { ProfilePage } from "./pages/ProfilePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/registration-pending",
    element: <RegistrationPendingPage />,
  },
  {
    path: "/device-verification",
    element: <DeviceVerificationPage />,
  },
  {
    path: "/session-expired",
    element: <SessionExpiredPage />,
  },
  {
    path: "/app",
    element: (
      <RequireAuth>
        <Layout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/app/dashboard" replace /> },
      { path: "dashboard", element: <DashboardRedirectPage /> },
      { path: "parent", element: <ParentDashboardPage /> },
      { path: "profile", element: <ProfilePage /> },
    ],
  },
]);
