"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Github, Instagram, Send, Mail, ExternalLink, Globe, ShieldCheck } from "lucide-react";
import GlassCard from "./GlassCard";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SOCIALS = [
  {
    name: "TikTok",
    icon: <Globe className="w-5 h-5" />,
    link: "https://www.tiktok.com/@idris.ghamid",
    color: "hover:text-[#ff0050]"
  },
  {
    name: "Instagram",
    icon: <Instagram className="w-5 h-5" />,
    link: "https://www.instagram.com/@idris.ghamid",
    color: "hover:text-[#e1306c]"
  },
  {
    name: "Telegram",
    icon: <Send className="w-5 h-5" />,
    link: "https://t.me/IDRV72",
    color: "hover:text-[#0088cc]"
  },
  {
    name: "GitHub",
    icon: <Github className="w-5 h-5" />,
    link: "https://github.com/IDRISIUM",
    color: "hover:text-white"
  }
];

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg"
          >
            <GlassCard className="p-6 md:p-8 relative overflow-hidden border-white/10 max-h-[90vh] overflow-y-auto">
              {/* Decorative Background */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-[80px]" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/20 rounded-full blur-[80px]" />

              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center">
                <motion.div
                  initial={{ rotate: -10, scale: 0.8 }}
                  animate={{ rotate: 0, scale: 1 }}
                  className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-primary to-secondary p-[2px] mb-6 shadow-[0_0_40px_rgba(0,240,255,0.3)]"
                >
                  <div className="w-full h-full rounded-[22px] bg-[#030305] flex items-center justify-center overflow-hidden">
                    <span className="text-4xl font-bold text-white tracking-tighter">IG</span>
                  </div>
                </motion.div>

                <h2 className="text-3xl font-bold text-white mb-1 tracking-tight">Idris Ghamid</h2>
                <p className="text-primary font-mono text-sm mb-6 uppercase tracking-[0.3em]">إدريس غامد</p>

                <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-sm">
                  Lead Developer & Architect at <span className="text-white font-bold">IDRISIUM Corp</span>. 
                  Obsessed with creating pixel-perfect, high-performance digital experiences.
                </p>

                <div className="grid grid-cols-2 gap-3 w-full mb-8">
                  {SOCIALS.map((social) => (
                    <a
                      key={social.name}
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 text-gray-400 transition-all ${social.color} hover:bg-white/10 hover:border-white/10 hover:scale-[1.02]`}
                    >
                      {social.icon}
                      <span className="text-xs font-bold uppercase tracking-widest">{social.name}</span>
                    </a>
                  ))}
                </div>

                <div className="w-full space-y-3">
                  <a 
                    href="mailto:idris.ghamid@gmail.com"
                    className="flex items-center justify-between w-full p-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5" />
                      <span className="text-sm font-bold">idris.ghamid@gmail.com</span>
                    </div>
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>

                  <a 
                    href="http://idrisium.linkpc.net/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between w-full p-4 rounded-2xl bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5" />
                      <span className="text-sm font-bold">idrisium.linkpc.net</span>
                    </div>
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </div>

                <div className="mt-8 pt-8 border-t border-white/5 w-full flex items-center justify-center gap-2 text-[10px] text-gray-600 font-mono uppercase tracking-[0.2em]">
                  <ShieldCheck className="w-3 h-3 text-primary" />
                  Powered by IDRISIUM Security
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
