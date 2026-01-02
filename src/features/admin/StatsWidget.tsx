"use client";

import GlassCard from "@/shared/components/GlassCard";
import { MessageSquare, Clock, Zap } from "lucide-react";

interface StatsProps {
  totalMessages: number;
  unreadMessages: number;
}

export default function StatsWidget({ totalMessages, unreadMessages }: StatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <GlassCard className="flex items-center gap-4" hoverEffect>
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
          <MessageSquare className="w-6 h-6" />
        </div>
        <div>
          <p className="text-gray-400 text-sm">Total Messages</p>
          <h3 className="text-2xl font-bold text-white">{totalMessages}</h3>
        </div>
      </GlassCard>

      <GlassCard className="flex items-center gap-4" hoverEffect>
        <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
          <Zap className="w-6 h-6" />
        </div>
        <div>
          <p className="text-gray-400 text-sm">New / Unread</p>
          <h3 className="text-2xl font-bold text-white">{unreadMessages}</h3>
        </div>
      </GlassCard>

      <GlassCard className="flex items-center gap-4" hoverEffect>
        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <p className="text-gray-400 text-sm">System Status</p>
          <h3 className="text-2xl font-bold text-white">Online 🟢</h3>
        </div>
      </GlassCard>
    </div>
  );
}
