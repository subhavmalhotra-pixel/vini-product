import { useState } from 'react'
import { X, PhoneIncoming, PhoneOutgoing, Play, Moon, ChevronDown, ChevronUp, CalendarCheck } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { Lead, CallLogEntry, LeadAction } from '../types'
import Badge from './Badge'

interface LeadDrawerProps {
  lead: Lead | null
  onClose: () => void
}

const ACTION_CONFIG: Record<
  LeadAction | 'no_answer',
  { label: string; variant: 'green' | 'yellow' | 'gray' | 'blue' | 'violet' | 'red' }
> = {
  appointment_set: { label: 'Appt Set', variant: 'green' },
  callback_left: { label: 'Callback', variant: 'yellow' },
  no_answer: { label: 'No Answer', variant: 'gray' },
  demoed: { label: "Demo'd", variant: 'blue' },
  closed: { label: 'Closed', variant: 'violet' },
}

function formatDuration(sec: number): string {
  if (sec === 0) return 'No answer'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

// Waveform mock — deterministic heights based on index
const WAVEFORM_HEIGHTS = [4, 8, 12, 6, 16, 10, 14, 8, 18, 12, 6, 14, 10, 16, 8, 12, 18, 6, 10, 14, 8, 16, 12, 4, 10, 14, 6, 18, 8, 12]

function CallLogItem({ entry }: { entry: CallLogEntry }) {
  const ts = format(parseISO(entry.timestamp), 'MMM d, yyyy · h:mm a')
  const outcome = ACTION_CONFIG[entry.outcome] ?? ACTION_CONFIG['no_answer']

  return (
    <div className="flex gap-3">
      {/* Timeline dot */}
      <div className="flex flex-col items-center">
        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
          {entry.direction === 'inbound' ? (
            <PhoneIncoming className="w-3.5 h-3.5 text-orange-500" />
          ) : (
            <PhoneOutgoing className="w-3.5 h-3.5 text-slate-400" />
          )}
        </div>
        <div className="w-px flex-1 bg-slate-100 mt-1" />
      </div>

      {/* Content */}
      <div className="pb-5 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap mb-1.5">
          <span className="text-xs text-slate-400">{ts}</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                entry.direction === 'inbound'
                  ? 'bg-orange-50 text-orange-600'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {entry.direction === 'inbound' ? 'Inbound' : 'Outbound'}
            </span>
            {entry.timeOfDay === 'after_hours' && (
              <span className="bg-amber-50 text-amber-700 text-xs font-medium px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <Moon className="w-2.5 h-2.5" />
                After Hours
              </span>
            )}
            <Badge variant={outcome.variant as 'green' | 'yellow' | 'gray' | 'blue' | 'violet' | 'red'}>
              {outcome.label}
            </Badge>
          </div>
        </div>
        <p className="text-xs font-medium text-slate-600 mb-1">
          {formatDuration(entry.durationSec)}
        </p>
        {entry.snippet && (
          <p className="text-xs text-slate-500 leading-relaxed">{entry.snippet}</p>
        )}
      </div>
    </div>
  )
}

export default function LeadDrawer({ lead, onClose }: LeadDrawerProps) {
  const [transcriptExpanded, setTranscriptExpanded] = useState(false)
  const isOpen = lead !== null

  const transcriptLines = lead?.transcript ? lead.transcript.split('\n') : []
  const previewLines = transcriptLines.slice(0, 4)
  const hasMore = transcriptLines.length > 4

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[480px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {lead && (
          <>
            {/* Header */}
            <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-semibold text-slate-900">{lead.name}</h2>
                  <Badge variant={ACTION_CONFIG[lead.lastAction].variant as 'green' | 'yellow' | 'gray' | 'blue' | 'violet'}>
                    {ACTION_CONFIG[lead.lastAction].label}
                  </Badge>
                </div>
                <p className="text-sm text-slate-500">{lead.vehicleInterest}</p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0 ml-3"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">
              {/* Contact & Appointment */}
              <section className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Phone:</span>
                  <span className="text-sm font-medium text-slate-800">{lead.phone}</span>
                </div>
                {lead.appointmentAt && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 flex items-start gap-2.5">
                    <CalendarCheck className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-0.5">
                        Appointment Scheduled
                      </p>
                      <p className="text-sm text-emerald-800 font-medium">
                        {format(parseISO(lead.appointmentAt), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                )}
              </section>

              {/* Call Timeline */}
              <section>
                <h3 className="text-sm font-semibold text-slate-700 mb-4">
                  Outreach Timeline ({lead.attempts} attempt{lead.attempts !== 1 ? 's' : ''})
                </h3>
                <div className="flex flex-col">
                  {lead.callLog.map((entry, idx) => (
                    <div key={entry.id} className={idx === lead.callLog.length - 1 ? '[&_.flex-1.bg-slate-100]:hidden' : ''}>
                      <CallLogItem entry={entry} />
                    </div>
                  ))}
                </div>
              </section>

              {/* Audio Player Mock */}
              {lead.recordingDurationSec != null && lead.recordingDurationSec > 0 && (
                <section>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Latest Recording</h3>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3">
                    <button className="w-9 h-9 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0 transition-colors">
                      <Play className="w-4 h-4 text-white ml-0.5" />
                    </button>
                    <div className="flex-1 flex items-center gap-0.5 h-8">
                      {WAVEFORM_HEIGHTS.map((h, i) => (
                        <div
                          key={i}
                          className={`rounded-full flex-shrink-0 w-1 ${
                            i % 3 === 0 ? 'bg-orange-400' : 'bg-orange-200'
                          }`}
                          style={{ height: `${h}px` }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-slate-500 font-medium flex-shrink-0">
                      {formatDuration(lead.recordingDurationSec)}
                    </span>
                  </div>
                </section>
              )}

              {/* Transcript */}
              {lead.transcript && (
                <section>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Transcript</h3>
                  <div className="bg-slate-50 rounded-lg p-3 text-xs font-mono text-slate-600 leading-relaxed border border-slate-100">
                    {(transcriptExpanded ? transcriptLines : previewLines).map((line, i) => (
                      <p key={i} className={line === '' ? 'mb-1' : 'mb-0.5'}>
                        {line || ' '}
                      </p>
                    ))}
                  </div>
                  {hasMore && (
                    <button
                      onClick={() => setTranscriptExpanded(!transcriptExpanded)}
                      className="mt-2 flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-medium transition-colors"
                    >
                      {transcriptExpanded ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" />
                          Show less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" />
                          Show full transcript ({transcriptLines.length} lines)
                        </>
                      )}
                    </button>
                  )}
                </section>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}
