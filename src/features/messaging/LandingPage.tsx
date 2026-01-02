"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
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
  const [mood, setMood] = useState("👻");
  const MOODS = ["👻", "❤️", "😂", "😡", "😢", "🔥"];
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
        mood: mood,
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

  // Real-time Reactions Listener
  useEffect(() => {
    if (!user) return;
    
    const q = query(
      collection(db, "messages"), 
      where("senderUid", "==", user.uid),
      orderBy("timestamp", "desc"),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "modified") {
          const data = change.doc.data();
          if (data.readStatus === true) {
            toast("👁️ idris just read your message!", {
              style: { background: "#000", color: "#fff", border: "1px solid #00f0ff" }
            });
            playSound("notification");
          }
        }
      });
    });

    return () => unsubscribe();
  }, [user]);

  // Dynamic UI: Calculate intensity based on message length
  const intensity = Math.min(message.length / 200, 1); // 0 to 1

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
      
      {/* Dynamic UI Overlay */}
      <motion.div 
        className="absolute inset-0 pointer-events-none z-0"
        animate={{
          background: `radial-gradient(circle at 50% 50%, rgba(0, 240, 255, ${intensity * 0.2}), transparent 70%)`
        }}
      />

      <ToastContainer position="top-center" theme="dark" />

      {/* Admin Dashboard Shortcut */}
      {user?.email === "murphysec72@gmail.com" && (
        <motion.a
          href="/admin/dashboard"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-6 right-6 z-50 bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-red-500/30 transition-all cursor-pointer"
        >
          <Lock className="w-4 h-4" />
          Admin Dashboard
        </motion.a>
      )}

      <AnimatePresence mode="wait">
        {!user ? (
          <motion.div
            key="auth"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-md z-10"
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
              y: [0, -10, 0],
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
            // Modern "Send" Animation: Slide up, fade out, and slight scale
            exit={{ 
              opacity: 0, 
              y: -100,
              scale: 0.9,
              filter: "blur(10px)",
              transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } 
            }}
            className="w-full max-w-lg perspective-1000 z-10"
          >
            <GlassCard className="w-full" hoverEffect tiltEffect>
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-2 text-white h-[80px] sm:h-auto">
                  <TypewriterText text="Send a secret message to " />
                  <span className="text-gradient">idris</span>
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
                    style={{
                      boxShadow: `0 0 ${intensity * 30}px rgba(0, 240, 255, ${intensity * 0.5})`
                    }}
                    required
                    onFocus={() => playSound("hover")}
                  />
                </div>

                {/* Mood Selector */}
                <div className="flex justify-center gap-4 py-2">
                  {MOODS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMood(m)}
                      className={`text-2xl transition-transform hover:scale-125 ${mood === m ? "scale-125 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" : "opacity-50 hover:opacity-100"}`}
                    >
                      {m}
                    </button>
                  ))}
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
            className="text-center z-10"
          >
            <GlassCard className="flex flex-col items-center justify-center p-12 text-center" tiltEffect>
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-24 h-24 bg-gradient-to-tr from-primary to-secondary rounded-full grid place-items-center mb-8 shadow-[0_0_40px_rgba(0,240,255,0.4)]"
              >
                <CheckCircle className="w-14 h-14 text-white" />
              </motion.div>
              
              <h2 className="text-4xl font-bold text-white mb-10 tracking-tight">تم الإرسال!</h2>
              
              <motion.button
                onClick={() => {
                  setSent(false);
                  playSound("click");
                }}
                initial={{ opacity: 0.8 }}
                animate={{ 
                  opacity: [0.8, 1, 0.8],
                  boxShadow: [
                    "0 0 0px rgba(0,240,255,0)",
                    "0 0 25px rgba(0,240,255,0.4)",
                    "0 0 0px rgba(0,240,255,0)"
                  ],
                  textShadow: [
                    "0 0 0px rgba(0,240,255,0)",
                    "0 0 15px rgba(0,240,255,0.6)",
                    "0 0 0px rgba(0,240,255,0)"
                  ]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="text-primary font-bold text-xl hover:text-white transition-colors py-3 px-8 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-md"
                onMouseEnter={() => playSound("hover")}
              >
                إرسال رسالة أخرى
              </motion.button>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
