import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios.js";
import { useAuth } from "../hooks/useAuth.js";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      if (data?.success && data?.token && data?.user) {
        login(data.token, data.user);
        navigate("/");
      } else {
        setErr(data?.message || "Login failed");
      }
    } catch (e) {
      setErr(e?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0b0b18] via-[#0f0f1a] to-[#16162a] px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md rounded-2xl bg-[#16162a]/80 p-8 shadow-2xl ring-1 ring-white/5 backdrop-blur"
      >
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="mt-1 text-sm text-gray-400">Sign in to continue chatting</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs text-gray-400">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              required
              className="mt-1 w-full rounded-lg bg-inputbar px-3 py-2.5 text-sm text-white outline-none ring-1 ring-white/5 focus:ring-accent"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Password</label>
            <div className="relative mt-1">
              <input
                name="password"
                type={show ? "text" : "password"}
                value={form.password}
                onChange={onChange}
                required
                className="w-full rounded-lg bg-inputbar px-3 py-2.5 pr-16 text-sm text-white outline-none ring-1 ring-white/5 focus:ring-accent"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs text-gray-300 hover:bg-white/10"
              >
                {show ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          {err && <p className="text-sm text-red-400">{err}</p>}
          <button
            disabled={loading}
            className="w-full rounded-lg bg-accent px-3 py-2.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-accenthover disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-400">
          No account?{" "}
          <Link to="/register" className="text-accent hover:underline">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
