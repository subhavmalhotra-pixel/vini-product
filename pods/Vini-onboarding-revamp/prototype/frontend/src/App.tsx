import { useEffect, useMemo, useState } from 'react'
import { Settings2 } from 'lucide-react'
import { FooterNav, Layout, StepperBody } from './components/Layout'
import { ContextPanel } from './components/ContextPanel'
import { Stepper, type StepKey } from './components/Stepper'
import { StlWidgetAdvanced } from './components/StlWidgetAdvanced'
import { DocsPanel } from './components/DocsPanel'
import { listScenarios, fetchIntegrations, emptyServiceConfig } from './api/mockApi'
import type {
  DealershipProfile,
  CnamProfile,
  CnamRep,
  GoLiveProbe,
  IntegrationEntry,
  Persona,
  PhoneDeploymentType,
  Scenario,
  ScenarioId,
  ToggleConfig,
  ServiceConfig as SC,
} from './types'

import { RooftopDetails } from './screens/RooftopDetails'
import { CallerId } from './screens/CallerId'
import { PersonaSelection, DEFAULT_FIRST_MESSAGE } from './screens/PersonaSelection'
import { ServiceConfig } from './screens/ServiceConfig'
import { TestAgent } from './screens/TestAgent'
import { GoLive } from './screens/GoLive'
import { PostOnboardingEmail } from './screens/PostOnboardingEmail'

// --------------------------------------------------------------------------
// Top-level state machine. Engineers replace mockApi.ts to plumb a real
// backend; this state model + step ordering stays.
// --------------------------------------------------------------------------

type ScreenKey = StepKey | 'post_email'

const SALES_ORDER: ScreenKey[] = [
  'rooftop',
  'cnam',
  'persona',
  'test_agent',
  'go_live',
  'post_email',
]

const SERVICE_ORDER: ScreenKey[] = [
  'rooftop',
  'cnam',
  'persona',
  'service_config',
  'test_agent',
  'go_live',
  'post_email',
]

const AREA_CODE_BY_DOMAIN: Record<string, string> = {
  'parkavenuehonda.com': '201',
  'sunsetford.com': '323',
  'heritagetoyota.com': '410',
  'desertchevy.com': '602',
  'acmeauto.com': '415',
  'lockeddealer.com': '',
}

