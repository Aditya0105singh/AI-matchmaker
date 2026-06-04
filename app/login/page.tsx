"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Heart, Lock, User, Eye, EyeOff } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const login = useAppStore((s) => s.login);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const username = ((fd.get("username") as string) ?? "").trim();
    const password = ((fd.get("password") as string) ?? "").trim();
    await new Promise((r) => setTimeout(r, 400));
    const ok = login(username, password);
    setLoading(false);
    if (ok) {
      toast.success("Welcome back, Riya!");
      router.push("/dashboard");
    } else {
      setError("Invalid credentials");
    }
  }

  function fillDemo() {
    const f = formRef.current;
    if (!f) return;
    (f.elements.namedItem("username") as HTMLInputElement).value = "matchmaker";
    (f.elements.namedItem("password") as HTMLInputElement).value = "tdc2024";
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="h-8 w-8 rounded-lg bg-gray-900 flex items-center justify-center">
            <Heart size={15} className="text-white fill-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-tight">The Date Crew</p>
            <p className="text-[10px] text-gray-400">Matchmaker Platform</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h1 className="text-base font-semibold text-gray-900 mb-1">Sign in</h1>
          <p className="text-sm text-gray-500 mb-5">Access your matchmaking dashboard</p>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Username</label>
              <Input
                name="username"
                type="text"
                placeholder="matchmaker"
                defaultValue=""
                icon={<User size={13} />}
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Input
                  name="password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  defaultValue=""
                  icon={<Lock size={13} />}
                  autoComplete="current-password"
                  required
                  error={error}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full mt-1" loading={loading}>
              Sign in
            </Button>
          </form>

          {/* Demo fill */}
          <button
            type="button"
            onClick={fillDemo}
            className="mt-4 w-full px-3 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-left transition-colors"
          >
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1">
              Demo Credentials — click to fill
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span><span className="text-gray-400">user: </span>matchmaker</span>
              <span><span className="text-gray-400">pass: </span>tdc2024</span>
            </div>
          </button>
        </div>

        <p className="text-center text-[11px] text-gray-400 mt-5">
          © 2024 The Date Crew · Internal Platform
        </p>
      </div>
    </div>
  );
}
