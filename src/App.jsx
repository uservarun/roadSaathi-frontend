import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import PlanRoute from "./pages/PlanRoute";
import Dashboard from "./pages/Dashboard";
import ReportIssue from "./pages/ReportIssue";
import LiveTrip from "./pages/LiveTrip";
import Commutes from "./pages/Commutes";
import GovernmentDashboard from "./pages/GovernmentDashboard";
import { useAuth } from "./context/AuthContext";
import Rewards from "./pages/Rewards"
import Home from "./pages/Home"

export default function App() {
  const { isAuthenticated, user } = useAuth();

  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Routing and issues endpoints are public on the backend,
            but we still gate the app shell behind login for a coherent UX. */}
        <Route
          path="/plan"
          element={
            <ProtectedRoute>
              <PlanRoute />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hazards"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report"
          element={
            <ProtectedRoute>
              <ReportIssue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trip"
          element={
            <ProtectedRoute>
              <LiveTrip />
            </ProtectedRoute>
          }
        />
        <Route
          path="/commutes"
          element={
            <ProtectedRoute>
              <Commutes />
            </ProtectedRoute>
          }
        />
        {/*
          Government dashboard: the spec returns 401 without auth but doesn't
          define a role field beyond the default "USER", so this is only
          gated behind login for now. Tighten to a role check (e.g.
          user.role === "GOVERNMENT") once the backend adds one.
        */}
                <Route
          path="/rewards"
          element={
            <ProtectedRoute>
              <Rewards />
            </ProtectedRoute>
          }
        />
      
        <Route
          path="/government"
          element={
            <ProtectedRoute>
              {user?.role === "ADMIN" ? (
                <GovernmentDashboard />
              ) : (
                <Navigate to="/plan" replace />
              )}
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Home />} />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/plan" : "/login"} replace />} />
      </Routes>
    </>
  );
}
