type SuppressedSendOverlayProps = {
  reason?: string;
};

/**
 * Client-facing scrim shown in the preview tool when an email's
 * send_decision is "suppress". In production the email simply wouldn't send;
 * here we render a clean overlay so engineers can still inspect the underlying
 * preview without any internal Slack-channel references.
 */
export function SuppressedSendOverlay({ reason: _reason }: SuppressedSendOverlayProps) {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-20 flex items-start justify-center bg-slate-900/40 px-4 pt-24"
      aria-hidden
    >
      <div className="pointer-events-auto w-full max-w-md rounded-xl border border-border-subtle bg-surface-card p-6 shadow-email">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-brand-primary">
          Vini · Preview
        </div>
        <h3 className="mt-2 text-lg font-semibold leading-tight text-text-primary">
          Email suppressed
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          No conversations recorded yesterday — Vini is alerting your CS team.
          Email send paused for this rooftop.
        </p>
      </div>
    </div>
  );
}
