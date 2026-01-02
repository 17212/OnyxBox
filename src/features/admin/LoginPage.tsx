"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/core/lib/firebase";
import { useRouter } from "next/navigation";
import GlassCard from "@/shared/components/GlassCard";
import GradientButton from "@/shared/components/GradientButton";
import AnimatedBackground from "@/shared/components/AnimatedBackground";
import { Lock } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Optional: Whitelist check (Uncomment and add your email if you want strict access)
    // const ALLOWED_ADMINS = ["idris.ghamid@gmail.com", "admin@onyxbox.com"];
    // if (!ALLOWED_ADMINS.includes(email)) {
    //   setError("Access Denied: You are not an admin.");
    //   setLoading(false);
    //   return;
    // }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin/dashboard");
    } catch (err: any) {
      setError("Invalid credentials or access denied.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBackground />
      
      <GlassCard className="w-full max-w-md p-8">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-glass-bg rounded-full flex items-center justify-center border border-glass-border">
            <Lock className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-white mb-8">Admin Access</h2>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 text-center text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-glass-bg border border-glass-border rounded-xl p-3 text-white focus:outline-none focus:border-primary transition-all"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-glass-bg border border-glass-border rounded-xl p-3 text-white focus:outline-none focus:border-primary transition-all"
              required
            />
          </div>

          <GradientButton type="submit" className="w-full" isLoading={loading}>
            Login
          </GradientButton>
        </form>
      </GlassCard>
    </div>
  );
}
