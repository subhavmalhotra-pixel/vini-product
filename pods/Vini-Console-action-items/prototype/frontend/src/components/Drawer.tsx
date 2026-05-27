import type { ReactNode } from "react";
import { useEffect } from "react";
import { CloseIcon } from "./Icon";

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
  useEffect(() => {
    if (!open) return;
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 transition-opacity duration-150"
        onClick={onClose}
        aria-hidden
      />
      <aside
        className="fixed inset-y-0 right-0 z-50 flex flex-col bg-white shadow-2xl"
        style={{ width }}
        role="dialog"
        aria-label={title}
      >
        <header className="flex flex-shrink-0 items-center justify-between border-b border-border-subtle px-5 py-3">
          <h2 className="text-[14px] font-semibold text-text-primary">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-text-tertiary hover:bg-surface-subtle hover:text-text-secondary"
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
