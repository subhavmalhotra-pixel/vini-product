import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { marked } from "marked";
import { ArrowLeftIcon, ClipboardListIcon, SparklesIcon } from "../components/Icon";

type DocMeta = {
  slug: string;
  title: string;
  subtitle: string;
  badge: string;
  file: string;
};

const DOCS: DocMeta[] = [
  {
    slug: "signal",
    title: "Customer Signal",
    subtitle:
      "Vini Console — Action Items · v3 · 3-pillar lifecycle (Create / Manage / Communicate) · 13 quotes · 10 data points",
    badge: "Signal",
    file: "/docs/signal-console-action-items.md",
  },
  {
    slug: "prd",
    title: "Product Requirements (PRD) — full detail",
    subtitle:
      "Vini Console — Action Items (Phase 1) · v3.0 · 22-row Section 3 non-goals · 11-stream Section 8.2 (A/B/C buckets) · 3 new lifecycle events · cross-pod schema signed off",
    badge: "PRD",
    file: "/docs/prd-console-action-items.md",
  },
  {
    slug: "prd-grooming",
    title: "PRD — grooming snippet",
    subtitle:
      "5-minute condensed view: 3-stage TL;DR · phase split by stage · non-goals at a glance · Phase 2 work streams clustered A/B/C · kill criteria short list.",
    badge: "Grooming",
    file: "/docs/prd-console-action-items-grooming.md",
  },
  {
    slug: "icp",
    title: "ICPs — BDC Agent + BDC Manager",
    subtitle:
      "Two personas (Madison · Anya) anchored to Signal v3 · JTBD · pains mapped to lifecycle pillars · 12-affordance design contract that drives the Phase 1 UI.",
    badge: "ICP",
    file: "/docs/icp-console-action-items.md",
  },
  {
    slug: "design",
    title: "Design — Phase 1 implementation plan",
    subtitle:
      "Non-complex single-screen UI · 12 affordances spec'd · interaction patterns · empty/loading/error · accessibility checklist · 12-edit prototype punch list.",
    badge: "Design",
    file: "/docs/design-console-action-items.md",
  },
];

export function DocsIndexPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <Link
        to="/action-items/pending"
        className="mb-4 inline-flex items-center gap-1 text-[11px] text-text-tertiary hover:text-text-secondary"
      >
        <ArrowLeftIcon size={11} /> Back to console
      </Link>
      <h1 className="text-2xl font-bold text-text-primary">
        Vini Console — Action Items
      </h1>
      <p className="mt-1 text-[13px] text-text-secondary">
        Product documentation for the Action Items pod. Read the signal first, then
        the PRD.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3">
        {DOCS.map((doc) => (
          <Link
            key={doc.slug}
            to={`/docs/${doc.slug}`}
            className="group flex items-center justify-between gap-4 rounded-lg border border-border-subtle bg-white px-5 py-4 transition-colors hover:border-brand-purple hover:bg-brand-purple-soft/40"
          >
            <div className="flex min-w-0 items-start gap-3">
              <span
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md ${
                  doc.slug === "signal"
                    ? "bg-status-ok-soft text-status-ok"
                    : doc.slug === "prd-grooming"
                      ? "bg-status-warning-soft text-status-warning"
                      : doc.slug === "icp"
                        ? "bg-dept-sales-soft text-dept-sales"
                        : doc.slug === "design"
                          ? "bg-dept-service-soft text-dept-service"
                          : "bg-brand-purple-soft text-brand-purple"
                }`}
              >
                {doc.slug === "signal" ? (
                  <SparklesIcon size={18} />
                ) : (
                  <ClipboardListIcon size={18} />
                )}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-surface-subtle px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-text-secondary">
                    {doc.badge}
                  </span>
                  <h2 className="text-[15px] font-semibold text-text-primary group-hover:text-brand-purple">
                    {doc.title}
                  </h2>
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-text-secondary">
                  {doc.subtitle}
                </p>
              </div>
            </div>
            <span className="text-text-tertiary group-hover:text-brand-purple">
              →
            </span>
          </Link>
        ))}
      </div>

      <p className="mt-8 text-[11px] text-text-tertiary">
        These docs are bundled with the prototype as static assets. The raw
        markdown files are at <code className="font-mono">/docs/*.md</code> if you
        need to download them.
      </p>
    </div>
  );
}

export function DocsViewerPage() {
  const { slug } = useParams<{ slug: string }>();
  const doc = DOCS.find((d) => d.slug === slug);
  const [html, setHtml] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!doc) return;
    let cancelled = false;
    setHtml("");
    setError("");
    fetch(doc.file)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((md) => {
        if (cancelled) return;
        const rendered = marked.parse(md, { async: false, gfm: true, breaks: false }) as string;
        setHtml(rendered);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load");
      });
    return () => {
      cancelled = true;
    };
  }, [doc]);

  if (!doc) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12 text-center text-[13px] text-text-secondary">
        Doc not found.{" "}
        <Link to="/docs" className="text-brand-purple hover:underline">
          Back to docs
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/docs"
          className="inline-flex items-center gap-1 text-[11px] text-text-tertiary hover:text-text-secondary"
        >
          <ArrowLeftIcon size={11} /> All docs
        </Link>
        <div className="flex items-center gap-2">
          <a
            href={doc.file}
            download
            className="text-[11px] font-medium text-text-tertiary hover:text-brand-purple"
          >
            Download .md
          </a>
        </div>
      </div>

      <div className="mt-3">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
            doc.slug === "signal"
              ? "bg-status-ok-soft text-status-ok"
              : doc.slug === "prd-grooming"
                ? "bg-status-warning-soft text-status-warning"
                : doc.slug === "icp"
                  ? "bg-dept-sales-soft text-dept-sales"
                  : doc.slug === "design"
                    ? "bg-dept-service-soft text-dept-service"
                    : "bg-brand-purple-soft text-brand-purple"
          }`}
        >
          {doc.badge}
        </span>
      </div>

      {error ? (
        <div className="mt-6 rounded-md border border-status-past/30 bg-status-past-soft px-3 py-2 text-[12px] text-status-past">
          Failed to load doc: {error}
        </div>
      ) : !html ? (
        <div className="mt-6 text-[12px] text-text-tertiary">Loading…</div>
      ) : (
        <article
          className="prose-doc mt-4"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </div>
  );
}
