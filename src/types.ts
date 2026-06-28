export type TicketTheme =
  | "retro"
  | "concert"
  | "boardingPass"
  | "cinematic"
  | "travel"
  | "minimal";

export const TICKET_THEMES: { id: TicketTheme; label: string; emoji: string; gradient: string }[] = [
  { id: "cinematic",    label: "Cinematic",    emoji: "🎬", gradient: "from-[#8a4fff] to-[#5ea3ff]" },
  { id: "travel",       label: "Travel",       emoji: "✈️", gradient: "from-[#5ea3ff] to-[#22d3ee]" },
  { id: "concert",      label: "Concert",      emoji: "🎸", gradient: "from-[#ff4f8a] to-[#8a4fff]" },
  { id: "boardingPass", label: "Boarding",     emoji: "🛫", gradient: "from-[#c8b6ff] to-[#8a4fff]" },
  { id: "retro",        label: "Retro",        emoji: "📼", gradient: "from-[#ffb84f] to-[#ff4f8a]" },
  { id: "minimal",      label: "Minimal",      emoji: "◻️", gradient: "from-[#f5f5f5] to-[#c8b6ff]" },
];

export type Mood =
  | "Joyful"
  | "Nostalgic"
  | "Adventurous"
  | "Peaceful"
  | "Romantic"
  | "Reflective"
  | "Energetic";

export const MOODS: { id: Mood; emoji: string; color: string }[] = [
  { id: "Joyful",       emoji: "😊", color: "#ffd166" },
  { id: "Nostalgic",    emoji: "🌅", color: "#ff9f7a" },
  { id: "Adventurous",  emoji: "🧗", color: "#22d3ee" },
  { id: "Peaceful",     emoji: "🌿", color: "#86efac" },
  { id: "Romantic",     emoji: "💜", color: "#f0abfc" },
  { id: "Reflective",   emoji: "🌙", color: "#c8b6ff" },
  { id: "Energetic",    emoji: "⚡", color: "#fde047" },
];

export interface MemoryTicket {
  id: string;
  title: string;
  description: string;
  location: string;
  mood: Mood;
  imageUrl: string;
  caption: string;
  theme: TicketTheme;
  favorite: boolean;
  createdAt: string; // ISO
  tags: string[];
  /** Base64-encoded WebP audio recording */
  voiceData?: string;
  /** Duration of voice recording in seconds */
  voiceDuration?: number;
  /** Geographic coordinates for map display */
  latitude?: number;
  longitude?: number;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  password: string; // local only — would be hashed in production
  city: string;
  bio: string;
  createdAt: string;
}

export interface Session {
  userId: string;
  email: string;
}
