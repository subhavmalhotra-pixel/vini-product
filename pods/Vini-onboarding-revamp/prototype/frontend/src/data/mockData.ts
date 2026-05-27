// Mock fixtures the mockApi serves up. Engineers can wire a real backend
// behind `api/mockApi.ts` without touching screens.

import type {
  CnamProfile,
  CnamRep,
  DealershipProfile,
  GoLiveProbe,
  IntegrationEntry,
  Persona,
  Scenario,
  ServiceConfig,
} from '../types'

const HIGH = 'high'
const MED = 'medium'
const LOW = 'low'

// --------------------------------------------------------------------------
// Scenarios — selectable from the top-bar in the demo
// --------------------------------------------------------------------------

export const SCENARIOS: Scenario[] = [
  {
    id: 'happy_path',
    label: 'Park Avenue Honda — happy path',
    description: 'Full Schema.org markup; 7+ high-confidence fields',
    agentType: 'sales',
    dealerWebsite: 'https://parkavenuehonda.com',
  },
  {
    id: 'llm_fallback',
    label: 'Heritage Toyota — LLM fallback',
    description: 'No Schema.org; LLM extracts; medium confidence',
    agentType: 'sales',
    dealerWebsite: 'https://heritagetoyota.com',
  },
  {
    id: 'low_yield',
    label: 'Desert Chevy — low yield',
    description: 'Partial Schema.org; 3 of 16 fields → Needs Input batch',
    agentType: 'sales',
    dealerWebsite: 'https://desertchevy.com',
  },
  {
    id: 'robots_blocked',
    label: 'Locked Dealer — robots.txt block',
    description: 'Crawler blocked; full manual entry path',
    agentType: 'sales',
    dealerWebsite: 'https://lockeddealer.com',
  },
  {
    id: 'ein_mismatch',
    label: 'Acme Auto — EIN mismatch',
    description: 'Registry EIN doesn\'t match contract; warning surfaces',
    agentType: 'sales',
    dealerWebsite: 'https://acmeauto.com',
  },
  {
    id: 'service_agent',
    label: 'Heritage Service — Service Agent (RAG)',
    description: 'Service Agent flow with service-policy doc upload',
    agentType: 'service',
    dealerWebsite: 'https://heritagetoyota.com',
  },
]

// --------------------------------------------------------------------------
// Dealership profiles per scenario
// --------------------------------------------------------------------------

const t = (value: string | null, confidence: any = HIGH, source: any = 'schema_org') => ({
  value,
  confidence,
  source,
})

const emptyAddress = () => ({
  line1: t(null, 'none', null),
  line2: t(null, 'none', null),
  district: t(null, 'none', null),
  state_or_province: t(null, 'none', null),
  country: t(null, 'none', null),
  zipcode: t(null, 'none', null),
})

const emptyTracked = () => t(null, 'none', null)

