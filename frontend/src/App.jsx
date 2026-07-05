import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { PostProvider } from "./context/PostContext";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SearchPage from "./pages/SearchPage";
import ProfilePage from "./pages/ProfilePage";
import Layout from "./components/layout/Layout";
import { Loader2, Sparkles } from "lucide-react";

/* ── Clay loading screen ─────────────────────────────────────────────── */
const LoadingScreen = () => (
  <div
    className="min-h-screen flex flex-col items-center justify-center gap-5"
    style={{ background: "#f0ebff" }}
  >
    <div
      className="w-20 h-20 rounded-3xl flex items-center justify-center animate-pulse-clay"
      style={{
        background: "linear-gradient(135deg,#8b5cf6,#ec4899)",
        boxShadow: "0 8px 0px #6d28d9, 0 14px 30px rgba(109,40,217,0.3)",
      }}
    >
      <Sparkles size={32} className="text-white" />
    </div>
    <div className="text-center">
      <p className="text-xl font-black text-purple-800 mb-1">MicroSocial</p>
      <div className="flex items-center gap-2 text-sm font-bold text-purple-400">
        <Loader2 size={14} className="animate-spin" />
        Loading…
      </div>
    </div>
  </div>
);

/* ── Protected route ─────────────────────────────────────────────────── */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user)   return <Navigate to="/login" replace />;
  return children;
};

/* ── Route config ────────────────────────────────────────────────────── */
const AppRoutes = () => (
  <Routes>
    <Route path="/login"    element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />

    <Route
      path="/"
      element={
        <ProtectedRoute>
          <Layout><HomePage /></Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/search"
      element={
        <ProtectedRoute>
          <Layout><SearchPage /></Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/profile"
      element={
        <ProtectedRoute>
          <Layout><ProfilePage /></Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/profile/:userId"
      element={
        <ProtectedRoute>
          <Layout><ProfilePage /></Layout>
        </ProtectedRoute>
      }
    />

    {/* Catch-all */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

/* ── Root ────────────────────────────────────────────────────────────── */
const App = () => (
  <Router>
    <AuthProvider>
      <PostProvider>
        <AppRoutes />
      </PostProvider>
    </AuthProvider>
  </Router>
);

export default App;
