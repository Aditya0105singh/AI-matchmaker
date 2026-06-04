"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Heart, Lock, User, Eye, EyeOff, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const login = useAppStore((s) => s.login);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Read directly from the DOM — bypasses autofill/onChange sync issues
    const formData = new FormData(e.currentTarget);
    const username = (formData.get("username") as string ?? "").trim();
    const password = (formData.get("password") as string ?? "").trim();

    await new Promise((r) => setTimeout(r, 500));

    const ok = login(username, password);
    setLoading(false);

    if (ok) {
      toast.success("Welcome back, Riya!");
      router.push("/dashboard");
    } else {
      setError("Invalid credentials. Try matchmaker / tdc2024");
    }
  }

  function fillDemo() {
    const form = formRef.current;
    if (!form) return;
    const u = form.elements.namedItem("username") as HTMLInputElement;
    const p = form.elements.namedItem("password") as HTMLInputElement;
    if (u) u.value = "matchmaker";
    if (p) p.value = "tdc2024";
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-zinc-950">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-600/5 rounded-full blur-3xl" />
      </div>

      {/* Floating particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-fuchsia-400/30 rounded-full"
          style={{ left: `${(i * 5 + 10) % 90}%`, top: `${(i * 7 + 15) % 85}%` }}
          animate={{ y: [-10, 10, -10], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 3 + (i % 3), repeat: Infinity, delay: i * 0.2 }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-md mx-4"
      >
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-fuchsia-600 to-violet-700 flex items-center justify-center mb-4 shadow-lg shadow-fuchsia-900/40">
              <Heart size={26} className="text-white fill-white" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-100">TDC Matchmaker AI</h1>
            <p className="text-sm text-zinc-500 mt-1">The Date Crew · Internal Platform</p>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-zinc-200">Welcome back</h2>
            <p className="text-sm text-zinc-500">Sign in to your matchmaker dashboard</p>
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Username</label>
              <Input
                name="username"
                type="text"
                placeholder="matchmaker"
                defaultValue=""
                icon={<User size={15} />}
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Password</label>
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  defaultValue=""
                  icon={<Lock size={15} />}
                  autoComplete="current-password"
                  required
                  error={error}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full mt-2" size="lg" loading={loading}>
              {!loading && <Sparkles size={16} />}
              Sign In
            </Button>
          </form>

          {/* Demo credentials — click to fill */}
          <button
            type="button"
            onClick={fillDemo}
            className="mt-6 w-full p-3 bg-zinc-800/50 rounded-xl border border-zinc-700/50 hover:border-zinc-600 transition-colors text-left"
          >
            <p className="text-xs text-zinc-500 font-medium mb-1.5">Demo Credentials <span className="text-fuchsia-500">(click to fill)</span></p>
            <div className="space-y-1">
              <div className="flex gap-2 text-xs">
                <span className="text-zinc-500 w-20">Username:</span>
                <code className="text-fuchsia-400">matchmaker</code>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="text-zinc-500 w-20">Password:</span>
                <code className="text-fuchsia-400">tdc2024</code>
              </div>
            </div>
          </button>
        </div>

        <p className="text-center text-xs text-zinc-600 mt-4">
          © 2024 The Date Crew · Matchmaker Platform
        </p>
      </motion.div>
    </div>
  );
}
