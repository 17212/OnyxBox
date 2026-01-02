"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInAnonymously, 
  onAuthStateChanged, 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { auth, db } from "@/core/lib/firebase";
import GlassCard from "@/shared/components/GlassCard";
import GradientButton from "@/shared/components/GradientButton";
import AnimatedBackground from "@/shared/components/AnimatedBackground";
import { CheckCircle, AlertCircle, Lock, Mail, User as UserIcon, LogIn } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { playSound } from "@/core/utils/sound";

const TypewriterText = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setDisplayedText(text.substring(0, i + 1));
      i++;
      if (i > text.length) clearInterval(timer);
    }, 50);
    return () => clearInterval(timer);
  }, [text]);

  return <span>{displayedText}</span>;
};

export default function LandingPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const lastSent = localStorage.getItem("lastSent");
    if (lastSent) {
      const timeDiff = Date.now() - parseInt(lastSent);
      if (timeDiff < 60000) {
        setCooldown(true);
        setTimeout(() => setCooldown(false), 60000 - timeDiff);
      }
    }
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      playSound("success");
      toast.success("Logged in successfully!");
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Login failed.");
      playSound("error");
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    try {
      setLoading(true);
      await signInAnonymously(auth);
      playSound("success");
      toast.success("Continued anonymously!");
    } catch (error) {
      console.error("Anonymous login error:", error);
      toast.error("Login failed.");
      playSound("error");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success("Account created!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Logged in!");
      }
      playSound("success");
    } catch (error: any) {
      console.error("Email auth error:", error);
      toast.error(error.message || "Authentication failed.");
      playSound("error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    if (cooldown) {
      playSound("error");
      toast.error("Please wait a moment before sending another message.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "messages"), {
        content: message,
        timestamp: serverTimestamp(),
        readStatus: false,
        senderUid: user.uid,
        isAnonymous: user.isAnonymous,
      });
      
      localStorage.setItem("lastSent", Date.now().toString());
      setCooldown(true);
      setTimeout(() => setCooldown(false), 60000);
      
      setSent(true);
      setMessage("");
      playSound("success");
      toast.success("Message sent securely!");
    } catch (error) {
      console.error("Error sending message:", error);
      playSound("error");
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030305]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBackground />
      <ToastContainer position="top-center" theme="dark" />

      <AnimatePresence mode="wait">
        {!user ? (
          <motion.div
            key="auth"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-md"
          >
            <GlassCard className="w-full p-8" hoverEffect tiltEffect>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Welcome to OnyxBox</h1>
                <p className="text-gray-400">Please identify yourself to continue.</p>
              </div>

              {!showEmailForm ? (
                <div className="space-y-4">
                  <button
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-3 bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-100 transition-all transform hover:scale-[1.02]"
                    onMouseEnter={() => playSound("hover")}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </button>

                  <button
                    onClick={() => setShowEmailForm(true)}
                    className="w-full flex items-center justify-center gap-3 bg-glass-bg border border-glass-border text-white font-bold py-3 rounded-xl hover:bg-white/10 transition-all transform hover:scale-[1.02]"
                    onMouseEnter={() => playSound("hover")}
                  >
                    <Mail className="w-5 h-5" />
                    Continue with Email
                  </button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-[#0a0a0c] text-gray-500">Or stay hidden</span>
                    </div>
                  </div>

                  <button
                    onClick={handleAnonymousLogin}
                    className="w-full flex items-center justify-center gap-3 bg-gray-800 text-gray-300 font-bold py-3 rounded-xl hover:bg-gray-700 transition-all transform hover:scale-[1.02]"
                    onMouseEnter={() => playSound("hover")}
                  >
                    <UserIcon className="w-5 h-5" />
                    Continue Anonymously
                  </button>
                </div>
              ) : (
                <form onSubmit={handleEmailAuth} className="space-y-4">
                  <div>
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-glass-bg border border-glass-border rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-glass-bg border border-glass-border rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                      required
                    />
                  </div>
                  
                  <GradientButton type="submit" className="w-full" isLoading={loading}>
                    {isSignUp ? "Create Account" : "Sign In"}
                  </GradientButton>

                  <div className="flex justify-between text-sm text-gray-400 mt-4">
                    <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="hover:text-white underline">
                      {isSignUp ? "Already have an account?" : "Need an account?"}
                    </button>
                    <button type="button" onClick={() => setShowEmailForm(false)} className="hover:text-white">
                      Back
                    </button>
                  </div>
                </form>
              )}
            </GlassCard>
          </motion.div>
        ) : !sent ? (
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
            className="w-full max-w-lg perspective-1000"
          >
            <GlassCard className="w-full" hoverEffect tiltEffect>
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-2 text-white h-[80px] sm:h-auto">
                  <TypewriterText text="Send a secret message to " />
                  <span className="text-gradient">Idris</span>
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
                    onFocus={() => playSound("hover")}
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
            <GlassCard className="flex flex-col items-center justify-center p-12" tiltEffect>
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
                onClick={() => {
                  setSent(false);
                  playSound("click");
                }}
                className="mt-8 text-primary hover:text-white transition-colors"
                onMouseEnter={() => playSound("hover")}
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