export const ROOFTOP_PROFILES: Record<string, DealershipProfile> = {
  happy_path: {
    rooftop_name: t('Park Avenue Honda', HIGH),
    website: t('https://parkavenuehonda.com', HIGH),
    admin_name: t('Mark Stevens', MED, 'llm'),
    admin_email: t('mstevens@parkavenuehonda.com', MED, 'llm'),
    admin_phone: t('+1 (201) 555-0142', HIGH),
    dealer_type: t('INDIVIDUAL_DEALER', LOW, 'derived'),
    dealer_sub_type: t('FRANCHISE_DEALER', LOW, 'derived'),
    vehicle_types: ['New', 'Pre-Owned'],
    rooftop_address: {
      line1: t('405 Park Ave', HIGH),
      line2: emptyTracked(),
      district: t('Rochelle Park', HIGH),
      state_or_province: t('NJ', HIGH),
      country: t('US', HIGH),
      zipcode: t('07662', HIGH),
    },
    region: t('AMER', LOW, 'derived'),
    rooftop_timezone: t('America/New_York', LOW, 'derived'),
    departments: [
      {
        name: 'Sales',
        phone: t('+1 (201) 555-0142', HIGH),
        address: null,
        working_hours: [
          { day_of_week: 'Monday', opens: '09:00', closes: '20:00' },
          { day_of_week: 'Tuesday', opens: '09:00', closes: '20:00' },
          { day_of_week: 'Wednesday', opens: '09:00', closes: '20:00' },
          { day_of_week: 'Thursday', opens: '09:00', closes: '20:00' },
          { day_of_week: 'Friday', opens: '09:00', closes: '20:00' },
          { day_of_week: 'Saturday', opens: '09:00', closes: '18:00' },
          { day_of_week: 'Sunday', opens: '11:00', closes: '17:00' },
        ],
        confidence: HIGH,
        source: 'schema_org',
      },
    ],
    source_url: 'https://parkavenuehonda.com',
    pages_visited: ['https://parkavenuehonda.com/', 'https://parkavenuehonda.com/contact'],
    robots_txt_allowed: true,
    extraction_path: 'hybrid',
    notes: [],
  },

  llm_fallback: {
    rooftop_name: t('Heritage Toyota of Owings Mills', MED, 'llm'),
    website: t('https://heritagetoyota.com', HIGH),
    admin_name: emptyTracked(),
    admin_email: emptyTracked(),
    admin_phone: t('(410) 555-9300', MED, 'llm'),
    dealer_type: emptyTracked(),
    dealer_sub_type: emptyTracked(),
    vehicle_types: ['New', 'Pre-Owned'],
    rooftop_address: {
      line1: t('9203 Reisterstown Road', MED, 'llm'),
      line2: emptyTracked(),
      district: t('Owings Mills', MED, 'llm'),
      state_or_province: t('MD', MED, 'llm'),
      country: t('US', LOW, 'derived'),
      zipcode: t('21117', MED, 'llm'),
    },
    region: emptyTracked(),
    rooftop_timezone: t('America/New_York', LOW, 'derived'),
    departments: [],
    source_url: 'https://heritagetoyota.com',
    pages_visited: ['https://heritagetoyota.com/'],
    robots_txt_allowed: true,
    extraction_path: 'llm',
    notes: ['No Schema.org markup found; used LLM extraction.'],
  },

  low_yield: {
    rooftop_name: t('Desert Chevy of Phoenix', HIGH),
    website: t('https://desertchevy.com', HIGH),
    admin_name: emptyTracked(),
    admin_email: emptyTracked(),
    admin_phone: t('+1 (602) 555-7700', HIGH),
    dealer_type: emptyTracked(),
    dealer_sub_type: emptyTracked(),
    vehicle_types: [],
    rooftop_address: emptyAddress(),
    region: emptyTracked(),
    rooftop_timezone: emptyTracked(),
    departments: [],
    source_url: 'https://desertchevy.com',
    pages_visited: ['https://desertchevy.com/'],
    robots_txt_allowed: true,
    extraction_path: 'schema_org',
    notes: ['Schema.org Light: only top-level fields found.'],
  },

  robots_blocked: {
    rooftop_name: emptyTracked(),
    website: t('https://lockeddealer.com', HIGH, 'derived'),
    admin_name: emptyTracked(),
    admin_email: emptyTracked(),
    admin_phone: emptyTracked(),
    dealer_type: emptyTracked(),
    dealer_sub_type: emptyTracked(),
    vehicle_types: [],
    rooftop_address: emptyAddress(),
    region: emptyTracked(),
    rooftop_timezone: emptyTracked(),
    departments: [],
    source_url: 'https://lockeddealer.com',
    pages_visited: [],
    robots_txt_allowed: false,
    extraction_path: 'blocked',
    notes: ['robots.txt disallows fetching the root path for our UA.'],
  },

  ein_mismatch: {
    rooftop_name: t('Acme Auto Group', HIGH),
    website: t('https://acmeauto.com', HIGH),
    admin_name: t('Susan Chen', MED, 'llm'),
    admin_email: t('schen@acmeauto.com', MED, 'llm'),
    admin_phone: t('+1 (415) 555-0100', HIGH),
    dealer_type: emptyTracked(),
    dealer_sub_type: emptyTracked(),
    vehicle_types: ['New'],
    rooftop_address: {
      line1: t('2200 Van Ness Ave', HIGH),
      line2: emptyTracked(),
      district: t('San Francisco', HIGH),
      state_or_province: t('CA', HIGH),
      country: t('US', HIGH),
      zipcode: t('94109', HIGH),
    },
    region: emptyTracked(),
    rooftop_timezone: t('America/Los_Angeles', LOW, 'derived'),
    departments: [],
    source_url: 'https://acmeauto.com',
    pages_visited: ['https://acmeauto.com/', 'https://acmeauto.com/contact'],
    robots_txt_allowed: true,
    extraction_path: 'hybrid',
    notes: [],
  },

  service_agent: {
    rooftop_name: t('Heritage Toyota Service Center', HIGH),
    website: t('https://heritagetoyota.com/service', HIGH),
    admin_name: t('Daniel Reyes', MED, 'llm'),
    admin_email: t('dreyes@heritagetoyota.com', MED, 'llm'),
    admin_phone: t('(410) 555-9311', HIGH),
    dealer_type: emptyTracked(),
    dealer_sub_type: emptyTracked(),
    vehicle_types: [],
    rooftop_address: {
      line1: t('9203 Reisterstown Road', HIGH),
      line2: emptyTracked(),
      district: t('Owings Mills', HIGH),
      state_or_province: t('MD', HIGH),
      country: t('US', HIGH),
      zipcode: t('21117', HIGH),
    },
    region: emptyTracked(),
    rooftop_timezone: t('America/New_York', LOW, 'derived'),
    departments: [],
    source_url: 'https://heritagetoyota.com/service',
    pages_visited: ['https://heritagetoyota.com/service'],
    robots_txt_allowed: true,
    extraction_path: 'schema_org',
    notes: [],
  },
}

