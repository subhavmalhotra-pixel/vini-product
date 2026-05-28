import { Drawer } from "./Drawer";

/**
 * Keyboard shortcut reference — Phase 1 design contract §4.
 *
 * Opened via:
 *   - `?` keyboard shortcut (anywhere on the page)
 *   - Question-mark icon in the page header
 *
 * Intentionally minimal — no onboarding tour, no walkthrough. Just a
 * reference card. Onboarding is explicitly Phase 2 per the design doc.
 */

const SHORTCUTS: { key: string; description: string }[] = [
  { key: "J", description: "Move to the next row" },
  { key: "K", description: "Move to the previous row" },
  { key: "Enter", description: "Expand / collapse the focused row" },
  { key: "A", description: "Assign the focused row" },
  { key: "C", description: "Mark the focused row closed" },
  { key: "L", description: "Listen to the source conversation" },
  { key: "?", description: "Open this help" },
  { key: "Esc", description: "Close the open drawer" },
];

export function HelpDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Drawer open={open} onClose={onClose} title="Keyboard shortcuts" width="380px">
      <div className="px-5 py-4">
        <p className="text-[12px] text-text-secondary">
          Move through the queue without leaving the keyboard. All shortcuts
          are single keys — no modifiers.
        </p>

        <dl className="mt-4 space-y-2">
          {SHORTCUTS.map(({ key, description }) => (
            <div
              key={key}
              className="flex items-center justify-between gap-3 rounded-md border border-border-subtle bg-surface-subtle/40 px-3 py-1.5"
            >
              <dt>
                <kbd className="rounded border border-border-strong bg-white px-2 py-0.5 font-mono text-[11px] font-semibold text-text-primary shadow-[0_1px_0_rgba(0,0,0,0.04)]">
                  {key}
                </kbd>
              </dt>
              <dd className="flex-1 text-right text-[12px] text-text-secondary">
                {description}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-5 rounded-md border border-brand-purple-border bg-brand-purple-soft/40 px-3 py-2 text-[11px] leading-relaxed text-text-secondary">
          Shortcuts are suppressed while you're typing in an input or while a
          drawer is open. <kbd className="font-mono">Esc</kbd> always closes
          the open drawer.
        </p>
      </div>
    </Drawer>
  );
}
