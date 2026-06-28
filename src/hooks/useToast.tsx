import { useState, type ReactNode } from "react";

export function useToast() {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const ToastUI: ReactNode = toast ? (
    <div className="pointer-events-none fixed left-1/2 top-6 z-50 -translate-x-1/2 animate-fade-up rounded-full border border-white/10 bg-[#171722]/90 px-4 py-2 text-xs font-semibold text-white backdrop-blur-xl">
      {toast}
    </div>
  ) : null;

  return { toast, showToast, ToastUI };
}