// --------------------------------------------------------------------------
// CNAM profile + reps per scenario
// --------------------------------------------------------------------------

export const CNAM_PROFILES: Record<string, CnamProfile> = {
  happy_path: {
    legal_business_name: t('Park Avenue Honda LLC', HIGH, 'registry'),
    caller_id_display_name: t('Park Avenue Honda', HIGH, 'registry'),
    business_type: t('LLC', HIGH, 'registry'),
    business_industry: t('AUTOMOTIVE', HIGH, 'registry'),
    ein: t('22-3145789', HIGH, 'registry'),
    ein_matches_contract: true,
  },
  llm_fallback: {
    legal_business_name: t('Heritage Toyota Inc.', HIGH, 'registry'),
    caller_id_display_name: t('Heritage Toyota', HIGH, 'registry'),
    business_type: t('CORPORATION', HIGH, 'registry'),
    business_industry: t('AUTOMOTIVE', HIGH, 'registry'),
    ein: t('52-2099887', HIGH, 'registry'),
    ein_matches_contract: true,
  },
  low_yield: {
    legal_business_name: emptyTracked(),
    caller_id_display_name: emptyTracked(),
    business_type: emptyTracked(),
    business_industry: emptyTracked(),
    ein: emptyTracked(),
    ein_matches_contract: null,
  },
  robots_blocked: {
    legal_business_name: emptyTracked(),
    caller_id_display_name: emptyTracked(),
    business_type: emptyTracked(),
    business_industry: emptyTracked(),
    ein: emptyTracked(),
    ein_matches_contract: null,
  },
  ein_mismatch: {
    legal_business_name: t('Acme Auto Group LLC', HIGH, 'registry'),
    caller_id_display_name: t('Acme Auto', HIGH, 'registry'),
    business_type: t('LLC', HIGH, 'registry'),
    business_industry: t('AUTOMOTIVE', HIGH, 'registry'),
    ein: t('94-2199001', HIGH, 'registry'),
    ein_matches_contract: false,
  },
  service_agent: {
    legal_business_name: t('Heritage Toyota Inc.', HIGH, 'registry'),
    caller_id_display_name: t('Heritage Toyota Svc', HIGH, 'registry'),
    business_type: t('CORPORATION', HIGH, 'registry'),
    business_industry: t('AUTOMOTIVE', HIGH, 'registry'),
    ein: t('52-2099887', HIGH, 'registry'),
    ein_matches_contract: true,
  },
}

