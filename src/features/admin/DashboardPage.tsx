"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/core/lib/firebase";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import GlassCard from "@/shared/components/GlassCard";
import AnimatedBackground from "@/shared/components/AnimatedBackground";
import { Trash2, LogOut, Share2, Check, Eye, EyeOff, Search, Download, Shield, Inbox, User, Clock, Palette, Type, Layout, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { arEG } from "date-fns/locale";
import html2canvas from "html2canvas";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import StatsWidget from "@/features/admin/StatsWidget";
import { downloadCSV } from "@/core/utils/export";
import { playSound } from "@/core/utils/sound";
import AboutModal from "@/shared/components/AboutModal";

interface Message {
  id: string;
  content: string;
  senderName?: string;
  timestamp: any;
  readStatus: boolean;
  mood?: string;
}

export default function DashboardPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [stealthMode, setStealthMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAbout, setShowAbout] = useState(false);
  const router = useRouter();
  const storyRef = useRef<HTMLDivElement>(null);
  const [storyMessage, setStoryMessage] = useState<Message | null>(null);
  const [isCustomizing, setIsCustomizing] = useState(false);
  
  const [storyConfig, setStoryConfig] = useState({
    bg: "linear-gradient(to bottom, transparent, rgba(3, 3, 5, 0.5), #030305)",
    font: "font-sans",
    showBadge: true,
    showTimestamp: true,
    showSender: true,
    accentColor: "#00f0ff",
    fontSize: "text-2xl",
    textAlign: "text-center" as "text-left" | "text-center" | "text-right",
    borderRadius: "rounded-3xl",
    cardStyle: "glass" as "glass" | "solid" | "neon",
    moodSize: "text-6xl",
    glowEffect: true
  });

  const BACKGROUNDS = [
    { name: "Onyx", value: "linear-gradient(to bottom, transparent, rgba(3, 3, 5, 0.5), #030305)" },
    { name: "Sunset", value: "linear-gradient(to bottom right, rgba(249, 115, 22, 0.2), rgba(168, 85, 247, 0.2), #030305)" },
    { name: "Ocean", value: "linear-gradient(to bottom right, rgba(59, 130, 246, 0.2), rgba(6, 182, 212, 0.2), #030305)" },
    { name: "Neon", value: "linear-gradient(to bottom right, rgba(236, 72, 153, 0.2), rgba(168, 85, 247, 0.2), #030305)" },
    { name: "Emerald", value: "linear-gradient(to bottom right, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.1), #030305)" },
    { name: "Royal", value: "linear-gradient(to bottom right, rgba(109, 40, 217, 0.2), rgba(124, 58, 237, 0.1), #030305)" },
  ];

  const ACCENTS = ["#00f0ff", "#ff00e5", "#7000ff", "#00ff88", "#ffbb00"];

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((u) => {
      if (!u) {
        router.push("/admin/login");
      } else {
        setUser(u);
      }
    });

    const q = query(collection(db, "messages"), orderBy("timestamp", "desc"));
    const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
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
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 0.8, opacity: 1 }}
                  className={`w-[400px] h-[711px] bg-[#030305] relative overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center p-8`}
                >
                  {/* Background Layer */}
                  <div className="absolute inset-0" style={{ background: storyConfig.bg }}></div>
                  
                  {/* Noise Overlay */}
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

                  <div className="relative z-10 w-full">
                    <div 
                      className={`
                        ${storyConfig.borderRadius} p-8 relative overflow-hidden transition-all duration-500
                        ${storyConfig.cardStyle === 'glass' ? 'bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl' : ''}
                        ${storyConfig.cardStyle === 'solid' ? 'bg-black/40 border border-white/5 shadow-xl' : ''}
                        ${storyConfig.cardStyle === 'neon' ? 'bg-black/60 border-2 shadow-[0_0_30px_rgba(0,240,255,0.2)]' : ''}
                      `}
                      style={{ 
                        borderColor: storyConfig.cardStyle === 'neon' ? storyConfig.accentColor : undefined,
                        boxShadow: storyConfig.cardStyle === 'neon' ? `0 0 40px ${storyConfig.accentColor}22` : undefined
                      }}
                    >
                      {/* Accent Line */}
                      <div className="absolute top-0 left-0 w-full h-1" style={{ background: `linear-gradient(to right, ${storyConfig.accentColor}, #7000ff)` }}></div>
                      
                      <div className="flex justify-center mb-6">
                        <h1 className="text-3xl font-bold tracking-tighter text-white">
                          onyx<span style={{ color: storyConfig.accentColor }}>box</span>
                        </h1>
                      </div>
   
                      <div className="text-center mb-6">
                        <motion.span 
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className={`${storyConfig.moodSize} inline-block`}
                        >
                          {storyMessage.mood || "👻"}
                        </motion.span>
                      </div>
   
                      <p 
                        className={`
                          ${storyConfig.fontSize} ${storyConfig.textAlign} font-medium leading-relaxed ${storyConfig.font} text-white
                          ${storyConfig.glowEffect ? 'drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]' : ''}
                        `}
                        style={{ direction: "rtl" }}
                      >
                        "{storyMessage.content}"
                      </p>

                      <div className="mt-8 flex flex-col items-center gap-4">
                        {storyConfig.showSender && (
                          <div className="flex items-center gap-2 text-white/60">
                            <User className="w-4 h-4" style={{ color: storyConfig.accentColor }} />
                            <span className="text-sm font-medium">{storyMessage.senderName || "Anonymous"}</span>
                          </div>
                        )}

                        {storyConfig.showTimestamp && (
                          <div className="flex items-center gap-2 text-white/40">
                            <Clock className="w-3 h-3" />
                            <span className="text-[10px] uppercase tracking-widest">
                              {storyMessage.timestamp?.seconds
                                ? format(new Date(storyMessage.timestamp.seconds * 1000), "PPpp", { locale: arEG })
                                : "Just now"}
                            </span>
                          </div>
                        )}

                        {storyConfig.showBadge && (
                          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
                            <Shield className="w-3 h-3" style={{ color: storyConfig.accentColor }} />
                            <span className="text-[10px] font-mono text-white/60 uppercase tracking-tighter">Verified Secret</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-12 text-center">
                      <p className="text-sm font-light tracking-[0.8em] text-white/30 uppercase">Send me a secret</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Controls Area */}
              <GlassCard className="h-fit space-y-6 overflow-y-auto max-h-[90vh] p-8 border-white/10">
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Story Lab
                  </h2>
                  <button onClick={() => setIsCustomizing(false)} className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-all">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Style Section */}
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold flex items-center gap-2">
                      <Layout className="w-3 h-3" /> Card Style
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {["glass", "solid", "neon"].map((style) => (
                        <button
                          key={style}
                          onClick={() => setStoryConfig({ ...storyConfig, cardStyle: style as any })}
                          className={`py-2 rounded-lg border text-[10px] capitalize transition-all ${storyConfig.cardStyle === style ? "border-primary text-primary bg-primary/10 shadow-[0_0_15px_rgba(0,240,255,0.1)]" : "border-white/5 text-gray-500 hover:bg-white/5"}`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Background Section */}
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold flex items-center gap-2">
                      <Palette className="w-3 h-3" /> Background
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {BACKGROUNDS.map((bg) => (
                        <button
                          key={bg.name}
                          onClick={() => setStoryConfig({ ...storyConfig, bg: bg.value })}
                          className={`p-2 rounded-lg border text-[10px] transition-all ${storyConfig.bg === bg.value ? "border-primary text-primary bg-primary/10" : "border-white/5 text-gray-500 hover:bg-white/5"}`}
                        >
                          {bg.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Accent Color Section */}
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">Accent Color</label>
                    <div className="flex gap-3">
                      {ACCENTS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setStoryConfig({ ...storyConfig, accentColor: color })}
                          className={`w-8 h-8 rounded-full border-2 transition-transform ${storyConfig.accentColor === color ? "border-white scale-125 shadow-lg" : "border-transparent hover:scale-110"}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Typography Section */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold flex items-center gap-2">
                        <Type className="w-3 h-3" /> Font Size
                      </label>
                      <select 
                        value={storyConfig.fontSize}
                        onChange={(e) => setStoryConfig({ ...storyConfig, fontSize: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary"
                      >
                        <option value="text-xl">Small</option>
                        <option value="text-2xl">Medium</option>
                        <option value="text-3xl">Large</option>
                        <option value="text-4xl">Extra Large</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">Alignment</label>
                      <div className="flex gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
                        {["text-left", "text-center", "text-right"].map((align) => (
                          <button
                            key={align}
                            onClick={() => setStoryConfig({ ...storyConfig, textAlign: align as any })}
                            className={`flex-1 py-1.5 rounded-md text-[10px] transition-all ${storyConfig.textAlign === align ? "bg-primary text-black font-bold" : "text-gray-500 hover:text-white"}`}
                          >
                            {align.split("-")[1].charAt(0).toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Toggles Section */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-10 h-5 rounded-full relative transition-colors ${storyConfig.showBadge ? 'bg-primary' : 'bg-white/10'}`}>
                        <input type="checkbox" checked={storyConfig.showBadge} onChange={(e) => setStoryConfig({ ...storyConfig, showBadge: e.target.checked })} className="sr-only" />
                        <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${storyConfig.showBadge ? 'translate-x-5' : ''}`} />
                      </div>
                      <span className="text-xs text-gray-400 group-hover:text-white transition-colors">Badge</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-10 h-5 rounded-full relative transition-colors ${storyConfig.showTimestamp ? 'bg-primary' : 'bg-white/10'}`}>
                        <input type="checkbox" checked={storyConfig.showTimestamp} onChange={(e) => setStoryConfig({ ...storyConfig, showTimestamp: e.target.checked })} className="sr-only" />
                        <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${storyConfig.showTimestamp ? 'translate-x-5' : ''}`} />
                      </div>
                      <span className="text-xs text-gray-400 group-hover:text-white transition-colors">Time</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-10 h-5 rounded-full relative transition-colors ${storyConfig.showSender ? 'bg-primary' : 'bg-white/10'}`}>
                        <input type="checkbox" checked={storyConfig.showSender} onChange={(e) => setStoryConfig({ ...storyConfig, showSender: e.target.checked })} className="sr-only" />
                        <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${storyConfig.showSender ? 'translate-x-5' : ''}`} />
                      </div>
                      <span className="text-xs text-gray-400 group-hover:text-white transition-colors">Sender</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-10 h-5 rounded-full relative transition-colors ${storyConfig.glowEffect ? 'bg-primary' : 'bg-white/10'}`}>
                        <input type="checkbox" checked={storyConfig.glowEffect} onChange={(e) => setStoryConfig({ ...storyConfig, glowEffect: e.target.checked })} className="sr-only" />
                        <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${storyConfig.glowEffect ? 'translate-x-5' : ''}`} />
                      </div>
                      <span className="text-xs text-gray-400 group-hover:text-white transition-colors">Glow</span>
                    </label>
                  </div>
                </div>

                <button
                  onClick={downloadStory}
                  className="w-full py-4 bg-primary text-black font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(0,240,255,0.2)] mt-8"
                >
                  <Download className="w-5 h-5" />
                  Export to Gallery
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
            onyx<span className="text-primary group-hover:drop-shadow-[0_0_10px_rgba(0,240,255,0.5)] transition-all">box</span>
          </motion.button>
          <span className="text-primary/50 text-sm font-normal ml-2">dashboard</span>
          {user?.email === "murphysec72@gmail.com" && (
            <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/50 flex items-center gap-1">
              <Shield className="w-3 h-3" /> Super Admin
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search messages or senders..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-glass-bg border border-glass-border rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary w-64 transition-all"
            />
          </div>

          <button
            onClick={() => setStealthMode(!stealthMode)}
            className={`p-2 rounded-lg border transition-colors ${stealthMode ? 'bg-primary/20 border-primary text-primary' : 'bg-glass-bg border-glass-border text-gray-400 hover:text-white'}`}
            title="Stealth Mode (Blur Messages)"
          >
            {stealthMode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>

          <button
            onClick={handleExport}
            className="p-2 rounded-lg bg-glass-bg border border-glass-border text-gray-400 hover:text-white transition-colors"
            title="Export CSV"
          >
            <Download className="w-5 h-5" />
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors bg-glass-bg px-4 py-2 rounded-lg border border-glass-border"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </header>

      <StatsWidget 
        totalMessages={messages.length} 
        unreadMessages={messages.filter(m => !m.readStatus).length} 
      />

      {filteredMessages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500">
          <Inbox className="w-16 h-16 mb-4 opacity-20" />
          <p className="text-xl">No messages found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMessages.map((msg) => (
            <div key={msg.id} id={`message-${msg.id}`} className="relative group">
              <GlassCard 
                className={`h-full flex flex-col justify-between transition-all duration-300 ${msg.readStatus ? 'opacity-70' : 'border-primary/50'}`}
                hoverEffect
              >
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-primary font-bold text-sm">
                        <User className="w-3 h-3" />
                        {msg.senderName || "Anonymous"}
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">
                        {msg.timestamp?.seconds
                          ? format(new Date(msg.timestamp.seconds * 1000), "PPpp", { locale: arEG })
                          : "Just now"}
                      </span>
                    </div>
                    {msg.readStatus && <Check className="w-4 h-4 text-green-500" />}
                  </div>
                  
                  {/* Mood Indicator */}
                  {msg.mood && (
                    <div className="absolute top-4 right-4 text-2xl animate-pulse">
                      {msg.mood}
                    </div>
                  )}

                  <p className={`text-white text-lg leading-relaxed whitespace-pre-wrap mt-2 ${stealthMode ? 'blur-md hover:blur-none transition-all duration-300' : ''}`}>
                    {msg.content}
                  </p>
                </div>

                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => toggleReadStatus(msg.id, msg.readStatus)}
                    className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    title={msg.readStatus ? "Mark as Unread" : "Mark as Read"}
                  >
                    {msg.readStatus ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleShare(msg)}
                    className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-blue-400 transition-colors"
                    title="Share to Story"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="p-2 rounded-full hover:bg-red-500/20 text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </GlassCard>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
