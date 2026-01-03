// =====================================================
// 🦅 ONYXBOX - TYPE DEFINITIONS
// Central type definitions for the entire app
// =====================================================

import { Timestamp } from "firebase/firestore";

// =================== MESSAGE ===================
export interface Message {
  id: string;
  content: string;
  senderName?: string;
  senderUid?: string;
  timestamp: Timestamp | null;
  readStatus: boolean;
  mood?: string;
  isAnonymous?: boolean;
  // New interaction fields
  adminReaction?: string;
  adminReply?: string;
  adminReplyTimestamp?: Timestamp;
  isPinned?: boolean;
  isFavorite?: boolean;
}

// =================== USER ===================
export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  isAnonymous: boolean;
  photoURL?: string | null;
}

// =================== STORY CONFIG ===================
export interface StoryConfig {
  bg: string;
  font: string;
  showBadge: boolean;
  showTimestamp: boolean;
  showSender: boolean;
  accentColor: string;
  fontSize: string;
  textAlign: "text-left" | "text-center" | "text-right";
  borderRadius: string;
  cardStyle: "glass" | "solid" | "neon";
  moodSize: string;
  glowEffect: boolean;
}

// =================== NOTIFICATION ===================
export interface AppNotification {
  id: string;
  type: "read" | "reaction" | "reply";
  messageId: string;
  content: string;
  timestamp: Timestamp;
  isRead: boolean;
}

// =================== STATS ===================
export interface DashboardStats {
  totalMessages: number;
  unreadMessages: number;
  todayMessages: number;
  weekMessages: number;
  topMoods: { mood: string; count: number }[];
}

// =================== FILTER OPTIONS ===================
export type FilterOption = "all" | "unread" | "read" | "pinned" | "favorites";
export type SortOption = "newest" | "oldest" | "unread-first";

// =================== SOUND TYPES ===================
export type SoundType = "hover" | "click" | "success" | "error" | "notification" | "reaction";
