"use client";

import { useState, useEffect, useRef } from "react";
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/core/lib/firebase";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import GlassCard from "@/shared/components/GlassCard";
import AnimatedBackground from "@/shared/components/AnimatedBackground";
import { Trash2, LogOut, Share2, Check, Eye, EyeOff, Search, Download, Shield, Inbox } from "lucide-react";
import { format } from "date-fns";
import { arEG } from "date-fns/locale";
import html2canvas from "html2canvas";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import StatsWidget from "@/features/admin/StatsWidget";
import { downloadCSV } from "@/core/utils/export";
import { playSound } from "@/core/utils/sound";

interface Message {
  id: string;
  content: string;
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
  const router = useRouter();
  const storyRef = useRef<HTMLDivElement>(null);
  const [storyMessage, setStoryMessage] = useState<Message | null>(null);

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
      msg.content.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleShare = async (msg: Message) => {
    setStoryMessage(msg);
    // Wait for state update and render
    setTimeout(async () => {
      if (storyRef.current) {
        const canvas = await html2canvas(storyRef.current, {
          backgroundColor: "#030305",
          scale: 2,
          useCORS: true,
        });
        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = image;
        link.download = `onyxbox-story-${msg.id}.png`;
        link.click();
        toast.success("تم إنشاء الستوري بنجاح! 📸");
        playSound("success");
        setStoryMessage(null);
      }
    }, 100);
  };

  const handleExport = () => {
    const dataToExport = messages.map(msg => ({
      Content: msg.content,
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
      
      {/* Hidden Story Template */}
      {storyMessage && (
        <div className="fixed top-0 left-0 -z-50 w-[1080px] h-[1920px] bg-[#030305] flex items-center justify-center p-20" ref={storyRef}>
          <div className="absolute inset-0 bg-[url('/aurora.png')] opacity-30 bg-cover bg-center"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030305]/50 to-[#030305]"></div>
          
          <div className="relative z-10 w-full max-w-3xl">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-16 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-secondary"></div>
              
              <div className="flex justify-center mb-12">
                <h1 className="text-6xl font-bold text-white tracking-tighter">
                  Onyx<span className="text-primary">Box</span>
                </h1>
              </div>

              <div className="text-center mb-12">
                <span className="text-8xl animate-bounce">{storyMessage.mood || "👻"}</span>
              </div>

              <p className="text-5xl text-white font-medium text-center leading-relaxed" style={{ direction: "rtl" }}>
                "{storyMessage.content}"
              </p>

              <div className="mt-16 flex justify-center items-center gap-4 text-gray-400">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <span className="text-2xl font-mono">Anonymous Message</span>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <p className="text-3xl text-gray-500 font-light tracking-[0.5em]">SEND ME A SECRET</p>
            </div>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row justify-between items-center mb-8 relative z-10 gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-white">
            OnyxBox <span className="text-primary text-sm font-normal ml-2">Dashboard</span>
          </h1>
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
              placeholder="Search messages..." 
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
          <Search className="w-16 h-16 mb-4 opacity-20" />
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
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-gray-500 font-mono">
                      {msg.timestamp?.seconds
                        ? format(new Date(msg.timestamp.seconds * 1000), "PPpp", { locale: arEG })
                        : "Just now"}
                    </span>
                    {msg.readStatus && <Check className="w-4 h-4 text-green-500" />}
                  </div>
                  
                  {/* Mood Indicator */}
                  {msg.mood && (
                    <div className="absolute top-4 right-4 text-2xl animate-pulse">
                      {msg.mood}
                    </div>
                  )}

                  <p className={`text-white text-lg leading-relaxed whitespace-pre-wrap mt-6 ${stealthMode ? 'blur-md hover:blur-none transition-all duration-300' : ''}`}>
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
