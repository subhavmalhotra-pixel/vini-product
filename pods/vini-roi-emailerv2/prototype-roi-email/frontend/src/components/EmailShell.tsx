import type { ReactNode } from "react";

type EmailShellProps = {
  dealerName: string;
  emailTitle: string;
  dateRange: string;
  bdcHoursEquivalent?: number;
  reportingPeriod?: string;
  nextSend?: string;
  children: ReactNode;
};

export function EmailShell({
  dealerName,
  emailTitle,
  dateRange,
  bdcHoursEquivalent,
  reportingPeriod,
  nextSend,
  children,
}: EmailShellProps) {
  return (
    <div className="mx-auto w-full max-w-full overflow-hidden rounded-xl border border-border-subtle bg-surface-card shadow-sm sm:max-w-2xl lg:max-w-3xl">
      {/* Header */}
      <header className="border-b border-border-subtle px-4 py-5 sm:px-6 sm:py-6 lg:px-10">
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-brand-primary">
              Vini · Dealer Reporting
            </div>
            <h1 className="mt-1.5 text-lg font-semibold leading-tight text-text-primary sm:text-xl">
              {emailTitle}
            </h1>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-sm font-semibold text-text-primary">{dealerName}</div>
            <div className="mt-0.5 text-xs text-text-secondary">{dateRange}</div>
          </div>
        </div>
      </header>

      {children}

      {/* Footer */}
      <footer className="border-t border-border-subtle bg-surface-background px-4 py-5 sm:px-6 sm:py-6 lg:px-10">
        <div className="flex flex-col gap-3 text-xs leading-relaxed text-text-secondary sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="space-y-0.5">
            {/* v2: 'Xh of agent effort equivalent' removed per design review */}
            {bdcHoursEquivalent !== undefined && bdcHoursEquivalent > 0 ? (
              <div>
                <span className="font-semibold text-text-primary tabular">
                  ~{bdcHoursEquivalent}h
                </span>{" "}
                of agent effort equivalent
              </div>
            ) : null}
            {reportingPeriod ? <div>Reporting period: {reportingPeriod}</div> : null}
            {nextSend ? <div>Next report: {nextSend}</div> : null}
          </div>
          <div className="text-left sm:text-right">
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="text-text-secondary underline hover:text-text-primary"
            >
              Manage subscription
            </a>
            <div className="mt-1 text-text-muted">
              © Vini · {new Date().getFullYear()}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
