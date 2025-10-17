/**
 * Simple toast hook for notifications
 */

import { useState, useCallback } from "react";

interface Toast {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

let toastCallback: ((toast: Toast) => void) | null = null;

export function useToast() {
  const [toasts, setToasts] = useState<(Toast & { id: number })[]>([]);
  const [nextId, setNextId] = useState(0);

  const toast = useCallback(
    ({ title, description, variant = "default" }: Toast) => {
      const id = nextId;
      setNextId(id + 1);
      setToasts((prev) => [...prev, { id, title, description, variant }]);

      // Auto-dismiss after 3 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);

      // Also show in console for debugging
      const prefix = variant === "destructive" ? "❌" : "✅";
      console.log(`${prefix} ${title}${description ? `: ${description}` : ""}`);
    },
    [nextId]
  );

  // Register global callback for cross-component toasts
  toastCallback = toast;

  return { toast, toasts };
}

// Helper to show toast from anywhere
export function showToast(toast: Toast) {
  if (toastCallback) {
    toastCallback(toast);
  } else {
    // Fallback to alert if no toast hook is mounted
    alert(`${toast.title}${toast.description ? `\n${toast.description}` : ""}`);
  }
}
