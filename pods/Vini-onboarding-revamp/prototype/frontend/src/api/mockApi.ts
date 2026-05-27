// mockApi.ts — single seam an engineer replaces with a real backend.
// All screens call ONLY through these functions; nothing imports from
// `data/mockData` directly outside of this module + the scenario picker.

import {
  CNAM_PROFILES,
  CNAM_REPS,
  GO_LIVE_PROBES,
  INTEGRATIONS,
  PERSONAS,
  ROOFTOP_PROFILES,
  SCENARIOS,
  SERVICE_CONFIG_PARSED,
  SERVICE_CONFIG_TEMPLATE,
} from '../data/mockData'
import type {
  CnamProfile,
  CnamRep,
  DealershipProfile,
  Department,
  DepartmentName,
  GoLiveProbe,
  IntegrationEntry,
  Persona,
  Scenario,
  ScenarioId,
  ServiceConfig,
} from '../types'

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

const cloneDeep = <T,>(x: T): T => JSON.parse(JSON.stringify(x))

// --------------------------------------------------------------------------
// Scenarios
// --------------------------------------------------------------------------

export async function listScenarios(): Promise<Scenario[]> {
  return SCENARIOS
}

// --------------------------------------------------------------------------
// Wedge #1 — dealer-website extraction (§4.1)
// Engineers: replace this with POST /api/onboarding/scrape  { url }
// --------------------------------------------------------------------------

export interface ExtractProgress {
  step: 'fetching' | 'parsing' | 'extracting' | 'done'
  message: string
  pages_done: number
  pages_total: number
}

export async function extractRooftopProfile(
  scenarioId: ScenarioId,
  onProgress?: (p: ExtractProgress) => void,
): Promise<DealershipProfile> {
  const profile = ROOFTOP_PROFILES[scenarioId]

  // Simulated crawl phases (PRD §4.1 progress affordance).
  if (onProgress) {
    onProgress({ step: 'fetching', message: 'Reading dealer website…',         pages_done: 0, pages_total: 3 })
    await wait(700)
    onProgress({ step: 'fetching', message: 'Reading dealer website…',         pages_done: 1, pages_total: 3 })
    await wait(550)
    onProgress({ step: 'fetching', message: 'Reading dealer website…',         pages_done: 2, pages_total: 3 })
    await wait(550)
    onProgress({ step: 'parsing',  message: 'Parsing Schema.org markup…',      pages_done: 3, pages_total: 3 })
    await wait(450)
    if (profile.extraction_path === 'llm' || profile.extraction_path === 'hybrid') {
      onProgress({ step: 'extracting', message: 'Extracting fields with Claude Sonnet…', pages_done: 3, pages_total: 3 })
      await wait(900)
    }
    onProgress({ step: 'done', message: 'Done.', pages_done: 3, pages_total: 3 })
  } else {
    await wait(1200)
  }

  return cloneDeep(profile)
}

// --------------------------------------------------------------------------
// Per-department re-scan from the dealer website (§4.1 — optional depts)
// Returns a Department object the screen merges into rooftop_profile.departments.
// --------------------------------------------------------------------------

const DEPT_HOURS: Record<DepartmentName, Department['working_hours']> = {
  Sales: [],
  Service: [
    { day_of_week: 'Monday',    opens: '07:30', closes: '18:00' },
    { day_of_week: 'Tuesday',   opens: '07:30', closes: '18:00' },
    { day_of_week: 'Wednesday', opens: '07:30', closes: '18:00' },
    { day_of_week: 'Thursday',  opens: '07:30', closes: '18:00' },
    { day_of_week: 'Friday',    opens: '07:30', closes: '18:00' },
    { day_of_week: 'Saturday',  opens: '08:00', closes: '16:00' },
    { day_of_week: 'Sunday',    opens: 'Closed', closes: 'Closed' },
  ],
  Parts: [
    { day_of_week: 'Monday',    opens: '07:30', closes: '18:00' },
    { day_of_week: 'Tuesday',   opens: '07:30', closes: '18:00' },
    { day_of_week: 'Wednesday', opens: '07:30', closes: '18:00' },
    { day_of_week: 'Thursday',  opens: '07:30', closes: '18:00' },
    { day_of_week: 'Friday',    opens: '07:30', closes: '18:00' },
    { day_of_week: 'Saturday',  opens: 'Closed', closes: 'Closed' },
    { day_of_week: 'Sunday',    opens: 'Closed', closes: 'Closed' },
  ],
  Finance: [
    { day_of_week: 'Monday',    opens: '09:00', closes: '20:00' },
    { day_of_week: 'Tuesday',   opens: '09:00', closes: '20:00' },
    { day_of_week: 'Wednesday', opens: '09:00', closes: '20:00' },
    { day_of_week: 'Thursday',  opens: '09:00', closes: '20:00' },
    { day_of_week: 'Friday',    opens: '09:00', closes: '20:00' },
    { day_of_week: 'Saturday',  opens: '09:00', closes: '18:00' },
    { day_of_week: 'Sunday',    opens: 'Closed', closes: 'Closed' },
  ],
}

