import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { CloseIcon } from "./Icon";

/**
 * Right-anchored drawer with backdrop blur + smooth enter/exit.
 *
 * Motion:
 *   - Enter:  220ms ease-out · backdrop fades + blurs · panel slides in 16px
 *   - Exit:   160ms ease-in  · backdrop fades + unblurs · panel slides out
 * Respects prefers-reduced-motion globally (durations clamped in index.css).
 */
export function Drawer({
  open,
  onClose,
  title,
  children,
  width = "440px",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: string;
}) {
  // Hold mounted state for the exit animation
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      // Run animation one frame after mount so transition fires
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    } else {
      setVisible(false);
      // Hold mounted long enough for exit animation to complete
      const t = setTimeout(() => setMounted(false), 180);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!mounted) return null;

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[3px] transition-opacity duration-200 ease-out ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex flex-col bg-white shadow-drawer transition-all duration-200 ease-out ${
          visible
            ? "translate-x-0 opacity-100"
            : "translate-x-4 opacity-0"
        }`}
        style={{ width }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="flex flex-shrink-0 items-center justify-between border-b border-border-subtle bg-white/80 px-5 py-3 backdrop-blur-sm">
          <h2 className="text-[14px] font-semibold tracking-tight text-text-primary">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary transition-colors duration-150 hover:bg-surface-subtle hover:text-text-secondary"
            aria-label="Close"
          >
            <CloseIcon size={16} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto scroll-thin">{children}</div>
      </aside>
    </>
  );
}
