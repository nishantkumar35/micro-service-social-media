import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, User, Loader2, Sparkles, ArrowRight, Eye, EyeOff } from "lucide-react";

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

const RegisterPage = () => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const { register } = useAuth();
  const navigate     = useNavigate();

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await register(formData);
    setLoading(false);
    if (result.success) navigate("/");
    else setError(result.message);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        background:
          "radial-gradient(ellipse 700px 500px at 80% 20%, rgba(167,243,208,0.4) 0%, transparent 70%), radial-gradient(ellipse 500px 400px at 20% 80%, rgba(251,191,36,0.25) 0%, transparent 70%), #f0ebff",
      }}
    >
      <div className="w-full max-w-md animate-fade-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4"
            style={{
              background: "linear-gradient(135deg,#34d399,#059669)",
              boxShadow: "0 7px 0px #047857, 0 12px 24px rgba(5,150,105,0.35)",
            }}
          >
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-purple-900">Create account</h1>
          <p className="text-sm text-purple-500 font-semibold mt-1">
            Join MicroSocial and start sharing
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-8"
          style={{
            background: "#fff",
            boxShadow: "6px 8px 0px #6ee7b7, 0 20px 50px rgba(52,211,153,0.15)",
            border: "2.5px solid #d1fae5",
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
              icon={User}
              label="Username"
              id="register-username"
              type="text"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              placeholder="johndoe"
              autoComplete="username"
            />
            <InputField
              icon={Mail}
              label="Email Address"
              id="register-email"
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
            />
            <InputField
              icon={Lock}
              label="Password"
              id="register-password"
              type="password"
              showToggle
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Min 8 characters"
              autoComplete="new-password"
            />

            <button
              id="register-submit-btn"
              type="submit"
              disabled={loading}
              className="clay-btn w-full py-3.5 text-sm flex items-center justify-center gap-2 mt-2 font-black text-white"
              style={{
                background: "linear-gradient(135deg,#34d399,#059669)",
                boxShadow: "0 5px 0px #047857, 0 8px 16px rgba(5,150,105,0.3)",
                borderRadius: "16px",
                border: "2px solid rgba(0,0,0,0.06)",
              }}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Get Started <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm font-semibold text-purple-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-black text-purple-700 hover:text-purple-900 transition-colors underline underline-offset-2"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
