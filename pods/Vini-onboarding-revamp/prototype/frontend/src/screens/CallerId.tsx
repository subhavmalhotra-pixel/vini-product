import { useEffect, useState } from 'react'
import { AlertTriangle, Pencil, ShieldCheck, UserCircle2 } from 'lucide-react'
import { fetchCnam } from '../api/mockApi'
import { AutoFillField, SourceChip } from '../components/ConfidenceChip'
import { PageHeader } from '../components/Layout'
import type { CnamProfile, CnamRep, Scenario, Tracked } from '../types'

const empty = (): Tracked => ({ value: null, confidence: 'none', source: null })

export function CallerId({
  scenario,
  data,
  onChange,
}: {
  scenario: Scenario
  data: { profile: CnamProfile | null; reps: CnamRep[] } | null
  onChange: (next: { profile: CnamProfile; reps: CnamRep[] }) => void
}) {
  const [loading, setLoading] = useState(false)
  const [editingRep, setEditingRep] = useState<number | null>(null)

  useEffect(() => {
    let abort = false
    if (!data) {
      setLoading(true)
      fetchCnam(scenario.id).then((res) => {
        if (!abort) {
          onChange(res)
          setLoading(false)
        }
      })
    }
    return () => {
      abort = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario.id])

  const profile = data?.profile
  const reps = data?.reps ?? []
  const einMismatch = profile?.ein_matches_contract === false

  const setProfile = (path: keyof CnamProfile) => (v: string) => {
    if (!profile) return
    const next: CnamProfile = { ...profile, [path]: { ...(profile[path] as Tracked), value: v } }
    onChange({ profile: next, reps })
  }

  const updateRep = (idx: number, field: keyof CnamRep, v: string) => {
    if (!profile) return
    const nextReps = reps.map((r, i) => {
      if (i !== idx) return r
      const leaf = r[field] as Tracked
      return { ...r, [field]: { ...leaf, value: v } }
    })
    onChange({ profile, reps: nextReps })
  }

  return (
    <div className="space-y-5 max-w-[920px]">
      <PageHeader
        title="Caller ID (CNAM)"
        subtitle="Auto-filled from public business registry (by rooftop address) + multi-source Authorized Reps."
      />

      {loading && (
        <div className="rounded-xl border border-dashed border-spyne-line bg-white p-6 text-center text-[13px] text-spyne-mute">
          Looking up business registry…
        </div>
      )}

      {einMismatch && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 flex items-start gap-3">
          <AlertTriangle className="text-red-600 shrink-0" size={18} />
          <div>
            <h3 className="text-[13px] font-semibold text-red-800">EIN doesn't match contract</h3>
            <p className="text-[12px] text-red-700 mt-1">
              The EIN from the public registry ({profile?.ein.value}) doesn't match the one in the dealer's signed contract.
              Confirm the legal entity before submitting to TCR.
            </p>
          </div>
        </div>
      )}

      {profile && (
        <section className="rounded-xl border border-spyne-line bg-white p-5 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="text-spyne-violet" size={16} />
            <h2 className="text-[14px] font-semibold text-spyne-ink">Profile + Business</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-3">
            <AutoFillField label="Legal Business Name"     tracked={profile.legal_business_name}     onChange={setProfile('legal_business_name')}     required />
            <AutoFillField label="Caller ID Display Name"  tracked={profile.caller_id_display_name}  onChange={setProfile('caller_id_display_name')}  required />
            <AutoFillField label="Business Type"           tracked={profile.business_type}           onChange={setProfile('business_type')}           required />
            <AutoFillField label="Business Industry"       tracked={profile.business_industry}       onChange={setProfile('business_industry')}       required />
            <AutoFillField label="EIN"                     tracked={profile.ein}                     onChange={setProfile('ein')}                     required />
          </div>
        </section>
      )}

      {/* Authorized Reps — inline-editable */}
      <section className="rounded-xl border border-spyne-line bg-white p-5 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <UserCircle2 className="text-spyne-violet" size={16} />
            <h2 className="text-[14px] font-semibold text-spyne-ink">Authorized Representatives</h2>
          </div>
          <span className="text-[11px] text-spyne-mute">
            Sourced from: contract → meet invite → employee directory
          </span>
        </div>

        {reps.length === 0 && (
          <div className="rounded-lg border border-dashed border-spyne-line p-4 text-[12px] text-spyne-mute">
            No reps could be auto-suggested. Fill manually below.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1].map((idx) => {
            const rep = reps[idx]
            const isEditing = editingRep === idx
            return (
              <article
                key={idx}
                className={[
                  'rounded-lg border p-4',
                  rep ? 'border-spyne-line bg-white' : 'border-dashed border-spyne-line bg-spyne-paper/40',
                ].join(' ')}
              >
                <header className="flex items-center justify-between mb-3">
                  <div className="text-[12px] font-semibold text-spyne-mute uppercase">
                    Representative #{idx + 1}
                  </div>
                  <div className="flex items-center gap-2">
                    {rep && <SourceChip source={rep.source} />}
                    {rep && (
                      <button
                        type="button"
                        onClick={() => setEditingRep(isEditing ? null : idx)}
                        className={[
                          'inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold',
                          isEditing
                            ? 'bg-spyne-ink text-white'
                            : 'border border-spyne-line text-spyne-ink hover:bg-spyne-paper',
                        ].join(' ')}
                      >
                        <Pencil size={11} />
                        {isEditing ? 'Done' : 'Edit'}
                      </button>
                    )}
                  </div>
                </header>

                {!rep ? (
                  <div className="text-[12px] text-spyne-mute">
                    Empty slot — pick from directory or fill manually.
                  </div>
                ) : isEditing ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <AutoFillField label="First Name"  tracked={rep.first_name} onChange={(v) => updateRep(idx, 'first_name', v)} required />
                      <AutoFillField label="Last Name"   tracked={rep.last_name}  onChange={(v) => updateRep(idx, 'last_name',  v)} required />
                    </div>
                    <AutoFillField label="Title"    tracked={rep.title}    onChange={(v) => updateRep(idx, 'title',    v)} required />
                    <AutoFillField label="Phone"    tracked={rep.phone}    onChange={(v) => updateRep(idx, 'phone',    v)} required />
                    <AutoFillField label="Email"    tracked={rep.email}    onChange={(v) => updateRep(idx, 'email',    v)} required />
                    <AutoFillField label="Position" tracked={rep.position} onChange={(v) => updateRep(idx, 'position', v)} required />
                    <button
                      type="button"
                      className="text-[11px] font-semibold text-spyne-violet hover:underline"
                    >
                      Swap with another directory entry →
                    </button>
                  </div>
                ) : (
                  <dl className="space-y-1.5 text-[12.5px]">
                    <RepRow label="Name"     value={[rep.first_name.value, rep.last_name.value].filter(Boolean).join(' ') || '—'} />
                    <RepRow label="Title"    value={rep.title.value ?? '—'} />
                    <RepRow label="Phone"    value={rep.phone.value ?? '—'} />
                    <RepRow label="Email"    value={rep.email.value ?? '—'} />
                    <RepRow label="Position" value={rep.position.value ?? '—'} />
                  </dl>
                )}
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function RepRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <dt className="w-16 shrink-0 text-spyne-mute">{label}</dt>
      <dd className="text-spyne-ink font-medium truncate">{value}</dd>
    </div>
  )
}
