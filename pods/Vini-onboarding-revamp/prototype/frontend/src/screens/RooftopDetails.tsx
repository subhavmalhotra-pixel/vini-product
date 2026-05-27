import { useEffect, useMemo, useState } from 'react'
import { Globe2, RefreshCw, AlertTriangle, ChevronDown, ChevronRight, Plus, Loader2, X, RotateCcw } from 'lucide-react'
import { extractRooftopProfile, fetchDepartmentFromWebsite, type ExtractProgress } from '../api/mockApi'
import { AutoFillField, ConfidenceChip } from '../components/ConfidenceChip'
import { NeedsInputPanel, deriveNeedsInput } from '../components/NeedsInputPanel'
import { PageHeader } from '../components/Layout'
import type { Department, DepartmentName, DealershipProfile, Scenario, ScenarioId, Tracked } from '../types'

const emptyTracked = (): Tracked => ({ value: null, confidence: 'none', source: null })

const OPTIONAL_DEPTS: DepartmentName[] = ['Service', 'Parts', 'Finance']

export function RooftopDetails({
  scenario,
  profile,
  onProfileChange,
  onContinue,
  areaCode,
  onAreaCodeChange,
}: {
  scenario: Scenario
  profile: DealershipProfile | null
  onProfileChange: (next: DealershipProfile) => void
  onContinue: () => void
  areaCode: string
  onAreaCodeChange: (v: string) => void
}) {
  const [url, setUrl] = useState(scenario.dealerWebsite)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<ExtractProgress | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // "Same as Sales" flags per optional department.
  const [sameAsSales, setSameAsSales] = useState<Record<DepartmentName, boolean>>({
    Sales: true,
    Service: true,
    Parts: true,
    Finance: true,
  })

  // Reset on scenario flip
  useEffect(() => {
    setUrl(scenario.dealerWebsite)
    setShowAdvanced(false)
    setSameAsSales({ Sales: true, Service: true, Parts: true, Finance: true })
  }, [scenario.id])

  const runScrape = async () => {
    setLoading(true)
    setProgress(null)
    const result = await extractRooftopProfile(scenario.id, setProgress)
    onProfileChange(result)
    setLoading(false)
    setProgress(null)
  }

  const robotsBlocked = profile?.robots_txt_allowed === false

  const updateField = (path: string, next: string) => {
    if (!profile) return
    const copy: any = JSON.parse(JSON.stringify(profile))
    const parts = path.split('.')
    let cur: any = copy
    for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]]
    const leaf: Tracked = cur[parts[parts.length - 1]] ?? emptyTracked()
    cur[parts[parts.length - 1]] = {
      value: next,
      confidence: leaf.confidence === 'none' && next ? 'medium' : leaf.confidence,
      source: leaf.source,
    }
    onProfileChange(copy)
  }

  const setField = (path: string) => (v: string) => updateField(path, v)

  const mustHaveFields = useMemo(() => {
    if (!profile) return []
    return [
      { key: 'rooftop_name',     label: 'Rooftop Name',  required: true, tracked: profile.rooftop_name,                       onChange: setField('rooftop_name') },
      { key: 'address.line1',    label: 'Address Line 1', required: true, tracked: profile.rooftop_address.line1,             onChange: setField('rooftop_address.line1') },
      { key: 'address.district', label: 'City',           required: true, tracked: profile.rooftop_address.district,          onChange: setField('rooftop_address.district') },
      { key: 'address.state',    label: 'State',          required: true, tracked: profile.rooftop_address.state_or_province, onChange: setField('rooftop_address.state_or_province') },
      { key: 'address.zip',      label: 'Zip',            required: true, tracked: profile.rooftop_address.zipcode,           onChange: setField('rooftop_address.zipcode') },
      { key: 'address.country',  label: 'Country',        required: true, tracked: profile.rooftop_address.country,           onChange: setField('rooftop_address.country') },
      { key: 'rooftop_timezone', label: 'Timezone',       required: true, tracked: profile.rooftop_timezone,                  onChange: setField('rooftop_timezone') },
    ]
  }, [profile])

  const needsInput = deriveNeedsInput(mustHaveFields)
  const canContinue = !!profile && needsInput.length === 0 && !robotsBlocked && !loading

  // ------------------ Optional dept helpers ------------------
  const salesDept = profile?.departments.find((d) => d.name === 'Sales') ?? null
  const getDept = (name: DepartmentName) => profile?.departments.find((d) => d.name === name)

  const addOrRemoveDept = (name: DepartmentName, on: boolean) => {
    if (!profile) return
    const next: DealershipProfile = JSON.parse(JSON.stringify(profile))
    if (on) {
      if (!next.departments.some((d) => d.name === name)) {
        // Default to "Same as Sales" — inherit phone/hours/confidence from Sales
        const inherit = salesDept
          ? { ...salesDept, name, confidence: 'high' as const, source: 'schema_org' as const }
          : { name, phone: emptyTracked(), address: null, working_hours: [], confidence: 'none' as const, source: null }
        next.departments.push(inherit as Department)
        setSameAsSales((s) => ({ ...s, [name]: true }))
      }
    } else {
      next.departments = next.departments.filter((d) => d.name !== name)
    }
    onProfileChange(next)
  }

  const toggleSameAsSales = (name: DepartmentName, same: boolean) => {
    setSameAsSales((s) => ({ ...s, [name]: same }))
    if (!profile || !salesDept) return
    const next: DealershipProfile = JSON.parse(JSON.stringify(profile))
    const idx = next.departments.findIndex((d) => d.name === name)
    if (idx < 0) return
    if (same) {
      next.departments[idx] = { ...salesDept, name, confidence: 'high', source: 'schema_org' }
    } else {
      // unchecking: clear the values so user can fill manually (or re-scan)
      next.departments[idx] = {
        name,
        phone: emptyTracked(),
        address: null,
        working_hours: [],
        confidence: 'none',
        source: null,
      }
    }
    onProfileChange(next)
  }

  const rescanDept = async (name: DepartmentName) => {
    if (!profile) return
    const dept = await fetchDepartmentFromWebsite(scenario.id as ScenarioId, name)
    const next: DealershipProfile = JSON.parse(JSON.stringify(profile))
    const idx = next.departments.findIndex((d) => d.name === name)
    if (idx >= 0) next.departments[idx] = dept
    else next.departments.push(dept)
    onProfileChange(next)
    setSameAsSales((s) => ({ ...s, [name]: false }))
  }

  const updateDeptPhone = (name: DepartmentName, v: string) => {
    if (!profile) return
    const next: DealershipProfile = JSON.parse(JSON.stringify(profile))
    const idx = next.departments.findIndex((d) => d.name === name)
    if (idx < 0) return
    next.departments[idx].phone = {
      value: v,
      confidence: next.departments[idx].phone.confidence === 'none' && v ? 'medium' : next.departments[idx].phone.confidence,
      source: next.departments[idx].phone.source,
    }
    onProfileChange(next)
  }

  // ------------------ Render ------------------
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-6">
      <div className="space-y-5">
        <PageHeader
          title="Rooftop Details"
          subtitle="Paste the dealership website — we'll fill in everything we can find."
        />

        {/* URL paste */}
        <div className="rounded-xl border border-spyne-line bg-white p-4 shadow-card">
          <label className="text-[12px] font-medium text-spyne-mute">Dealership website</label>
          <div className="mt-1 flex gap-2">
            <div className="flex-1 flex items-center rounded-md border border-spyne-line bg-spyne-paper px-3 focus-within:border-spyne-violet">
              <Globe2 size={16} className="text-spyne-mute" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example-dealer.com"
                className="w-full bg-transparent px-2 py-2 text-sm focus:outline-none"
                disabled={loading}
              />
            </div>
            <button
              type="button"
              onClick={runScrape}
              disabled={loading || !url}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-spyne-violet hover:bg-spyne-violetDark text-white text-sm font-semibold disabled:bg-spyne-violet/40"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              {loading ? 'Reading…' : profile ? 'Re-scan' : 'Scan website'}
            </button>
          </div>

          {progress && (
            <div className="mt-3 text-[12px] text-spyne-mute flex items-center gap-2">
              <Loader2 size={12} className="animate-spin text-spyne-violet" />
              <span>{progress.message} ({progress.pages_done}/{progress.pages_total} pages)</span>
            </div>
          )}

          {profile && !loading && !robotsBlocked && (
            <div className="mt-3 flex items-center gap-2 text-[12px] text-spyne-mute">
              <span>Crawled:</span>
              {profile.pages_visited.map((p) => (
                <code key={p} className="rounded bg-spyne-paper px-1.5 py-0.5 text-[11px]">{p}</code>
              ))}
              <span className="ml-auto">Path: <strong className="text-spyne-ink">{profile.extraction_path}</strong></span>
            </div>
          )}
        </div>

        {/* Robots-blocked banner */}
        {robotsBlocked && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 flex items-start gap-3">
            <AlertTriangle className="text-amber-600 shrink-0" size={18} />
            <div>
              <h3 className="text-[13px] font-semibold text-amber-800">Crawl blocked by robots.txt</h3>
              <p className="text-[12px] text-amber-700 mt-1">
                This dealer's site disallows automated crawling for our user-agent. Please fill in
                the Rooftop fields manually.
              </p>
            </div>
          </div>
        )}

        {/* Dealership details */}
        {profile && (
          <section className="rounded-xl border border-spyne-line bg-white p-5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[14px] font-semibold text-spyne-ink">Dealership Details</h2>
              {!robotsBlocked && (
                <span className="text-[11px] text-spyne-mute">9 Must-have · 7 Good-to-have (collapsed)</span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-3">
              <AutoFillField label="Rooftop Name"   tracked={profile.rooftop_name}                       onChange={setField('rooftop_name')}                       required />
              <AutoFillField label="Website"        tracked={profile.website}                            onChange={setField('website')} />
              <AutoFillField label="Address Line 1" tracked={profile.rooftop_address.line1}             onChange={setField('rooftop_address.line1')}             required />
              <AutoFillField label="Address Line 2" tracked={profile.rooftop_address.line2}             onChange={setField('rooftop_address.line2')} />
              <AutoFillField label="City"           tracked={profile.rooftop_address.district}          onChange={setField('rooftop_address.district')}          required />
              <AutoFillField label="State"          tracked={profile.rooftop_address.state_or_province} onChange={setField('rooftop_address.state_or_province')} required />
              <AutoFillField label="Zip"            tracked={profile.rooftop_address.zipcode}           onChange={setField('rooftop_address.zipcode')}           required />
              <AutoFillField label="Country"        tracked={profile.rooftop_address.country}           onChange={setField('rooftop_address.country')}           required />
              <AutoFillField label="Timezone"       tracked={profile.rooftop_timezone}                  onChange={setField('rooftop_timezone')}                  required />
              <AutoFillField label="Vehicle Type"   tracked={{ value: profile.vehicle_types.join(', ') || null, confidence: profile.vehicle_types.length ? 'high' : 'none', source: 'schema_org' }} onChange={() => {}} required />
            </div>

            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className="mt-4 inline-flex items-center gap-1 text-[12px] font-semibold text-spyne-violet hover:underline"
            >
              {showAdvanced ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              {showAdvanced ? 'Hide advanced' : 'Show advanced (7 Good-to-have fields)'}
            </button>
            {showAdvanced && (
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-3 border-t border-dashed border-spyne-line pt-4">
                <AutoFillField label="Admin Name"     tracked={profile.admin_name}     onChange={setField('admin_name')} />
                <AutoFillField label="Admin Email"    tracked={profile.admin_email}    onChange={setField('admin_email')} />
                <AutoFillField label="Admin Phone"    tracked={profile.admin_phone}    onChange={setField('admin_phone')} />
                <AutoFillField label="Dealer Type"    tracked={profile.dealer_type}    onChange={setField('dealer_type')} />
                <AutoFillField label="Dealer Subtype" tracked={profile.dealer_sub_type} onChange={setField('dealer_sub_type')} />
                <AutoFillField label="Region"         tracked={profile.region}         onChange={setField('region')} />
              </div>
            )}
          </section>
        )}

        {/* Sales Department (+ Preferred Area Code, moved from Agent Customization) */}
        {profile && salesDept && (
          <section className="rounded-xl border border-spyne-line bg-white p-5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[14px] font-semibold text-spyne-ink">Sales Department</h2>
              <ConfidenceChip confidence={salesDept.confidence} source={salesDept.source} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-3">
              <AutoFillField label="Phone Number" tracked={salesDept.phone} onChange={() => {}} required />
              <div>
                <label className="text-[12px] font-medium text-spyne-mute">
                  Preferred Area Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={areaCode}
                  onChange={(e) => onAreaCodeChange(e.target.value)}
                  placeholder="e.g. 201"
                  className="mt-1 w-full rounded-md border border-spyne-line bg-white px-3 py-2 text-sm focus:outline-none focus:border-spyne-violet"
                />
                <p className="text-[10.5px] text-spyne-mute mt-1">Derived from rooftop city + state.</p>
              </div>
            </div>
            <DeptHoursTable hours={salesDept.working_hours} />
          </section>
        )}

        {/* Optional Departments */}
        {profile && (
          <section className="rounded-xl border border-spyne-line bg-white p-5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[14px] font-semibold text-spyne-ink">Optional Departments</h2>
              <span className="text-[11px] text-spyne-mute">Click to add — defaults to "Same as Sales."</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {OPTIONAL_DEPTS.map((d) => {
                const present = !!getDept(d)
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => addOrRemoveDept(d, !present)}
                    className={[
                      'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition',
                      present
                        ? 'bg-violet-50 border-violet-200 text-spyne-violet'
                        : 'bg-white border-spyne-line text-spyne-ink hover:bg-spyne-paper',
                    ].join(' ')}
                  >
                    {present ? <X size={12} /> : <Plus size={12} />}
                    {present ? `Remove ${d}` : `Add ${d} dept`}
                  </button>
                )
              })}
            </div>

            <div className="mt-4 space-y-4">
              {OPTIONAL_DEPTS.map((name) => {
                const dept = getDept(name)
                if (!dept) return null
                const same = sameAsSales[name]
                return (
                  <article key={name} className="rounded-lg border border-spyne-line p-4">
                    <header className="flex items-center justify-between mb-3">
                      <h3 className="text-[13px] font-semibold text-spyne-ink">{name} Department</h3>
                      <button
                        type="button"
                        onClick={() => addOrRemoveDept(name, false)}
                        className="text-[11px] text-spyne-mute hover:text-red-600 inline-flex items-center gap-1"
                      >
                        <X size={11} /> Remove
                      </button>
                    </header>

                    <label className="flex items-center gap-2 text-[12.5px] font-medium text-spyne-ink select-none cursor-pointer">
                      <input
                        type="checkbox"
                        checked={same}
                        onChange={(e) => toggleSameAsSales(name, e.target.checked)}
                        className="rounded border-spyne-line text-spyne-violet focus:ring-spyne-violet"
                      />
                      Same as Sales department
                    </label>

                    {same ? (
                      <div className="mt-3 rounded-md bg-spyne-paper px-3 py-2 text-[12px] text-spyne-mute">
                        Phone, address, and working hours inherited from Sales.
                      </div>
                    ) : (
                      <div className="mt-3 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <AutoFillField
                            label="Phone Number"
                            tracked={dept.phone}
                            onChange={(v) => updateDeptPhone(name, v)}
                            required
                          />
                          <div className="flex items-end">
                            <button
                              type="button"
                              onClick={() => rescanDept(name)}
                              className="inline-flex items-center gap-1.5 rounded-md border border-spyne-line bg-white px-3 py-2 text-[12px] font-semibold text-spyne-ink hover:bg-spyne-paper"
                            >
                              <RotateCcw size={12} /> Re-scan from website
                            </button>
                          </div>
                        </div>

                        {dept.working_hours.length > 0 && <DeptHoursTable hours={dept.working_hours} />}
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          </section>
        )}
      </div>

      <div className="space-y-4">
        {profile && (
          <NeedsInputPanel
            items={needsInput}
            onConfirmAll={canContinue ? onContinue : undefined}
          />
        )}
        {!profile && !loading && (
          <div className="rounded-xl border border-dashed border-spyne-line bg-white p-4 text-[12px] text-spyne-mute">
            Scan the dealer's website to begin. Schema.org markup is parsed first; Claude Sonnet runs only on pages missing schema.
          </div>
        )}
      </div>
    </div>
  )
}

function DeptHoursTable({ hours }: { hours: Department['working_hours'] }) {
  if (!hours.length) return null
  return (
    <div className="mt-3 rounded-lg border border-spyne-line">
      <table className="w-full text-[12px]">
        <tbody>
          {hours.map((row) => (
            <tr key={row.day_of_week} className="border-b border-spyne-line last:border-0">
              <td className="px-3 py-2 text-spyne-mute font-medium w-32">{row.day_of_week}</td>
              <td className="px-3 py-2">{row.opens} – {row.closes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
