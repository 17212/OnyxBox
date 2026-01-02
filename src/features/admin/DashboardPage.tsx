"use client";

import { useEffect, useState, useRef } from "react";
import { collection, query, orderBy, onSnapshot, Timestamp, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/core/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import GlassCard from "@/shared/components/GlassCard";
import AnimatedBackground from "@/shared/components/AnimatedBackground";
import { LogOut, Clock, Inbox, Trash2, Share2, Download } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import html2canvas from "html2canvas";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Message {
  id: string;
  content: string;
  timestamp: Timestamp;
  readStatus: boolean;
}

export default function DashboardPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/admin/login");
      }
    });

    const q = query(collection(db, "messages"), orderBy("timestamp", "desc"));
    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(msgs);
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeMessages();
    };
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/admin/login");
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this message?")) {
      try {
        await deleteDoc(doc(db, "messages", id));
        toast.success("Message deleted");
      } catch (error) {
        console.error("Error deleting message:", error);
        toast.error("Failed to delete");
      }
    }
  };

  const handleMarkRead = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "messages", id), {
        readStatus: !currentStatus
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleShare = async (id: string) => {
    const cardElement = cardRefs.current[id];
    if (!cardElement) return;

    try {
      const canvas = await html2canvas(cardElement, {
        backgroundColor: null,
        scale: 2, // High res
        logging: false,
      });
      
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `onyxbox-message-${id}.png`;
      link.click();
      toast.success("Image generated for Story!");
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Failed to generate image");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-12 relative">
      <AnimatedBackground />
      <ToastContainer position="bottom-right" theme="dark" />
      
      <header className="flex justify-between items-center mb-12 relative z-10">
        <h1 className="text-3xl font-bold text-white">
          OnyxBox <span className="text-primary text-sm font-normal ml-2">Dashboard</span>
        </h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-glass-bg px-4 py-2 rounded-lg border border-glass-border"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </header>

      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
          <Inbox className="w-24 h-24 mb-4 opacity-20" />
          <p className="text-xl">صندوقك لسه فاضي</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {messages.map((msg) => (
            <div key={msg.id} className="group relative">
              {/* Action Buttons (Hover) */}
              <div className="absolute -top-3 -right-3 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleShare(msg.id)}
                  className="p-2 bg-primary text-black rounded-full shadow-lg hover:scale-110 transition-transform"
                  title="Share to Story"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(msg.id)}
                  className="p-2 bg-red-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Capture Target */}
              <div ref={(el) => { cardRefs.current[msg.id] = el; }}>
                <GlassCard 
                  className={`relative h-full transition-all duration-300 ${!msg.readStatus ? 'border-primary/50 shadow-[0_0_20px_rgba(0,240,255,0.1)]' : ''}`}
                >
                  <div 
                    className="absolute top-0 left-0 w-full h-full cursor-pointer z-0"
                    onClick={() => handleMarkRead(msg.id, msg.readStatus)}
                  />
                  
                  {!msg.readStatus && (
                    <div className="absolute top-4 right-4 w-3 h-3 bg-primary rounded-full shadow-[0_0_10px_#00f0ff] z-10" />
                  )}
                  
                  <div className="relative z-10 pointer-events-none">
                    <p className="text-lg text-white mb-8 leading-relaxed whitespace-pre-wrap font-medium">
                      {msg.content}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mt-auto border-t border-white/5 pt-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>
                          {msg.timestamp
                            ? formatDistanceToNow(msg.timestamp.toDate(), { addSuffix: true, locale: ar })
                            : "Just now"}
                        </span>
                      </div>
                      <span className="text-[10px] tracking-widest opacity-50">ONYXBOX</span>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
