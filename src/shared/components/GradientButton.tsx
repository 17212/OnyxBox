"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";
import { playSound } from "@/core/utils/sound";

interface GradientButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode;
  isLoading?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
}

export default function GradientButton({ children, className = "", isLoading, ...props }: GradientButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onMouseEnter={() => playSound("hover")}
      onClick={() => playSound("click")}
      className={`relative overflow-hidden rounded-xl bg-gradient-to-r from-primary to-secondary px-8 py-4 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      disabled={isLoading || (props.disabled as boolean)}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isLoading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          children
        )}
      </span>
      <div className="absolute inset-0 -z-0 bg-gradient-to-r from-secondary to-primary opacity-0 transition-opacity duration-300 hover:opacity-100" />
    </motion.button>
  );
}