export const CNAM_REPS: Record<string, CnamRep[]> = {
  happy_path: [
    {
      first_name: t('Mark', HIGH, 'contract'),
      last_name: t('Stevens', HIGH, 'contract'),
      email: t('mstevens@parkavenuehonda.com', HIGH, 'contract'),
      title: t('General Manager', HIGH, 'contract'),
      phone: t('+1 (201) 555-0143', HIGH, 'contract'),
      position: t('Officer', HIGH, 'contract'),
      source: 'contract',
    },
    {
      first_name: t('Lisa', MED, 'invite'),
      last_name: t('Park', MED, 'invite'),
      email: t('lpark@parkavenuehonda.com', MED, 'invite'),
      title: t('Dealer Principal', MED, 'invite'),
      phone: t('+1 (201) 555-0144', MED, 'invite'),
      position: t('Owner', MED, 'invite'),
      source: 'invite',
    },
  ],
  llm_fallback: [],
  low_yield: [],
  robots_blocked: [],
  ein_mismatch: [
    {
      first_name: t('Susan', HIGH, 'contract'),
      last_name: t('Chen', HIGH, 'contract'),
      email: t('schen@acmeauto.com', HIGH, 'contract'),
      title: t('CEO', HIGH, 'contract'),
      phone: t('+1 (415) 555-0100', HIGH, 'contract'),
      position: t('Officer', HIGH, 'contract'),
      source: 'contract',
    },
  ],
  service_agent: [
    {
      first_name: t('Daniel', HIGH, 'contract'),
      last_name: t('Reyes', HIGH, 'contract'),
      email: t('dreyes@heritagetoyota.com', HIGH, 'contract'),
      title: t('Service Director', HIGH, 'contract'),
      phone: t('(410) 555-9311', HIGH, 'contract'),
      position: t('Officer', HIGH, 'contract'),
      source: 'contract',
    },
    {
      first_name: t('Pat', MED, 'directory'),
      last_name: t('Hall', MED, 'directory'),
      email: t('phall@heritagetoyota.com', MED, 'directory'),
      title: t('Service Manager', MED, 'directory'),
      phone: t('(410) 555-9315', MED, 'directory'),
      position: t('Officer', MED, 'directory'),
      source: 'directory',
    },
  ],
}

// --------------------------------------------------------------------------
// Personas — full library (Phase 1: keep today's UX, browse and pick)
// --------------------------------------------------------------------------

const PORTRAIT = (seed: string, gender: 'M' | 'F') =>
  `https://api.dicebear.com/9.x/personas/svg?seed=${encodeURIComponent(seed)}&gender=${gender === 'F' ? 'female' : 'male'}&backgroundColor=ede9fe,fce7f3,e0e7ff,dbeafe`

export const PERSONAS: Persona[] = [
  { id: 'dr-kendall', name: 'Dr. Kendall', role: 'Sales Inbound Agent', language: 'English', accent: 'American (New York)', gender: 'F', image_url: PORTRAIT('Dr Kendall', 'F'), recommended_for: { dealer_type: 'INDIVIDUAL_DEALER' } },
  { id: 'carl',       name: 'Carl',        role: 'Sales Inbound Agent', language: 'Multilingual', accent: 'American', gender: 'M', image_url: PORTRAIT('Carl', 'M'), recommended_for: {} },
  { id: 'elliot',     name: 'Elliot',      role: 'Sales Inbound Agent', language: 'Multilingual', accent: 'American', gender: 'M', image_url: PORTRAIT('Elliot', 'M'), recommended_for: {} },
  { id: 'natalie',    name: 'Natalie',     role: 'Sales Inbound Agent', language: 'English', accent: 'American (West Coast)', gender: 'F', image_url: PORTRAIT('Natalie', 'F'), recommended_for: {} },
  { id: 'marcus',     name: 'Marcus',      role: 'Sales Inbound Agent', language: 'English', accent: 'American (Texas)', gender: 'M', image_url: PORTRAIT('Marcus', 'M'), recommended_for: {} },
  { id: 'yara',       name: 'Yara',        role: 'Service Inbound Agent', language: 'English', accent: 'American (Midwest)', gender: 'F', image_url: PORTRAIT('Yara', 'F'), recommended_for: { dealer_type: 'INDIVIDUAL_DEALER' } },
  { id: 'james',      name: 'James',       role: 'Service Inbound Agent', language: 'Multilingual', accent: 'American', gender: 'M', image_url: PORTRAIT('James', 'M'), recommended_for: {} },
  { id: 'priya',      name: 'Priya',       role: 'Service Inbound Agent', language: 'Multilingual', accent: 'American', gender: 'F', image_url: PORTRAIT('Priya', 'F'), recommended_for: {} },
]

