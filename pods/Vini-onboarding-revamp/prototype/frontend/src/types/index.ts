// Mirrors backend Pydantic schemas in prototype/schemas.py.

export type Confidence = 'high' | 'medium' | 'low' | 'none'
export type Source = 'schema_org' | 'llm' | 'derived' | 'contract' | 'invite' | 'directory' | 'registry' | null

export interface Tracked {
  value: string | null
  confidence: Confidence
  source: Source
}

export interface Address {
  line1: Tracked
  line2: Tracked
  district: Tracked
  state_or_province: Tracked
  country: Tracked
  zipcode: Tracked
}

export interface WorkingHourSlot {
  day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'
  opens: string | null
  closes: string | null
}

export type DepartmentName = 'Sales' | 'Service' | 'Parts' | 'Finance'

export interface Department {
  name: DepartmentName
  phone: Tracked
  address: Address | null
  working_hours: WorkingHourSlot[]
  confidence: Confidence
  source: Source
}

export type ExtractionPath = 'schema_org' | 'llm' | 'hybrid' | 'blocked' | 'failed'

export interface DealershipProfile {
  rooftop_name: Tracked
  website: Tracked
  admin_name: Tracked
  admin_email: Tracked
  admin_phone: Tracked
  dealer_type: Tracked
  dealer_sub_type: Tracked
  vehicle_types: ('New' | 'Pre-Owned')[]
  rooftop_address: Address
  region: Tracked
  rooftop_timezone: Tracked
  departments: Department[]
  source_url: string
  pages_visited: string[]
  robots_txt_allowed: boolean
  extraction_path: ExtractionPath
  notes: string[]
}

// --- CNAM ---------------------------------------------------------------

export interface CnamProfile {
  legal_business_name: Tracked
  caller_id_display_name: Tracked
  business_type: Tracked
  business_industry: Tracked
  ein: Tracked
  ein_matches_contract: boolean | null
}

export interface CnamRep {
  first_name: Tracked
  last_name: Tracked
  email: Tracked
  title: Tracked
  phone: Tracked
  position: Tracked
  source: 'contract' | 'invite' | 'directory'
}

// --- Persona ------------------------------------------------------------

export interface Persona {
  id: string
  name: string
  role: string
  language: string
  accent: string
  gender: 'M' | 'F'
  image_url: string
  greeting_audio_url?: string
  recommended_for: { dealer_type?: string; region?: string }
}

// --- Integrations / checklist ------------------------------------------

export type IntegrationKey = 'IMS' | 'CarFax' | 'CRM' | 'Scheduler' | 'DMS'

export interface IntegrationEntry {
  key: IntegrationKey
  provider_name: string | null
  it_contact: string | null
  status: 'pending' | 'connected' | 'blocked' | 'not_applicable'
}

// --- Go-live state ------------------------------------------------------

export interface GoLiveProbe {
  key: 'phone' | 'stl' | 'widget'
  label: string
  status: 'live' | 'pending' | 'blocked' | 'disabled'
  detail: string
  updated_at: string
}

// Phone deployment — when should the agent answer? Multi-select.
export type PhoneDeploymentType = 'after_hour' | 'overflow' | '24x7'

export const PHONE_DEPLOYMENT_OPTIONS: Array<{
  id: PhoneDeploymentType
  label: string
  description: string
}> = [
  { id: 'after_hour', label: 'After hours',  description: 'Agent picks up only outside business hours' },
  { id: 'overflow',   label: 'Overflow',     description: 'Agent picks up when human reps are all busy' },
  { id: '24x7',       label: '24×7',         description: 'Agent picks up every call' },
]

// --- Scenario for the demo selector ------------------------------------

export type ScenarioId =
  | 'happy_path'
  | 'llm_fallback'
  | 'low_yield'
  | 'robots_blocked'
  | 'ein_mismatch'
  | 'service_agent'

export interface Scenario {
  id: ScenarioId
  label: string
  description: string
  agentType: 'sales' | 'service'
  dealerWebsite: string
}

// --- Agent setup config -------------------------------------------------

export interface AgentCustomization {
  first_message: string
  area_code: string
  is_default: boolean // true => OB skipped the customization step
}

export interface ToggleConfig {
  enabled: boolean
  disable_reason_code?: string | null
  disable_reason_text?: string | null
}

export interface SessionState {
  scenario: Scenario
  agentType: 'sales' | 'service'
  rooftopProfile: DealershipProfile | null
  cnam: { profile: CnamProfile | null; reps: CnamRep[] } | null
  persona: Persona | null
  customization: AgentCustomization | null
  serviceConfig: ServiceConfig | null
  stl: ToggleConfig
  smartWidget: ToggleConfig
  testAgent: { passed: boolean | null }
  integrations: IntegrationEntry[]
  goLiveProbes: GoLiveProbe[]
}

// --- Service Agent doc-upload extraction --------------------------------

export interface ServiceConfigField {
  key: 'makes' | 'services' | 'transportation' | 'rules' | 'pricing' | 'routing' | 'upsell'
  label: string
  value: string | null
  confidence: Confidence
  citation: { page: number; quote: string } | null
}

export interface ServiceConfig {
  doc_filename: string | null
  doc_pages: number
  fields: ServiceConfigField[]
  parsed: boolean
}
