import { useState } from 'react'
import { Upload, FileText, Loader2, Quote } from 'lucide-react'
import { uploadServiceDoc } from '../api/mockApi'
import { ConfidenceChip } from '../components/ConfidenceChip'
import { PageHeader } from '../components/Layout'
import type { ServiceConfig as SC } from '../types'

export function ServiceConfig({
  config,
  onChange,
}: {
  config: SC
  onChange: (next: SC) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [stage, setStage] = useState<string>('')
  const [pct, setPct] = useState(0)

  const onUpload = async () => {
    setUploading(true)
    setStage('chunking')
    setPct(0)
    const result = await uploadServiceDoc(null, (p) => {
      setStage(p.stage)
      setPct(p.pct)
    })
    onChange(result)
    setUploading(false)
  }

  return (
    <div className="space-y-5 max-w-[1000px]">
      <PageHeader
        title="Service Scheduler Configuration"
        subtitle="P0 · Upload your service policy doc — we extract the 7 config fields with citations back to the source."
      />

      {!config.parsed && !uploading && (
        <section className="rounded-xl border-2 border-dashed border-spyne-violet/30 bg-violet-50/30 p-10 text-center">
          <Upload className="mx-auto text-spyne-violet" size={28} />
          <h2 className="mt-2 text-[15px] font-semibold text-spyne-ink">Upload service policy document</h2>
          <p className="text-[12px] text-spyne-mute mt-1 max-w-[480px] mx-auto">
            PDF, DOCX, or CSV up to 25 MB. We chunk, embed, and run a retrieval pass per field with Claude Sonnet.
          </p>
          <button
            type="button"
            onClick={onUpload}
            className="mt-4 px-5 py-2 rounded-md bg-spyne-violet hover:bg-spyne-violetDark text-white text-sm font-semibold"
          >
            Choose file…
          </button>
        </section>
      )}

      {uploading && (
        <section className="rounded-xl border border-spyne-line bg-white p-6 shadow-card">
          <div className="flex items-center gap-2 text-[13px] text-spyne-ink">
            <Loader2 className="animate-spin text-spyne-violet" size={14} />
            <span>Stage: <strong>{stage}</strong></span>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-spyne-paper overflow-hidden">
            <div
              className="h-full bg-spyne-violet transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-2 text-[11px] text-spyne-mute">{pct}%</div>
        </section>
      )}

      {config.parsed && (
        <section className="space-y-4">
          <div className="rounded-xl border border-spyne-line bg-white p-4 shadow-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="text-spyne-violet" size={18} />
              <div>
                <div className="text-[13px] font-semibold text-spyne-ink">{config.doc_filename}</div>
                <div className="text-[11px] text-spyne-mute">{config.doc_pages} pages parsed</div>
              </div>
            </div>
            <button
              type="button"
              onClick={onUpload}
              className="text-[12px] font-semibold text-spyne-violet hover:underline"
            >
              Re-upload
            </button>
          </div>

          <div className="rounded-xl border border-spyne-line bg-white shadow-card overflow-hidden">
            <table className="w-full">
              <thead className="bg-spyne-paper text-[11px] uppercase tracking-wide text-spyne-mute">
                <tr>
                  <th className="text-left px-4 py-2 font-semibold">Field</th>
                  <th className="text-left px-4 py-2 font-semibold">Extracted value</th>
                  <th className="text-left px-4 py-2 font-semibold">Confidence</th>
                  <th className="text-left px-4 py-2 font-semibold">Citation</th>
                </tr>
              </thead>
              <tbody>
                {config.fields.map((f) => (
                  <tr key={f.key} className="border-t border-spyne-line align-top">
                    <td className="px-4 py-3 text-[12.5px] font-semibold text-spyne-ink w-44">{f.label}</td>
                    <td className="px-4 py-3 text-[12.5px] text-spyne-ink max-w-[420px]">{f.value ?? <span className="text-spyne-mute">—</span>}</td>
                    <td className="px-4 py-3"><ConfidenceChip confidence={f.confidence} source="llm" /></td>
                    <td className="px-4 py-3 text-[12px] text-spyne-mute">
                      {f.citation ? (
                        <div className="flex items-start gap-1.5">
                          <Quote size={11} className="mt-1 text-spyne-mute" />
                          <span title={f.citation.quote} className="line-clamp-2 max-w-[260px]">
                            p.{f.citation.page} · "{f.citation.quote}"
                          </span>
                        </div>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