// --------------------------------------------------------------------------
// Integrations (Pre-onboarding → in-session banner)
// --------------------------------------------------------------------------

export const INTEGRATIONS: Record<string, IntegrationEntry[]> = {
  happy_path: [
    { key: 'IMS',      provider_name: 'VAuto',      it_contact: 'it@parkavenuehonda.com', status: 'pending' },
    { key: 'CarFax',   provider_name: 'CarFax',     it_contact: 'it@parkavenuehonda.com', status: 'pending' },
    { key: 'CRM',      provider_name: 'Salesforce', it_contact: 'it@parkavenuehonda.com', status: 'pending' },
  ],
  llm_fallback: [
    { key: 'IMS',      provider_name: 'HomeNet',    it_contact: null, status: 'pending' },
    { key: 'CarFax',   provider_name: null,         it_contact: null, status: 'not_applicable' },
    { key: 'CRM',      provider_name: 'VinSolutions', it_contact: null, status: 'pending' },
  ],
  low_yield: [
    { key: 'IMS',      provider_name: null, it_contact: null, status: 'pending' },
    { key: 'CarFax',   provider_name: null, it_contact: null, status: 'pending' },
    { key: 'CRM',      provider_name: null, it_contact: null, status: 'pending' },
  ],
  robots_blocked: [],
  ein_mismatch: [
    { key: 'IMS',      provider_name: 'AutoFusion', it_contact: 'it@acmeauto.com', status: 'pending' },
    { key: 'CarFax',   provider_name: 'CarFax',     it_contact: 'it@acmeauto.com', status: 'pending' },
    { key: 'CRM',      provider_name: 'HubSpot',    it_contact: 'it@acmeauto.com', status: 'pending' },
  ],
  service_agent: [
    { key: 'Scheduler', provider_name: 'CDK',       it_contact: 'svcit@heritagetoyota.com', status: 'pending' },
    { key: 'DMS',       provider_name: 'Reynolds',  it_contact: 'svcit@heritagetoyota.com', status: 'pending' },
  ],
}

// --------------------------------------------------------------------------
// Go-live probes (Phone / STL / Smart Widget per agent)
// --------------------------------------------------------------------------

export const GO_LIVE_PROBES: Record<string, GoLiveProbe[]> = {
  happy_path: [
    { key: 'phone',  label: 'Phone line',               status: 'live',    detail: '+1 (201) 555-9080 reachable', updated_at: '12s ago' },
    { key: 'stl',    label: 'Speed-to-Lead forwarding', status: 'live',    detail: 'test message routed in 1.2s', updated_at: '8s ago' },
    { key: 'widget', label: 'Smart View widget',        status: 'pending', detail: 'JS heartbeat awaiting embed', updated_at: '6s ago' },
  ],
  llm_fallback: [
    { key: 'phone',  label: 'Phone line',               status: 'live',    detail: '+1 (410) 555-9333 reachable', updated_at: '4s ago' },
    { key: 'stl',    label: 'Speed-to-Lead forwarding', status: 'pending', detail: 'awaiting first test lead',     updated_at: '4s ago' },
    { key: 'widget', label: 'Smart View widget',        status: 'pending', detail: 'JS heartbeat awaiting embed', updated_at: '4s ago' },
  ],
  low_yield: [
    { key: 'phone',  label: 'Phone line',               status: 'pending', detail: 'awaiting Twilio provisioning', updated_at: '2s ago' },
    { key: 'stl',    label: 'Speed-to-Lead forwarding', status: 'pending', detail: 'awaiting first test lead',     updated_at: '2s ago' },
    { key: 'widget', label: 'Smart View widget',        status: 'pending', detail: 'JS heartbeat awaiting embed',  updated_at: '2s ago' },
  ],
  robots_blocked: [
    { key: 'phone',  label: 'Phone line',               status: 'pending', detail: 'awaiting manual rooftop confirmation', updated_at: '0s ago' },
    { key: 'stl',    label: 'Speed-to-Lead forwarding', status: 'pending', detail: '-', updated_at: '0s ago' },
    { key: 'widget', label: 'Smart View widget',        status: 'pending', detail: '-', updated_at: '0s ago' },
  ],
  ein_mismatch: [
    { key: 'phone',  label: 'Phone line',               status: 'blocked', detail: 'CNAM submission blocked on EIN mismatch', updated_at: '1s ago' },
    { key: 'stl',    label: 'Speed-to-Lead forwarding', status: 'pending', detail: '-', updated_at: '1s ago' },
    { key: 'widget', label: 'Smart View widget',        status: 'live',    detail: 'embed verified', updated_at: '5s ago' },
  ],
  service_agent: [
    { key: 'phone',  label: 'Phone line',               status: 'live',    detail: '+1 (410) 555-9320 reachable', updated_at: '7s ago' },
    { key: 'stl',    label: 'Service inbound forwarding', status: 'live',  detail: 'service lead routed in 0.9s', updated_at: '7s ago' },
    { key: 'widget', label: 'Smart View widget',        status: 'live',    detail: 'embed verified',              updated_at: '7s ago' },
  ],
}

