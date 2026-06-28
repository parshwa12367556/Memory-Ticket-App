import type { Mood } from "../types";

const MOOD_PHRASES: Record<Mood, string[]> = {
  Joyful:      ["Pure light, bottled.", "Laughter louder than the city.", "A day stitched from sunshine."],
  Nostalgic:   ["Golden skies and unforgettable moments frozen forever.", "A memory that still smells like summer.", "The kind of evening that follows you home."],
  Adventurous: ["Where the trail ends, the sky begins.", "We chased the horizon and almost caught it.", "Boots dusty, hearts louder."],
  Peaceful:    ["Stillness, dressed in salt and gold.", "Quiet enough to hear the world breathe.", "A pause the world owed us."],
  Romantic:    ["Two heartbeats, one slow song.", "Your hand and the long way home.", "Even the streetlights felt like candles."],
  Reflective:  ["The map ran out, but we kept walking anyway.", "Some moments only fit in silence.", "A page the day wrote without us."],
  Energetic:   ["A night that turned strangers into a single, beating heart.", "Lightning in our shoes.", "Loud, electric, ours."],
};

export function generateCaption(mood: Mood, location: string, title: string): string {
  const pool = MOOD_PHRASES[mood] ?? MOOD_PHRASES.Joyful;
  const base = pool[Math.floor(Math.random() * pool.length)];
  if (location && Math.random() > 0.5) return `${base} — ${location}.`;
  if (title && Math.random() > 0.6) return `${title}: ${base.toLowerCase()}`;
  return base;
}
