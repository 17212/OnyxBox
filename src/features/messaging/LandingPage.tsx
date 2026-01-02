"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/core/lib/firebase";
import GlassCard from "@/shared/components/GlassCard";
import GradientButton from "@/shared/components/GradientButton";
import AnimatedBackground from "@/shared/components/AnimatedBackground";
import { CheckCircle, AlertCircle } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function LandingPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  useEffect(() => {
    // Check local storage for cooldown
    const lastSent = localStorage.getItem("lastSent");
    if (lastSent) {
      const timeDiff = Date.now() - parseInt(lastSent);
      if (timeDiff < 60000) { // 1 minute cooldown
        setCooldown(true);
        setTimeout(() => setCooldown(false), 60000 - timeDiff);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (cooldown) {
      toast.error("Please wait a moment before sending another message.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "messages"), {
        content: message,
        timestamp: serverTimestamp(),
        readStatus: false,
      });
      
      localStorage.setItem("lastSent", Date.now().toString());
      setCooldown(true);
      setTimeout(() => setCooldown(false), 60000);
      
      setSent(true);
      setMessage("");
      toast.success("Message sent securely!");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBackground />
      <ToastContainer position="top-center" theme="dark" />

      <AnimatePresence mode="wait">
        {!sent ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, scale: 0.9, y: 0 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: [0, -15, 0],
            }}
            transition={{
              y: {
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              },
              opacity: { duration: 0.5 },
              scale: { duration: 0.5 }
            }}
            exit={{ opacity: 0, y: -300, scale: 0.9, transition: { duration: 0.6, ease: "backIn" } }}
            className="w-full max-w-lg"
          >
            <GlassCard className="w-full" hoverEffect>
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-2 text-white">
                  Send a secret message to <span className="text-gradient">Idris</span>
                </h1>
                <p className="text-gray-400">Your identity will remain anonymous.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your message here..."
                    className="w-full h-40 bg-glass-bg border border-glass-border rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                    required
                  />
                </div>

                <GradientButton
                  type="submit"
                  className="w-full text-lg"
                  isLoading={loading}
                  disabled={cooldown}
                >
                  {cooldown ? "Please Wait..." : "إرسال الصندوق الأسود 🚀"}
                </GradientButton>
                
                {cooldown && (
                  <p className="text-center text-xs text-gray-500 flex items-center justify-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Slow mode active
                  </p>
                )}
              </form>
            </GlassCard>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <GlassCard className="flex flex-col items-center justify-center p-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                className="w-24 h-24 bg-gradient-to-tr from-primary to-secondary rounded-full flex items-center justify-center mb-6 shadow-lg shadow-primary/30"
              >
                <CheckCircle className="w-12 h-12 text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-2">تم الإرسال!</h2>
              <p className="text-gray-300 text-lg">تم التشفير والإرسال بنجاح</p>
              <button
                onClick={() => setSent(false)}
                className="mt-8 text-primary hover:text-white transition-colors"
              >
                إرسال رسالة أخرى
              </button>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