// --------------------------------------------------------------------------
// Service-config doc (Service Agent only)
// --------------------------------------------------------------------------

export const SERVICE_CONFIG_TEMPLATE: ServiceConfig = {
  doc_filename: null,
  doc_pages: 0,
  parsed: false,
  fields: [
    { key: 'makes',          label: 'Supported makes',                 value: null, confidence: 'none', citation: null },
    { key: 'services',       label: 'Available services',              value: null, confidence: 'none', citation: null },
    { key: 'transportation', label: 'Transportation support',          value: null, confidence: 'none', citation: null },
    { key: 'rules',          label: 'Service rules / special handling', value: null, confidence: 'none', citation: null },
    { key: 'pricing',        label: 'Pricing reveal policy',           value: null, confidence: 'none', citation: null },
    { key: 'routing',        label: 'Transfer / callback scenarios',   value: null, confidence: 'none', citation: null },
    { key: 'upsell',         label: 'Upsell preferences',              value: null, confidence: 'none', citation: null },
  ],
}

export const SERVICE_CONFIG_PARSED: ServiceConfig = {
  doc_filename: 'heritage-toyota-service-policy-2026.pdf',
  doc_pages: 42,
  parsed: true,
  fields: [
    { key: 'makes',          label: 'Supported makes',                 value: 'Toyota, Lexus, Scion (pre-2017)', confidence: 'high', citation: { page: 3, quote: 'We service all Toyota and Lexus vehicles, including pre-2017 Scion models.' } },
    { key: 'services',       label: 'Available services',              value: 'Oil change, brake service, transmission, recalls, diagnostics', confidence: 'high', citation: { page: 7, quote: 'Available services include oil changes, brake service, transmission flushes, recall repairs, and diagnostics.' } },
    { key: 'transportation', label: 'Transportation support',          value: 'Pickup & dropoff: arrange callback. Loaner vehicle: arrange callback. Shuttle: available 8am–5pm.', confidence: 'medium', citation: { page: 12, quote: 'Customers may request pickup and dropoff or a loaner vehicle…' } },
    { key: 'rules',          label: 'Service rules / special handling', value: 'Recalls always prioritized; warranty claims require service advisor.', confidence: 'medium', citation: { page: 18, quote: 'Recall and warranty work must be approved by a service advisor before booking.' } },
    { key: 'pricing',        label: 'Pricing reveal policy',           value: 'Reveal price for standard services; route to advisor for diagnostics.', confidence: 'high', citation: { page: 22, quote: 'Standard service pricing may be quoted upfront; diagnostic estimates require advisor review.' } },
    { key: 'routing',        label: 'Transfer / callback scenarios',   value: 'Transfer on: warranty disputes, recall confusion, customer asks for advisor by name.', confidence: 'medium', citation: { page: 27, quote: 'The agent should initiate a callback or transfer for warranty disputes and named-advisor requests.' } },
    { key: 'upsell',         label: 'Upsell preferences',              value: 'Upsell ON — recommend tire rotation and cabin filter when relevant.', confidence: 'high', citation: { page: 33, quote: 'Recommend tire rotation, cabin air filters, and brake inspections during qualifying visits.' } },
  ],
}
