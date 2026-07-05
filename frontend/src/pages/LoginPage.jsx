import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, Loader2, Sparkles, ArrowRight, Eye, EyeOff } from "lucide-react";

const InputField = ({ icon: Icon, label, id, showToggle, ...props }) => {
  const [showPwd, setShowPwd] = useState(false);
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-bold text-purple-900 block pl-1">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Icon size={17} className="text-purple-400" />
        </div>
        <input
          id={id}
          {...props}
          type={showToggle ? (showPwd ? "text" : "password") : props.type}
          className="clay-input pr-10"
        />
        {showToggle && (
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-purple-400 hover:text-purple-600 transition-colors"
          >
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
};

const LoginPage = () => {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const { login }  = useAuth();
  const navigate   = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) navigate("/");
    else setError(result.message);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        background:
          "radial-gradient(ellipse 700px 500px at 20% 30%, rgba(196,181,253,0.4) 0%, transparent 70%), radial-gradient(ellipse 500px 400px at 80% 70%, rgba(167,243,208,0.3) 0%, transparent 70%), #f0ebff",
      }}
    >
      <div className="w-full max-w-md animate-fade-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4"
            style={{
              background: "linear-gradient(135deg,#8b5cf6,#ec4899)",
              boxShadow: "0 7px 0px #6d28d9, 0 12px 24px rgba(109,40,217,0.35)",
            }}
          >
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-purple-900">Welcome back!</h1>
          <p className="text-sm text-purple-500 font-semibold mt-1">
            Sign in to your MicroSocial account
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-8"
          style={{
            background: "#fff",
            boxShadow: "6px 8px 0px #d8b4fe, 0 20px 50px rgba(139,92,246,0.15)",
            border: "2.5px solid #ede9fe",
          }}
        >
          {/* Error */}
          {error && (
            <div
              className="mb-5 p-3.5 rounded-2xl text-sm font-bold flex items-start gap-2"
              style={{
                background: "rgba(251,113,133,0.1)",
                border: "2px solid rgba(251,113,133,0.3)",
                color: "#e11d48",
              }}
            >
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <InputField
              icon={Mail}
              label="Email Address"
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
            <InputField
              icon={Lock}
              label="Password"
              id="login-password"
              type="password"
              showToggle
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="clay-btn clay-btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm font-semibold text-purple-500">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="font-black text-purple-700 hover:text-purple-900 transition-colors underline underline-offset-2"
            >
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
