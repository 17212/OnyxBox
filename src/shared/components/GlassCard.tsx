"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export default function GlassCard({ children, className = "", hoverEffect = false }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={hoverEffect ? { scale: 1.02, boxShadow: "0 20px 40px rgba(0,240,255,0.1)" } : {}}
      className={`glass-card rounded-2xl p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}
