"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function AnimatedBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    const handleMouseMove = (e: MouseEvent) => {
      // Throttle mouse updates for performance
      requestAnimationFrame(() => {
        setMousePosition({
          x: e.clientX,
          y: e.clientY,
        });
      });
    };

    if (!isMobile) {
      window.addEventListener("mousemove", handleMouseMove);
    }
    
    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isMobile]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#030305]">
      {/* Deep Space Base */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0a0a1a] via-[#030305] to-[#000000]" />

      {/* Aurora Borealis Effect - Simplified for Mobile */}
      <motion.div
        animate={{
          rotate: [0, 360],
          scale: isMobile ? [1, 1.1, 1] : [1, 1.2, 1],
        }}
        transition={{ duration: isMobile ? 45 : 30, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-primary/10 rounded-full blur-[100px] md:blur-[150px] mix-blend-screen pointer-events-none will-change-transform"
      />
      <motion.div
        animate={{
          rotate: [360, 0],
          scale: isMobile ? [1, 1.1, 1] : [1, 1.3, 1],
        }}
        transition={{ duration: isMobile ? 50 : 35, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-20%] right-[-10%] w-[80vw] h-[80vw] bg-secondary/10 rounded-full blur-[100px] md:blur-[150px] mix-blend-screen pointer-events-none will-change-transform"
      />

      {/* Interactive Glow - Disabled on Mobile for Performance */}
      {!isMobile && (
        <motion.div
          animate={{
            x: mousePosition.x - 400,
            y: mousePosition.y - 400,
          }}
          transition={{ type: "spring", damping: 50, stiffness: 400 }}
          className="absolute w-[800px] h-[800px] bg-gradient-to-r from-primary/5 to-secondary/5 rounded-full blur-[100px] pointer-events-none mix-blend-plus-lighter will-change-transform"
        />
      )}

      {/* Cyberpunk Grid */}
      <div 
        className="absolute inset-0 opacity-[0.05]" 
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
        }}
      />

      {/* Noise Texture for Film Grain Feel */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />
    </div>
  );
}
