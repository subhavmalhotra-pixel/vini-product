import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ExternalLink, FileText, Loader2, X } from 'lucide-react'

interface DocEntry {
  id: string
  title: string
  path: string
}

interface Manifest {
  generated_at: string
  docs: DocEntry[]
}

export function DocsPanel({ onClose }: { onClose: () => void }) {
  const [manifest, setManifest] = useState<Manifest | null>(null)
  const [activeId, setActiveId] = useState<string>('signal')
  const [contentById, setContentById] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Bootstrap — fetch manifest + both docs in parallel
  useEffect(() => {
    let abort = false
    setLoading(true)
    fetch('/docs/manifest.json', { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error(`manifest ${r.status}`)
        return r.json() as Promise<Manifest>
      })
      .then(async (m) => {
        if (abort) return
        setManifest(m)
        const fetched = await Promise.all(
          m.docs.map(async (d) => {
            const res = await fetch(d.path, { cache: 'no-store' })
            const text = res.ok ? await res.text() : `_Failed to load ${d.path} (${res.status})._`
            return [d.id, text] as const
          }),
        )
        if (abort) return
        setContentById(Object.fromEntries(fetched))
        setLoading(false)
      })
      .catch((e) => {
        if (abort) return
        setError(String(e))
        setLoading(false)
      })
    return () => {
      abort = true
    }
  }, [])

  // Close on Esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const activeDoc = manifest?.docs.find((d) => d.id === activeId)
  const md = activeDoc ? contentById[activeDoc.id] ?? '' : ''

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-end">
      <aside
        role="dialog"
        aria-label="Project docs"
        className="bg-white w-[min(960px,92vw)] h-full flex flex-col shadow-2xl animate-[slideIn_180ms_ease-out]"
      >
        <header className="flex items-center justify-between px-5 py-3 border-b border-spyne-line">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-spyne-violet" />
            <h2 className="text-[14px] font-semibold text-spyne-ink">Project docs</h2>
            {manifest?.generated_at && (
              <span className="text-[10px] text-spyne-mute" title={manifest.generated_at}>
                synced {new Date(manifest.generated_at).toLocaleString()}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1.5 text-spyne-mute hover:bg-spyne-paper hover:text-spyne-ink"
          >
            <X size={16} />
          </button>
        </header>

        <nav className="px-5 pt-3 flex items-center gap-1 border-b border-spyne-line">
          {manifest?.docs.map((d) => {
            const active = d.id === activeId
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setActiveId(d.id)}
                className={[
                  'px-3 py-2 -mb-px border-b-2 text-[13px] font-semibold transition',
                  active
                    ? 'border-spyne-violet text-spyne-violet'
                    : 'border-transparent text-spyne-mute hover:text-spyne-ink',
                ].join(' ')}
              >
                {d.title}
              </button>
            )
          })}

          {activeDoc && (
            <a
              href={activeDoc.path}
              target="_blank"
              rel="noreferrer"
              className="ml-auto inline-flex items-center gap-1 text-[12px] text-spyne-mute hover:text-spyne-ink py-2"
              title="Open raw .md in a new tab"
            >
              raw .md <ExternalLink size={11} />
            </a>
          )}
        </nav>

        <div className="flex-1 overflow-y-auto px-7 py-6">
          {loading ? (
            <div className="flex items-center gap-2 text-spyne-mute text-[13px]">
              <Loader2 className="animate-spin" size={14} /> Loading docs…
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-[13px] text-red-700">
              Failed to load docs: {error}
            </div>
          ) : (
            <article className="markdown-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
            </article>
          )}
        </div>
      </aside>
    </div>
  )
}
