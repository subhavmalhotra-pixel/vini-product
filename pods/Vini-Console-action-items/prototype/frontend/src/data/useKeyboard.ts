import { useEffect } from "react";

/**
 * Phase 1 keyboard shortcut set for the Action Items page.
 *
 * Per design-console-action-items.md §4 (Interaction patterns):
 *   J / K     — move focus down / up within the row list
 *   Enter     — expand / collapse the focused row (handled by the row itself)
 *   A         — assign the focused row
 *   C         — close the focused row
 *   L         — listen / open SourceDrawer for the focused row
 *   ?         — open the HelpDrawer
 *   Esc       — close any open drawer (handled by Drawer itself)
 *
 * The shortcuts are global on the page but suppressed when:
 *   - any drawer is open (Esc handles closure)
 *   - focus is in a text input / textarea / select
 *   - a modifier key is held (Cmd / Ctrl / Alt)
 */

type Handlers = {
  onNext: () => void;
  onPrev: () => void;
  onAssign: () => void;
  onClose: () => void;
  onListen: () => void;
  onHelp: () => void;
};

export function useActionItemsKeyboard(handlers: Handlers, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    function handler(e: KeyboardEvent) {
      // Skip if the user is typing in an input
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          tag === "SELECT" ||
          target.isContentEditable
        ) {
          return;
        }
      }

      // Skip if modifier keys are held
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      switch (e.key.toLowerCase()) {
        case "j":
          e.preventDefault();
          handlers.onNext();
          break;
        case "k":
          e.preventDefault();
          handlers.onPrev();
          break;
        case "a":
          e.preventDefault();
          handlers.onAssign();
          break;
        case "c":
          e.preventDefault();
          handlers.onClose();
          break;
        case "l":
          e.preventDefault();
          handlers.onListen();
          break;
        case "?":
          e.preventDefault();
          handlers.onHelp();
          break;
      }
    }

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enabled, handlers]);
}
