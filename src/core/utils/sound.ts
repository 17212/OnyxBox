"use client";

export const playSound = (type: "hover" | "click" | "success" | "error" | "notification") => {
  const sounds = {
    hover: "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3", // Sci-fi hover
    click: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3", // Sci-fi click
    success: "https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3", // Success chime
    error: "https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3", // Error buzz
    notification: "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3", // Notification ping
  };

  const audio = new Audio(sounds[type]);
  audio.volume = 0.2; // Keep it subtle
  audio.play().catch(() => {}); // Ignore autoplay errors
};

export const vibrate = (pattern: number | number[] = 10) => {
  if (typeof window !== "undefined" && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};
