"use client";

import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/core/lib/firebase";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import GlassCard from "@/shared/components/GlassCard";
import AnimatedBackground from "@/shared/components/AnimatedBackground";
import { Trash2, LogOut, Share2, Check, Eye, EyeOff, Search, Download, Shield, Inbox, User, Clock, Palette, Type, Layout, Sparkles, Heart, MessageCircle, Pin, Star, Filter } from "lucide-react";
import { format } from "date-fns";
import { arEG } from "date-fns/locale";
import html2canvas from "html2canvas";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import StatsWidget from "@/features/admin/StatsWidget";
import { downloadCSV } from "@/core/utils/export";
import { playSound } from "@/core/utils/sound";
import { AR, ADMIN_REACTIONS, timeAgo, isAdmin } from "@/core/constants";
import { Message } from "@/core/types";
import { User as FirebaseUser } from "firebase/auth";
import { DocumentData, QuerySnapshot } from "firebase/firestore";
import AboutModal from "@/shared/components/AboutModal";

type FilterType = "all" | "unread" | "pinned" | "favorites";

export default function DashboardPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [stealthMode, setStealthMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAbout, setShowAbout] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const [storyMessage, setStoryMessage] = useState<Message | null>(null);
  const [isCustomizing, setIsCustomizing] = useState(false);
  
  const [storyConfig, setStoryConfig] = useState({
    bg: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
    cardStyle: "glass" as "glass" | "solid" | "neon" | "minimal",
    accentColor: "#00f0ff",
    fontSize: "text-2xl",
    textAlign: "text-right" as "text-left" | "text-center" | "text-right",
    glowEffect: true,
    showTimestamp: true,
    showSender: true,
    showLink: true,
    linkGlow: true,
    borderRadius: "40px",
    padding: "80px",
    fontFamily: "font-sans",
    moodSize: "text-6xl",
    overlayOpacity: 0.5
  });

  const BACKGROUNDS = [
    { name: "Onyx", value: "linear-gradient(180deg, #030305 0%, #0a0a0c 100%)" },
    { name: "Midnight", value: "linear-gradient(135deg, #0f172a 0%, #020617 100%)" },
    { name: "Deep Sea", value: "linear-gradient(135deg, #083344 0%, #020617 100%)" },
    { name: "Purple Rain", value: "linear-gradient(135deg, #4c1d95 0%, #020617 100%)" },
    { name: "Rose Gold", value: "linear-gradient(135deg, #881337 0%, #020617 100%)" },
    { name: "Forest", value: "linear-gradient(135deg, #064e3b 0%, #020617 100%)" },
    { name: "Cyberpunk", value: "linear-gradient(135deg, #70123e 0%, #0f172a 100%)" },
    { name: "Aurora", value: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)" },
    { name: "Carbon", value: "linear-gradient(135deg, #111111 0%, #000000 100%)" },
  ];

  const ACCENTS = ["#00f0ff", "#ff00e5", "#7000ff", "#00ff88", "#ffbb00", "#ffffff", "#ff4d4d"];
  
  const FONTS = [
    { name: "Sans", value: "font-sans" },
    { name: "Serif", value: "font-serif" },
    { name: "Mono", value: "font-mono" },
  ];

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((u: FirebaseUser | null) => {
      if (!u || !isAdmin(u.email)) {
        if (u) {
          signOut(auth);
          toast.error(AR.errors.permission);
        }
        router.push("/admin/login");
      } else {
        setUser(u);
      }
    });

    const q = query(collection(db, "messages"), orderBy("timestamp", "desc"));
    const unsubscribeSnapshot = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(msgs);
      setFilteredMessages(msgs);
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeSnapshot();
    };
  }, [router]);

  useEffect(() => {
    const filtered = messages.filter((msg) =>
      msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (msg.senderName && msg.senderName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredMessages(filtered);
  }, [searchQuery, messages]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/admin/login");
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذه الرسالة؟")) {
      await deleteDoc(doc(db, "messages", id));
      toast.success("تم الحذف بنجاح");
      playSound("success");
    }
  };

  const toggleReadStatus = async (id: string, currentStatus: boolean) => {
    await updateDoc(doc(db, "messages", id), {
      readStatus: !currentStatus,
    });
    playSound("click");
  };

  // === NEW ADMIN INTERACTION FEATURES ===
  const handleReaction = async (id: string, reaction: string) => {
    await updateDoc(doc(db, "messages", id), {
      adminReaction: reaction,
    });
    playSound("success");
    toast.success(`رديت بـ ${reaction} 🔥`);
    setShowReactionPicker(null);
  };

  const handleReply = async (id: string) => {
    if (!replyText.trim()) return;
    await updateDoc(doc(db, "messages", id), {
      adminReply: replyText,
    });
    playSound("success");
    toast.success(AR.messageCard.replySent);
    setReplyText("");
    setReplyingTo(null);
  };

  const togglePin = async (id: string, currentStatus: boolean) => {
    await updateDoc(doc(db, "messages", id), {
      isPinned: !currentStatus,
    });
    playSound("click");
    toast.success(currentStatus ? "اتشال من المثبت" : "اتثبتت! 📌");
  };

  const toggleFavorite = async (id: string, currentStatus: boolean) => {
    await updateDoc(doc(db, "messages", id), {
      isFavorite: !currentStatus,
    });
    playSound("click");
    toast.success(currentStatus ? "اتشالت من المفضلة" : "اتضافت للمفضلة! ⭐");
  };

  // Apply filters
  const getFilteredMessages = () => {
    let result = filteredMessages;
    switch (activeFilter) {
      case "unread":
        result = result.filter(m => !m.readStatus);
        break;
      case "pinned":
        result = result.filter(m => m.isPinned);
        break;
      case "favorites":
        result = result.filter(m => m.isFavorite);
        break;
    }
    // Sort pinned messages first
    return result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
  };

  const handleShare = (msg: Message) => {
    setStoryMessage(msg);
    setIsCustomizing(true);
    playSound("click");
  };

  const downloadStory = async () => {
    if (storyRef.current) {
      try {
        const canvas = await html2canvas(storyRef.current, {
          backgroundColor: "#030305",
          scale: 2,
          useCORS: true,
          logging: true,
        });
        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = image;
        link.download = `onyxbox-story-${storyMessage?.id}.png`;
        link.click();
        toast.success("تم إنشاء الستوري بنجاح! 📸");
        playSound("success");
        setIsCustomizing(false);
        setStoryMessage(null);
      } catch (error) {
        console.error("Error generating story:", error);
        toast.error("Failed to generate story");
      }
    }
  };

  const handleExport = () => {
    const dataToExport = messages.map(msg => ({
      Content: msg.content,
      Sender: msg.senderName || "Anonymous",
      Date: msg.timestamp ? new Date(msg.timestamp.seconds * 1000).toLocaleString() : "N/A",
      Read: msg.readStatus ? "Yes" : "No",
      Mood: msg.mood || "N/A"
    }));
    downloadCSV(dataToExport, "onyxbox_messages.csv");
    toast.success("تم تصدير البيانات بنجاح");
    playSound("success");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030305]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-12 relative">
      <AnimatedBackground />
      <ToastContainer position="bottom-right" theme="dark" />
      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
      
      {/* Social Card Customizer Modal */}
      <AnimatePresence>
        {isCustomizing && storyMessage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto"
          >
            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              
              {/* Preview Area */}
              <div className="lg:col-span-2 flex items-center justify-center">
                <motion.div 
                  ref={storyRef}
                  className="w-[1080px] h-[1920px] bg-[#030305] flex flex-col items-center justify-center relative overflow-hidden shrink-0"
                  style={{ 
                    background: storyConfig.bg,
                    transform: "scale(0.35)", // Scale down for preview
                    transformOrigin: "center center"
                  }}
                >
                  {/* Decorative Elements */}
                  <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none" 
                    style={{ 
                      backgroundImage: "radial-gradient(circle at 20% 20%, #ffffff 1px, transparent 1px)",
                      backgroundSize: "60px 60px"
                    }} 
                  />
                  
                  <div className="relative w-[800px] z-10 flex flex-col items-center">
                    {/* Main Card */}
                    <div 
                      className="w-full relative overflow-hidden"
                      style={{ 
                        padding: storyConfig.padding,
                        borderRadius: storyConfig.borderRadius,
                        backgroundColor: storyConfig.cardStyle === "solid" ? "#0a0a0c" : "rgba(255, 255, 255, 0.03)",
                        border: storyConfig.cardStyle === "neon" ? `2px solid ${storyConfig.accentColor}` : "1px solid rgba(255, 255, 255, 0.1)",
                        boxShadow: storyConfig.cardStyle === "neon" ? `0 0 40px ${storyConfig.accentColor}44` : "0 20px 50px rgba(0,0,0,0.5)",
                        backdropFilter: storyConfig.cardStyle === "glass" ? "blur(30px)" : "none",
                      }}
                    >
                      {/* Card Header */}
                      <div className="flex flex-col items-center mb-12">
                        <div className="flex items-center gap-4 mb-8">
                          <span className="text-5xl font-black text-white tracking-tighter uppercase">onyx</span>
                          <span className="text-5xl font-black tracking-tighter uppercase" style={{ color: storyConfig.accentColor }}>box</span>
                        </div>
                        
                        <motion.span 
                          className={`${storyConfig.moodSize} block mb-4`}
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        >
                          {storyMessage.mood || "👻"}
                        </motion.span>
                      </div>
   
                      {/* Message Content */}
                      <p 
                        className={`
                          ${storyConfig.fontSize} ${storyConfig.textAlign} font-bold leading-[1.6] ${storyConfig.fontFamily} text-white
                          ${storyConfig.glowEffect ? 'drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]' : ''}
                        `}
                        style={{ 
                          direction: "rtl",
                          fontSize: storyConfig.fontSize === "text-xl" ? "40px" : 
                                    storyConfig.fontSize === "text-2xl" ? "56px" : 
                                    storyConfig.fontSize === "text-3xl" ? "72px" : "88px"
                        }}
                      >
                        "{storyMessage.content}"
                      </p>

                      {/* Card Footer */}
                      <div className="mt-16 flex flex-col items-center gap-8">
                        {storyConfig.showSender && (
                          <div className="flex items-center gap-3 text-white/70">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: storyConfig.accentColor }} />
                            <span className="text-3xl font-bold tracking-tight">{storyMessage.senderName || "Anonymous"}</span>
                          </div>
                        )}

                        {storyConfig.showTimestamp && (
                          <div className="flex items-center gap-3 text-white/40">
                            <span className="text-xl font-mono uppercase tracking-[0.3em]">
                              {storyMessage.timestamp?.seconds
                                ? format(new Date(storyMessage.timestamp.seconds * 1000), "d MMM yyyy • h:mm a", { locale: arEG })
                                : "Just now"}
                            </span>
                          </div>
                        )}

                        {storyConfig.showLink && (
                          <div 
                            className="mt-4 px-8 py-3 rounded-2xl border transition-all"
                            style={{ 
                              backgroundColor: "rgba(255, 255, 255, 0.05)",
                              borderColor: storyConfig.linkGlow ? storyConfig.accentColor : "rgba(255, 255, 255, 0.1)",
                              boxShadow: storyConfig.linkGlow ? `0 0 30px ${storyConfig.accentColor}33` : "none"
                            }}
                          >
                            <span 
                              className="text-2xl font-black tracking-[0.1em] uppercase"
                              style={{ color: storyConfig.linkGlow ? storyConfig.accentColor : "#ffffff" }}
                            >
                              onyx-box.vercel.app
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-20 text-center">
                      <p className="text-2xl font-black tracking-[1em] text-white/20 uppercase">Send me a secret</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Controls Area */}
              <GlassCard className="h-fit space-y-6 overflow-y-auto max-h-[90vh] p-8 border-white/10 custom-scrollbar">
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <div className="flex flex-col">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      {AR.story.title}
                    </h2>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Professional Story Lab</p>
                  </div>
                  <button onClick={() => setIsCustomizing(false)} className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-all">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-8">
                  {/* Style Section */}
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold flex items-center gap-2">
                      <Layout className="w-3 h-3" /> {AR.story.cardStyle}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "glass", label: "شفاف 💎" },
                        { id: "solid", label: "مطفي 🌑" },
                        { id: "neon", label: "نيون ⚡" },
                        { id: "minimal", label: "بسيط ✨" }
                      ].map((style) => (
                        <button
                          key={style.id}
                          onClick={() => setStoryConfig({ ...storyConfig, cardStyle: style.id as any })}
                          className={`py-3 rounded-xl border text-xs font-bold transition-all ${storyConfig.cardStyle === style.id ? "border-primary text-primary bg-primary/10 shadow-[0_0_20px_rgba(0,240,255,0.1)]" : "border-white/5 text-gray-500 hover:bg-white/5"}`}
                        >
                          {style.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Background Section */}
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold flex items-center gap-2">
                      <Palette className="w-3 h-3" /> {AR.story.background}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {BACKGROUNDS.map((bg) => (
                        <button
                          key={bg.name}
                          onClick={() => setStoryConfig({ ...storyConfig, bg: bg.value })}
                          className={`p-3 rounded-xl border text-[10px] font-bold transition-all ${storyConfig.bg === bg.value ? "border-primary text-primary bg-primary/10" : "border-white/5 text-gray-500 hover:bg-white/5"}`}
                        >
                          {bg.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Accent Color Section */}
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">{AR.story.accentColor}</label>
                    <div className="flex flex-wrap gap-3">
                      {ACCENTS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setStoryConfig({ ...storyConfig, accentColor: color })}
                          className={`w-10 h-10 rounded-full border-2 transition-all ${storyConfig.accentColor === color ? "border-white scale-110 shadow-[0_0_20px_rgba(255,255,255,0.3)]" : "border-transparent hover:scale-105"}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Typography & Layout Section */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold flex items-center gap-2">
                        <Type className="w-3 h-3" /> {AR.story.fontSize}
                      </label>
                      <select 
                        value={storyConfig.fontSize}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStoryConfig({ ...storyConfig, fontSize: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-primary"
                      >
                        <option value="text-xl">صغير</option>
                        <option value="text-2xl">متوسط</option>
                        <option value="text-3xl">كبير</option>
                        <option value="text-4xl">كبير جداً</option>
                      </select>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">المحاذاة</label>
                      <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
                        {["text-left", "text-center", "text-right"].map((align) => (
                          <button
                            key={align}
                            onClick={() => setStoryConfig({ ...storyConfig, textAlign: align as any })}
                            className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${storyConfig.textAlign === align ? "bg-primary text-black" : "text-gray-500 hover:text-white"}`}
                          >
                            {align === "text-left" ? "L" : align === "text-center" ? "C" : "R"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Advanced Customization */}
                  <div className="space-y-6 pt-6 border-t border-white/5">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">Border Radius</label>
                        <span className="text-[10px] text-primary font-mono">{storyConfig.borderRadius}</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" step="4"
                        value={parseInt(storyConfig.borderRadius)}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStoryConfig({ ...storyConfig, borderRadius: `${e.target.value}px` })}
                        className="w-full accent-primary h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">Padding</label>
                        <span className="text-[10px] text-primary font-mono">{storyConfig.padding}</span>
                      </div>
                      <input 
                        type="range" min="20" max="120" step="10"
                        value={parseInt(storyConfig.padding)}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStoryConfig({ ...storyConfig, padding: `${e.target.value}px` })}
                        className="w-full accent-primary h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Toggles Section */}
                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                    {[
                      { key: "showSender", label: AR.story.showSender },
                      { key: "showTimestamp", label: AR.story.showTimestamp },
                      { key: "showLink", label: "رابط الموقع 🔗" },
                      { key: "linkGlow", label: "توهج الرابط ✨" },
                      { key: "glowEffect", label: AR.story.glowEffect },
                    ].map((toggle) => (
                      <label key={toggle.key} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-10 h-5 rounded-full relative transition-colors ${(storyConfig as any)[toggle.key] ? 'bg-primary' : 'bg-white/10'}`}>
                          <input 
                            type="checkbox" 
                            checked={(storyConfig as any)[toggle.key]} 
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStoryConfig({ ...storyConfig, [toggle.key]: e.target.checked })} 
                            className="sr-only" 
                          />
                          <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${(storyConfig as any)[toggle.key] ? 'translate-x-5' : ''}`} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 group-hover:text-white transition-colors">{toggle.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={downloadStory}
                  className="w-full py-5 bg-primary text-black font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-primary/90 transition-all flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(0,240,255,0.3)] mt-10 active:scale-95"
                >
                  <Download className="w-5 h-5" />
                  {AR.story.download}
                </button>
              </GlassCard>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex flex-col md:flex-row justify-between items-center mb-8 relative z-10 gap-4">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAbout(true)}
            className="text-3xl font-bold text-white group"
          >
            onyx<span className="text-gradient-blue group-hover:brightness-125 transition-all">box</span>
          </motion.button>
          <span className="text-primary/50 text-sm font-normal ml-2">{AR.dashboard.title}</span>
          {user?.email === "murphysec72@gmail.com" && (
            <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/50 flex items-center gap-1">
              <Shield className="w-3 h-3" /> {AR.dashboard.superAdmin || "Super Admin"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder={AR.dashboard.searchPlaceholder} 
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="bg-glass-bg border border-glass-border rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary w-full md:w-64 transition-all"
            />
          </div>

          <button
            onClick={() => setStealthMode(!stealthMode)}
            className={`p-2 rounded-lg border transition-colors ${stealthMode ? 'bg-primary/20 border-primary text-primary' : 'bg-glass-bg border-glass-border text-gray-400 hover:text-white'}`}
            title={AR.dashboard.stealthMode}
          >
            {stealthMode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>

          <button
            onClick={handleExport}
            className="p-2 rounded-lg bg-glass-bg border border-glass-border text-gray-400 hover:text-white transition-colors"
            title={AR.dashboard.exportButton}
          >
            <Download className="w-5 h-5" />
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors bg-glass-bg px-4 py-2 rounded-lg border border-glass-border"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden md:inline">{AR.dashboard.logoutButton}</span>
          </button>
        </div>
      </header>

      <StatsWidget 
        totalMessages={messages.length} 
        unreadMessages={messages.filter(m => !m.readStatus).length} 
      />

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-8 relative z-10">
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
          {(['all', 'unread', 'pinned', 'favorites'] as FilterType[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${activeFilter === filter ? 'bg-primary text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              {filter === 'all' && "الكل"}
              {filter === 'unread' && "جديد"}
              {filter === 'pinned' && "مثبت 📌"}
              {filter === 'favorites' && "مفضلة ⭐"}
            </button>
          ))}
        </div>
        
        <div className="flex-1" />
        
        <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">
          {getFilteredMessages().length} {AR.dashboard.totalMessages}
        </div>
      </div>

      {filteredMessages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500">
          <Inbox className="w-16 h-16 mb-4 opacity-20" />
          <p className="text-xl">No messages found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getFilteredMessages().map((msg) => (
            <div key={msg.id} id={`message-${msg.id}`} className="relative group">
              <GlassCard 
                className={`h-full flex flex-col justify-between transition-all duration-300 ${msg.readStatus ? 'opacity-70' : 'border-primary/50'} ${msg.isPinned ? 'ring-2 ring-primary/30' : ''}`}
                hoverEffect
              >
                <div className="mb-4 relative">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-primary font-bold text-sm">
                        <User className="w-3 h-3" />
                        {msg.senderName || AR.messageCard.anonymous}
                        {msg.isPinned && <Pin className="w-3 h-3 text-primary fill-primary" />}
                        {msg.isFavorite && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />}
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">
                        {timeAgo(msg.timestamp)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {msg.readStatus && <Check className="w-4 h-4 text-green-500" />}
                      <button 
                        onClick={() => togglePin(msg.id, !!msg.isPinned)}
                        className={`p-1.5 rounded-full transition-colors ${msg.isPinned ? 'text-primary bg-primary/10' : 'text-gray-600 hover:text-white hover:bg-white/5'}`}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => toggleFavorite(msg.id, !!msg.isFavorite)}
                        className={`p-1.5 rounded-full transition-colors ${msg.isFavorite ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-600 hover:text-white hover:bg-white/5'}`}
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Mood Indicator */}
                  {msg.mood && (
                    <div className="absolute top-0 right-12 text-2xl animate-pulse opacity-50">
                      {msg.mood}
                    </div>
                  )}

                  <p className={`text-white text-lg leading-relaxed whitespace-pre-wrap mt-2 ${stealthMode ? 'blur-md hover:blur-none transition-all duration-300' : ''}`} style={{ direction: 'rtl' }}>
                    {msg.content}
                  </p>

                  {/* Admin Reaction Display */}
                  {msg.adminReaction && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="mt-4 flex items-center gap-2"
                    >
                      <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xl">
                        {msg.adminReaction}
                      </div>
                      <span className="text-[10px] text-gray-500 uppercase tracking-tighter">ردّك</span>
                    </motion.div>
                  )}

                  {/* Admin Reply Display */}
                  {msg.adminReply && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20 relative overflow-hidden group/reply"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                      <div className="flex items-center gap-2 mb-2 text-[10px] text-primary font-bold uppercase tracking-widest">
                        <MessageCircle className="w-3 h-3" />
                        ردّك الرسمي
                      </div>
                      <p className="text-sm text-gray-300 italic" style={{ direction: 'rtl' }}>
                        "{msg.adminReply}"
                      </p>
                    </motion.div>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Reply Input Area */}
                  <AnimatePresence>
                    {replyingTo === msg.id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <textarea
                          value={replyText}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReplyText(e.target.value)}
                          placeholder={AR.messageCard.replyPlaceholder}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-primary min-h-[80px] resize-none mb-2"
                          style={{ direction: 'rtl' }}
                        />
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setReplyingTo(null)}
                            className="px-4 py-2 rounded-lg text-xs text-gray-400 hover:text-white transition-colors"
                          >
                            إلغاء
                          </button>
                          <button 
                            onClick={() => handleReply(msg.id)}
                            className="px-4 py-2 rounded-lg text-xs bg-primary text-black font-bold hover:bg-primary/90 transition-all"
                          >
                            {AR.messageCard.sendReply}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Reaction Picker */}
                  <AnimatePresence>
                    {showReactionPicker === msg.id && (
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="flex flex-wrap gap-2 p-2 bg-white/5 rounded-xl border border-white/10"
                      >
                        {ADMIN_REACTIONS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleReaction(msg.id, emoji)}
                            className="text-xl hover:scale-125 transition-transform p-1"
                          >
                            {emoji}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center pt-4 border-t border-white/5">
                    <div className="flex gap-1">
                      <button
                        onClick={() => setShowReactionPicker(showReactionPicker === msg.id ? null : msg.id)}
                        className={`p-2 rounded-full transition-all ${showReactionPicker === msg.id ? 'bg-primary text-black' : 'hover:bg-white/10 text-gray-400 hover:text-primary'}`}
                        title={AR.messageCard.react}
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setReplyingTo(replyingTo === msg.id ? null : msg.id)}
                        className={`p-2 rounded-full transition-all ${replyingTo === msg.id ? 'bg-primary text-black' : 'hover:bg-white/10 text-gray-400 hover:text-primary'}`}
                        title={AR.messageCard.reply}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => toggleReadStatus(msg.id, msg.readStatus)}
                        className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        title={msg.readStatus ? AR.dashboard.markUnread : AR.dashboard.markRead}
                      >
                        {msg.readStatus ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleShare(msg)}
                        className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-blue-400 transition-colors"
                        title={AR.messageCard.shareStory}
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(msg.id)}
                        className="p-2 rounded-full hover:bg-red-500/20 text-gray-400 hover:text-red-500 transition-colors"
                        title={AR.messageCard.delete}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