function defaultAreaCode(scenario: Scenario): string {
  const domain = scenario.dealerWebsite.replace(/^https?:\/\//, '').replace(/\/.*/, '')
  return AREA_CODE_BY_DOMAIN[domain] ?? ''
}

export default function App() {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [scenarioId, setScenarioId] = useState<ScenarioId>('happy_path')
  const [activeStep, setActiveStep] = useState<ScreenKey>('rooftop')
  const [completed, setCompleted] = useState<ScreenKey[]>([])
  const [duration, setDuration] = useState('00:00:08')

  // Per-screen state
  const [profile, setProfile] = useState<DealershipProfile | null>(null)
  const [cnam, setCnam] = useState<{ profile: CnamProfile | null; reps: CnamRep[] } | null>(null)
  const [persona, setPersona] = useState<Persona | null>(null)
  const [firstMessage, setFirstMessage] = useState<string>(DEFAULT_FIRST_MESSAGE)
  const [areaCode, setAreaCode] = useState<string>('')
  const [serviceConfig, setServiceConfig] = useState<SC>(emptyServiceConfig())
  const [stl, setStl] = useState<ToggleConfig>({ enabled: true })
  const [smartWidget, setSmartWidget] = useState<ToggleConfig>({ enabled: true })
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showDocs, setShowDocs] = useState(false)
  const [testPassed, setTestPassed] = useState<boolean | null>(null)
  const [integrations, setIntegrations] = useState<IntegrationEntry[]>([])
  const [goLiveProbes, setGoLiveProbes] = useState<GoLiveProbe[]>([])
  const [phoneDeployment, setPhoneDeployment] = useState<PhoneDeploymentType[]>(['24x7'])

  useEffect(() => {
    listScenarios().then(setScenarios)
  }, [])

  useEffect(() => {
    fetchIntegrations(scenarioId).then(setIntegrations)
  }, [scenarioId])

  // Reset when scenario flips
  useEffect(() => {
    const sc = scenarios.find((s) => s.id === scenarioId)
    if (!sc) return
    setProfile(null)
    setCnam(null)
    setPersona(null)
    setFirstMessage(DEFAULT_FIRST_MESSAGE)
    setAreaCode(defaultAreaCode(sc))
    setServiceConfig(emptyServiceConfig())
    setStl({ enabled: true })
    setSmartWidget({ enabled: true })
    setTestPassed(null)
    setGoLiveProbes([])
    setPhoneDeployment(['24x7'])
    setActiveStep('rooftop')
    setCompleted([])
  }, [scenarioId, scenarios])

  // Stopwatch
  useEffect(() => {
    const start = Date.now()
    const id = setInterval(() => {
      const s = Math.floor((Date.now() - start) / 1000)
      const h = String(Math.floor(s / 3600)).padStart(2, '0')
      const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
      const ss = String(s % 60).padStart(2, '0')
      setDuration(`${h}:${m}:${ss}`)
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const scenario = useMemo(() => scenarios.find((s) => s.id === scenarioId), [scenarios, scenarioId])

  const order: ScreenKey[] = useMemo(
    () => (scenario?.agentType === 'service' ? SERVICE_ORDER : SALES_ORDER),
    [scenario?.agentType],
  )

  const stepperSteps = useMemo(
    () =>
      order
        .filter((k) => k !== 'post_email')
        .map((k) => ({
          key: k as StepKey,
          label: stepLabel(k),
          hidden: k === 'service_config' && scenario?.agentType !== 'service',
        })),
    [order, scenario?.agentType],
  )

  if (!scenario) return null

  const idx = order.indexOf(activeStep)
  const next = order[idx + 1]
  const prev = order[idx - 1]
  const goNext = () => {
    if (!completed.includes(activeStep)) setCompleted([...completed, activeStep])
    if (next) setActiveStep(next)
  }
  const goBack = () => prev && setActiveStep(prev)

  let nextDisabled = false
  let nextLabel = 'Next'
  let leftExtras: React.ReactNode = null
  const rightExtras: React.ReactNode = null

  if (activeStep === 'rooftop') {
    nextDisabled = !profile || profile.robots_txt_allowed === false || !rooftopMustHaveComplete(profile) || !areaCode
  }
  if (activeStep === 'cnam') {
    nextDisabled = !cnam?.profile
  }
  if (activeStep === 'persona') {
    nextDisabled = !persona
    leftExtras = (
      <button
        type="button"
        onClick={() => setShowAdvanced(true)}
        className="text-[12px] font-medium text-spyne-mute hover:text-spyne-ink inline-flex items-center gap-1"
      >
        <Settings2 size={12} /> Advanced (STL / Smart Widget)
      </button>
    )
  }
  if (activeStep === 'service_config') {
    nextDisabled = !serviceConfig.parsed
  }
  if (activeStep === 'test_agent') {
    nextDisabled = testPassed !== true
  }
  if (activeStep === 'go_live') {
    nextLabel = 'Mark live & send checklist'
  }

  const dealershipName = profile?.rooftop_name.value ?? scenario.label.split(' — ')[0]

  return (
    <Layout
      duration={duration}
      rooftopName={scenario.label.split(' — ')[0]}
      scenarios={scenarios}
      activeScenarioId={scenarioId}
      onScenarioChange={(id) => setScenarioId(id as ScenarioId)}
      onOpenDocs={() => setShowDocs(true)}
    >
      <StepperBody
        stepper={
          <Stepper
            steps={stepperSteps}
            activeKey={activeStep === 'post_email' ? 'go_live' : (activeStep as StepKey)}
            completedKeys={completed.filter((k) => k !== 'post_email') as StepKey[]}
            onJump={(k) => setActiveStep(k)}
          />
        }
        contextPanel={<ContextPanel scenario={scenario} />}
        footer={
          <FooterNav
            onBack={prev ? goBack : undefined}
            onNext={goNext}
            nextLabel={nextLabel}
            nextDisabled={nextDisabled}
            leftExtras={leftExtras}
            rightExtras={rightExtras}
          />
        }
      >
        {activeStep === 'rooftop' && (
          <RooftopDetails
            scenario={scenario}
            profile={profile}
            onProfileChange={setProfile}
            onContinue={goNext}
            areaCode={areaCode}
            onAreaCodeChange={setAreaCode}
          />
        )}
        {activeStep === 'cnam' && <CallerId scenario={scenario} data={cnam} onChange={setCnam} />}
        {activeStep === 'persona' && (
          <PersonaSelection
            scenario={scenario}
            selectedId={persona?.id ?? null}
            onSelect={setPersona}
            firstMessage={firstMessage}
            onFirstMessageChange={setFirstMessage}
            dealershipName={dealershipName}
          />
        )}
        {activeStep === 'service_config' && (
          <ServiceConfig config={serviceConfig} onChange={setServiceConfig} />
        )}
        {activeStep === 'test_agent' && <TestAgent persona={persona} onResult={setTestPassed} />}
        {activeStep === 'go_live' && (
          <GoLive
            scenario={scenario}
            probes={goLiveProbes}
            setProbes={setGoLiveProbes}
            integrations={integrations}
            stl={stl}
            smartWidget={smartWidget}
            phoneDeployment={phoneDeployment}
            onPhoneDeploymentChange={setPhoneDeployment}
            onSendChecklist={() => setActiveStep('post_email')}
          />
        )}
        {activeStep === 'post_email' && <PostOnboardingEmail scenario={scenario} />}
      </StepperBody>

      {showAdvanced && (
        <StlWidgetAdvanced
          stl={stl}
          smartWidget={smartWidget}
          onStlChange={setStl}
          onSmartWidgetChange={setSmartWidget}
          onClose={() => setShowAdvanced(false)}
        />
      )}

      {showDocs && <DocsPanel onClose={() => setShowDocs(false)} />}
    </Layout>
  )
}

function stepLabel(k: ScreenKey): string {
  switch (k) {
    case 'rooftop':              return 'Rooftop Details'
    case 'cnam':                 return 'Caller ID (CNAM)'
    case 'persona':              return 'Persona Selection'
    case 'agent_customization':  return 'Agent Customization'
    case 'service_config':       return 'Service Configuration'
    case 'test_agent':           return 'Test Agent'
    case 'go_live':              return 'Go-live Checklist'
    case 'post_email':           return 'Post-onboarding email'
  }
}

function rooftopMustHaveComplete(p: DealershipProfile): boolean {
  const need = [
    p.rooftop_name.value,
    p.rooftop_address.line1.value,
    p.rooftop_address.district.value,
    p.rooftop_address.state_or_province.value,
    p.rooftop_address.zipcode.value,
    p.rooftop_address.country.value,
    p.rooftop_timezone.value,
  ]
  return need.every((v) => v && String(v).trim() !== '')
}