const DEPT_PHONE: Record<string, Record<DepartmentName, string>> = {
  happy_path: {
    Sales:   '+1 (201) 555-0142',
    Service: '+1 (201) 555-0150',
    Parts:   '+1 (201) 555-0151',
    Finance: '+1 (201) 555-0152',
  },
  llm_fallback: {
    Sales:   '(410) 555-9300',
    Service: '(410) 555-9311',
    Parts:   '(410) 555-9312',
    Finance: '(410) 555-9313',
  },
  low_yield:     { Sales: '+1 (602) 555-7700', Service: '', Parts: '', Finance: '' },
  robots_blocked:{ Sales: '', Service: '', Parts: '', Finance: '' },
  ein_mismatch:  { Sales: '+1 (415) 555-0100', Service: '+1 (415) 555-0101', Parts: '+1 (415) 555-0102', Finance: '+1 (415) 555-0103' },
  service_agent: { Sales: '(410) 555-9300', Service: '(410) 555-9311', Parts: '(410) 555-9312', Finance: '(410) 555-9313' },
}

export async function fetchDepartmentFromWebsite(
  scenarioId: ScenarioId,
  name: DepartmentName,
): Promise<Department> {
  await wait(900)
  const phone = DEPT_PHONE[scenarioId]?.[name] ?? ''
  return {
    name,
    phone: phone
      ? { value: phone, confidence: 'high', source: 'schema_org' }
      : { value: null, confidence: 'none', source: null },
    address: null,
    working_hours: DEPT_HOURS[name],
    confidence: phone ? 'high' : 'medium',
    source: phone ? 'schema_org' : 'llm',
  }
}

// --------------------------------------------------------------------------
// Wedge #2 — CNAM registry lookup (§4.1 sub-step + §4.2 in PRD)
// --------------------------------------------------------------------------

export async function fetchCnam(scenarioId: ScenarioId): Promise<{
  profile: CnamProfile
  reps: CnamRep[]
}> {
  await wait(500)
  return cloneDeep({
    profile: CNAM_PROFILES[scenarioId],
    reps: CNAM_REPS[scenarioId] ?? [],
  })
}

// --------------------------------------------------------------------------
// Persona library (§4.3 P1 — unchanged from today; just data fetch)
// --------------------------------------------------------------------------

export async function listPersonas(agentType: 'sales' | 'service'): Promise<Persona[]> {
  await wait(200)
  return PERSONAS.filter((p) =>
    agentType === 'service' ? p.role.toLowerCase().includes('service') : p.role.toLowerCase().includes('sales'),
  )
}

// --------------------------------------------------------------------------
// Integrations (§4.5 — banner from contract addendum)
// --------------------------------------------------------------------------

export async function fetchIntegrations(scenarioId: ScenarioId): Promise<IntegrationEntry[]> {
  await wait(200)
  return cloneDeep(INTEGRATIONS[scenarioId] ?? [])
}

// --------------------------------------------------------------------------
// Service config (§4.6 — Phase 1 RAG doc-upload)
// --------------------------------------------------------------------------

export async function uploadServiceDoc(
  _file: File | null,
  onProgress?: (p: { stage: 'chunking' | 'embedding' | 'extracting' | 'done'; pct: number }) => void,
): Promise<ServiceConfig> {
  if (onProgress) {
    onProgress({ stage: 'chunking',   pct: 15 }); await wait(500)
    onProgress({ stage: 'embedding',  pct: 45 }); await wait(700)
    onProgress({ stage: 'extracting', pct: 80 }); await wait(900)
    onProgress({ stage: 'done',       pct: 100 })
  } else {
    await wait(1800)
  }
  return cloneDeep(SERVICE_CONFIG_PARSED)
}

export function emptyServiceConfig(): ServiceConfig {
  return cloneDeep(SERVICE_CONFIG_TEMPLATE)
}

// --------------------------------------------------------------------------
// Test Agent (§4.7 — passthrough)
// --------------------------------------------------------------------------

export async function runTestAgent(): Promise<{ passed: boolean; duration_s: number }> {
  await wait(1500)
  return { passed: true, duration_s: 12 }
}

// --------------------------------------------------------------------------
// Go-live probes (§4.9)
// --------------------------------------------------------------------------

export async function fetchGoLiveProbes(scenarioId: ScenarioId): Promise<GoLiveProbe[]> {
  await wait(400)
  return cloneDeep(GO_LIVE_PROBES[scenarioId] ?? [])
}

// --------------------------------------------------------------------------
// Post-onboarding checklist email (§4.10)
// --------------------------------------------------------------------------

export interface ChecklistEmail {
  to: string
  cc: string[]
  subject: string
  rows: Array<{ title: string; description: string; cta: string; link: string }>
}

export async function sendPostOnboardingChecklist(
  scenarioId: ScenarioId,
): Promise<ChecklistEmail> {
  const integrations = INTEGRATIONS[scenarioId] ?? []
  const rows = [
    ...integrations
      .filter((i) => i.status !== 'not_applicable')
      .map((i) => ({
        title: `Connect ${i.provider_name ?? i.key}`,
        description: `Open the ${i.key} connection wizard. PDF guide attached.`,
        cta: 'Open wizard',
        link: `https://vini.spyne.ai/wizard/${i.key.toLowerCase()}`,
      })),
    { title: 'Upload employee directory + invite users', description: 'CSV — name, email, phone, role, console access.', cta: 'Upload', link: 'https://vini.spyne.ai/users' },
    { title: "Review your team's email & SMS preferences", description: 'Defaults applied at invite; tune per user.', cta: 'Open prefs', link: 'https://vini.spyne.ai/comms' },
    { title: 'Track go-live status', description: 'Phone, STL, Smart Widget status board.', cta: 'Open status board', link: 'https://vini.spyne.ai/go-live' },
  ]
  await wait(450)
  return {
    to: 'it@dealership.com',
    cc: ['csm@spyne.ai'],
    subject: 'Final steps to go live with Vini — please complete in 48 h',
    rows,
  }
}
