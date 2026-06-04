import { useState } from "react";
import {
  Card,
  ComparisonBar,
  Donut,
  Funnel,
  Gauge,
  Heatmap,
  HorizontalBar,
  IncrementalCaptureCard,
  KpiCard,
  LeaderboardTable,
  ParityComparisonRow,
  QbrSummaryCard,
  RenewalReadinessHero,
  SectionHeader,
  Sparkline,
  StackedBar,
} from "../components/reporting/widgets";
import {
  AGENT_DATA,
  BDC_MANAGER_DATA,
  FIRST_30_DAYS_DATA,
  GM_DATA,
  SERVICE_MANAGER_DATA,
} from "../components/reporting/mockData";
import { MaterialSymbol } from "../components/MaterialSymbol";

type Persona = "first30" | "agent" | "bdc" | "service" | "gm";

const PERSONAS: { key: Persona; label: string; icon: string; sub: string }[] = [
  { key: "first30", label: "First 30 days", icon: "rocket_launch", sub: "Activation · renewal-risk lens" },
  { key: "agent", label: "Agent performance", icon: "support_agent", sub: "Mia · service inbound" },
  { key: "bdc", label: "BDC Manager", icon: "groups", sub: "Team-level rollup" },
  { key: "service", label: "Service Manager", icon: "build", sub: "Bay throughput · recalls" },
  { key: "gm", label: "GM / Dealer Principal", icon: "trending_up", sub: "Top-line ROI" },
];

const WINDOWS = ["Today", "Yesterday", "Last 7 days", "Last 30 days"];

export function ReportingPage() {
  const [persona, setPersona] = useState<Persona>("first30");
  const [windowSel, setWindowSel] = useState("Last 30 days");

  return (
    <div className="min-h-full bg-surface-background">
      {/* Page header */}
      <div className="border-b border-border-subtle bg-surface-card px-7 pt-6 pb-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-purple text-white">
              <MaterialSymbol name="monitoring" size={20} />
            </span>
            <div>
              <div className="text-eyebrow text-text-tertiary">Reports</div>
              <h1 className="mt-1 text-page-title text-text-primary">
                What needs my attention this period?
              </h1>
              <p className="mt-1 text-section-desc text-text-secondary">
                Lifecycle health, core metrics, and prioritised threats and
                opportunities for each role at your rooftop.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex overflow-hidden rounded-md border border-border-subtle">
              {WINDOWS.map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWindowSel(w)}
                  className={`px-3 py-1.5 text-[11px] font-semibold transition-colors duration-150 ${
                    windowSel === w
                      ? "bg-brand-purple-soft text-brand-purple"
                      : "bg-surface-card text-text-secondary hover:bg-surface-subtle"
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Persona tabs */}
        <nav
          className="-mb-px mt-5 flex items-center gap-0 overflow-x-auto"
          aria-label="Reporting persona"
        >
          {PERSONAS.map((p) => {
            const active = persona === p.key;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => setPersona(p.key)}
                className={`relative flex items-center gap-2 px-4 pb-3 pt-1 text-[13px] font-semibold transition-colors duration-150 ${
                  active
                    ? "text-brand-purple"
                    : "text-text-tertiary hover:text-text-secondary"
                }`}
              >
                <MaterialSymbol name={p.icon} size={16} />
                <div className="text-left">
                  <div>{p.label}</div>
                  <div className="text-[10px] font-normal text-text-tertiary">
                    {p.sub}
                  </div>
                </div>
                <span
                  className={`absolute inset-x-0 bottom-0 h-[2px] rounded-t transition-all duration-200 ${
                    active
                      ? "bg-brand-purple opacity-100"
                      : "bg-brand-purple opacity-0"
                  }`}
                  aria-hidden
                />
              </button>
            );
          })}
        </nav>
      </div>

      {/* Body */}
      <div className="px-7 py-7">
        {persona === "first30" ? <First30DaysTab /> : null}
        {persona === "agent" ? <AgentTab /> : null}
        {persona === "bdc" ? <BDCManagerTab /> : null}
        {persona === "service" ? <ServiceManagerTab /> : null}
        {persona === "gm" ? <GMTab /> : null}
      </div>
    </div>
  );
}

/* ============================================================
   Tab · First 30 days · activation-window renewal-risk lens
   ============================================================ */
function First30DaysTab() {
  const d = FIRST_30_DAYS_DATA;
  return (
    <div className="space-y-8">
      {/* Renewal readiness hero */}
      <RenewalReadinessHero
        daysSinceGoLive={d.daysSinceGoLive}
        parityScore={d.readiness.parityScore}
        incrementalValueUsd={d.readiness.incrementalValueUsd}
        status={d.readiness.status}
        headline={d.readiness.headline}
      />

      {/* Section 1: Parity · Q1 "Is AI doing what humans used to do?" */}
      <section>
        <div className="mb-3 flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-status-ok-soft text-status-ok">
            <MaterialSymbol name="balance" size={16} />
          </span>
          <div>
            <div className="text-meta-label text-text-tertiary">Question 1</div>
            <h2 className="text-section-h2 text-text-primary">
              Is Vini doing what your BDC used to do?
            </h2>
          </div>
        </div>
        <p className="mb-4 text-section-desc text-text-secondary">
          Side-by-side · pre-Vini human BDC baseline vs Vini today. Every metric
          must be at or above your pre-Vini number before we earn your renewal.
        </p>
        <div className="rounded-lg border border-border-subtle bg-surface-card px-5 py-1">
          {d.parity.map((row) => (
            <ParityComparisonRow
              key={row.metric}
              metric={row.metric}
              baseline={row.baseline}
              current={row.current}
              polarity={row.polarity}
              deltaLabel={row.deltaLabel}
              status={row.status}
              explainer={row.explainer}
            />
          ))}
        </div>
      </section>

      {/* Section 2: Incremental · Q2 "What was AI catching that humans missed?" */}
      <section>
        <div className="mb-3 flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-purple-soft text-brand-purple">
            <MaterialSymbol name="trending_up" size={16} />
          </span>
          <div>
            <div className="text-meta-label text-text-tertiary">Question 2</div>
            <h2 className="text-section-h2 text-text-primary">
              What is Vini catching that your BDC was missing?
            </h2>
          </div>
        </div>
        <p className="mb-4 text-section-desc text-text-secondary">
          Net-new revenue and customer outcomes Vini captured this period that
          your prior BDC could not. This is the value above-and-beyond parity.
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {d.incremental.map((card) => (
            <IncrementalCaptureCard
              key={card.label}
              icon={card.icon}
              label={card.label}
              captured={card.captured}
              preViniOutcome={card.preViniOutcome}
              valueLine={card.valueLine}
              tone={card.tone}
            />
          ))}
        </div>
      </section>

      {/* QBR summary · pre-formatted bullets the GM can copy */}
      <QbrSummaryCard bullets={d.qbrSummary.bullets} />
    </div>
  );
}

/* ============================================================
   Tab · Agent performance
   ============================================================ */
function AgentTab() {
  const d = AGENT_DATA;
  return (
    <div className="space-y-8">
      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon="call"
          label="Calls handled"
          value={d.totalCalls.toLocaleString()}
          delta={d.callsDelta}
          deltaDirection="good"
          sparkline={d.callsSparkline}
        />
        <KpiCard
          icon="event_available"
          label="Appointments"
          value={d.appointments.toLocaleString()}
          target={d.appointmentsTarget}
          delta={d.appointmentsDelta}
          deltaDirection="good"
          sparkline={d.appointmentsSparkline}
        />
        <KpiCard
          icon="payments"
          label="Revenue attributed"
          value={`$${(d.revenue / 1000).toFixed(0)}K`}
          target={d.revenueTarget}
          delta={d.revenueDelta}
          deltaDirection="good"
          sparkline={d.revenueSparkline}
        />
        <KpiCard
          icon="smart_toy"
          label="Vini handle rate"
          value="70%"
          target="80%"
          delta="+4%"
          deltaDirection="good"
        />
      </div>

      {/* Funnel + Handle split */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card
            title="Funnel conversion"
            description="Stage-to-stage progression with leakage per stage."
          >
            <Funnel stages={d.funnel} />
          </Card>
        </div>
        <Card
          title="Vini vs human"
          description="Where the work is going."
        >
          <StackedBar segments={d.handleSplit} />
        </Card>
      </div>

      {/* Time-of-day heatmap */}
      <div>
        <SectionHeader
          title="When are customers reaching out?"
          description="Hourly volume by day. Helps with shift planning + after-hours coverage."
        />
        <Card>
          <Heatmap
            data={d.timeHeatmap.matrix}
            rowLabels={d.timeHeatmap.rows}
            colLabels={d.timeHeatmap.cols}
            legend={{ low: "Low", high: "High" }}
          />
        </Card>
      </div>

      {/* Top intents + services-requested-vs-booked */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card
          title="Top customer intents"
          description="What customers are calling about."
        >
          <HorizontalBar rows={d.topIntents.slice(0, 7)} />
        </Card>
        <Card
          title="Services requested vs booked"
          description="The gap surfaces unsupported demand (last 2 rows = capacity we don't offer)."
        >
          <ComparisonBar
            rows={d.servicesRequestedVsBooked}
            leftLabel="Requested"
            rightLabel="Booked"
            leftTone="neutral"
            rightTone="good"
          />
        </Card>
      </div>

      {/* Daily appointments */}
      <div>
        <SectionHeader
          title="Avg daily appointments"
          description="Vini-booked share vs. routed advisors. Last 7 days."
        />
        <Card>
          <ComparisonBar
            rows={d.appointmentsDaily.days.map((day, i) => ({
              label: day,
              left: d.appointmentsDaily.total[i],
              right: d.appointmentsDaily.vini[i],
            }))}
            leftLabel="Total appointments"
            rightLabel="Vini-booked"
            leftTone="neutral"
            rightTone="good"
          />
        </Card>
      </div>
    </div>
  );
}

/* ============================================================
   Tab · BDC Manager
   ============================================================ */
function BDCManagerTab() {
  const d = BDC_MANAGER_DATA;
  return (
    <div className="space-y-8">
      {/* Top KPIs */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon="inbox"
          label="Open queue"
          value="35"
          target="< 50"
          delta="-12%"
          deltaDirection="good"
          sparkline={[42, 40, 38, 38, 36, 35, 35]}
        />
        <KpiCard
          icon="person_off"
          label="Unassigned"
          value="6"
          target="0"
          delta="-25%"
          deltaDirection="good"
        />
        <KpiCard
          icon="autorenew"
          label="Repeat callers"
          value={d.repeatCallers.value.toString()}
          target={d.repeatCallers.target}
          delta={d.repeatCallers.delta}
          deltaDirection="bad"
          sparkline={d.repeatCallers.sparkline}
          pulse
        />
        <KpiCard
          icon="warning"
          label="Past SLA"
          value="1"
          target="0"
          delta="-67%"
          deltaDirection="good"
        />
      </div>

      {/* Per-rep workload + queue trend */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card
          title="Workload distribution"
          description="Items per rep right now. Overload threshold = 2× team median."
        >
          <HorizontalBar
            rows={d.openPerRep.map((r) => ({
              ...r,
              tone:
                r.value > d.teamMedianOpen * 2
                  ? ("bad" as const)
                  : r.value > d.teamMedianOpen
                  ? ("warn" as const)
                  : ("neutral" as const),
            }))}
            threshold={{
              value: d.teamMedianOpen,
              label: "Team median",
            }}
          />
        </Card>
        <Card
          title="Queue created vs closed"
          description="Net delta over the past 7 days. Below the x-axis = draining."
        >
          <QueueDeltaChart
            days={d.queueTrend.days}
            created={d.queueTrend.created}
            closed={d.queueTrend.closed}
          />
        </Card>
      </div>

      {/* SLA-burn distribution + Vini vs human */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card
            title="SLA-burn distribution"
            description="How far through SLA every open item has aged. Items > 75% need attention."
          >
            <StackedBar segments={d.slaBurn} />
          </Card>
        </div>
        <Card
          title="Vini vs human"
          description="Team-wide handle rate this week."
        >
          <StackedBar
            segments={d.handleSplit.map((s) => ({
              ...s,
              tone: s.tone,
            }))}
          />
        </Card>
      </div>

      {/* Per-rep performance */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card
          title="Closure rate · this week vs last"
          description="Per-rep, period-over-period. Yellow tone = regressed."
        >
          <ComparisonBar
            rows={d.closureRatePerRep}
            leftLabel="Last week %"
            rightLabel="This week %"
            leftTone="neutral"
            rightTone="good"
          />
        </Card>
        <Card
          title="Median time-to-close per rep"
          description="Minutes from assigned → closed. Coaching candidates highlighted."
        >
          <HorizontalBar
            rows={d.timeToCloseMins.map((r) => ({
              label: r.label,
              value: r.value,
              sublabel: r.sublabel ?? "mins",
              tone:
                r.value > 90
                  ? ("warn" as const)
                  : r.value > 60
                  ? ("neutral" as const)
                  : ("good" as const),
            }))}
          />
        </Card>
      </div>

      {/* Mark-as-incorrect quality signal */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card
          title="Mark-as-incorrect rate · by rep"
          description="Above 3% = acceptable. Above 5% = quality signal worth investigating."
        >
          <HorizontalBar
            rows={d.markedIncorrectByRep}
            threshold={{ value: 3, label: "Acceptable ceiling (%)" }}
          />
        </Card>
        <Card
          title="Mark-as-incorrect rate · by intent"
          description="Which AI intent classification needs retraining. Above 5% goes into the next eval-set release."
        >
          <HorizontalBar
            rows={d.markedIncorrectByIntent}
            threshold={{ value: 5, label: "Eval-loop trigger (%)" }}
          />
        </Card>
      </div>
    </div>
  );
}

/* ============================================================
   Tab · Service Manager
   ============================================================ */
function ServiceManagerTab() {
  const d = SERVICE_MANAGER_DATA;
  const intentTotal = d.intentMix.reduce((s, x) => s + x.value, 0);
  return (
    <div className="space-y-8">
      {/* Top KPIs */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon="event_available"
          label="Service appointments"
          value={(d.viniVsAdvisor.vini.reduce((s, x) => s + x) + d.viniVsAdvisor.advisor.reduce((s, x) => s + x)).toLocaleString()}
          target="4,200"
          delta="+15%"
          deltaDirection="good"
          sparkline={d.viniVsAdvisor.vini.map((v, i) => v + d.viniVsAdvisor.advisor[i])}
        />
        <KpiCard
          icon="schedule_send"
          label="Avg pickup time (transfers)"
          value={`${d.pickupTimeSecs}s`}
          target="< 30s"
          delta="-22%"
          deltaDirection="good"
          sparkline={d.pickupTimeSparkline}
        />
        <KpiCard
          icon="autorenew"
          label="Repeat callers · status"
          value={d.statusUpdateRepeatCallers.value.toString()}
          target={d.statusUpdateRepeatCallers.target}
          delta={d.statusUpdateRepeatCallers.delta}
          deltaDirection="bad"
          sparkline={d.statusUpdateRepeatCallers.sparkline}
        />
        <KpiCard
          icon="health_and_safety"
          label="Recall SLA · 2h ack"
          value={`${d.recallSla.value}%`}
          target={`${d.recallSla.target}%`}
          delta="+5%"
          deltaDirection="good"
        />
      </div>

      {/* Service intent mix + recall SLA gauge */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card
            title="Service intent mix"
            description="What customers are calling about. Mix shows where the bay's load is concentrated."
          >
            <Donut
              items={d.intentMix}
              centerValue={intentTotal.toLocaleString()}
              centerLabel="Total service-intent calls"
            />
          </Card>
        </div>
        <Card
          title="Recall SLA compliance"
          description="2-hour acknowledgement target on recall intents."
        >
          <Gauge
            value={d.recallSla.value}
            max={100}
            threshold={d.recallSla.target}
            label={d.recallSla.label}
            formatValue={(v) => `${v}%`}
          />
        </Card>
      </div>

      {/* Vini vs advisor week-over-week */}
      <div>
        <SectionHeader
          title="Appointment source · Vini vs advisor"
          description="Vini-booked share is growing. Advisor-booked stays steady → Vini is incremental capture, not cannibalisation."
        />
        <Card>
          <ComparisonBar
            rows={d.viniVsAdvisor.weeks.map((wk, i) => ({
              label: wk,
              left: d.viniVsAdvisor.vini[i],
              right: d.viniVsAdvisor.advisor[i],
            }))}
            leftLabel="Vini-booked"
            rightLabel="Advisor-booked"
            leftTone="neutral"
            rightTone="good"
          />
        </Card>
      </div>

      {/* Services requested vs booked */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card
          title="Services requested vs booked"
          description="The bottom rows surface demand we're not capturing — opcode catalogue gap or cross-dept transfer candidates."
        >
          <ComparisonBar
            rows={d.servicesRequestedVsBooked}
            leftLabel="Requested"
            rightLabel="Booked"
            leftTone="neutral"
            rightTone="good"
          />
        </Card>
        <Card
          title="Warm transfer funnel"
          description="Where transfers drop. Low pickup % → advisor staffing or AHT issue."
        >
          <Funnel stages={d.transferFunnel} />
        </Card>
      </div>

      {/* After-hours demand */}
      <div>
        <SectionHeader
          title="After-hours service demand"
          description="Calls between 7 PM and 6 AM. Vini captures these straight into the scheduler; pre-Vini they hit voicemail."
        />
        <Card>
          <HorizontalBar
            rows={d.afterHoursHist.hours.map((h, i) => ({
              label: h,
              value: d.afterHoursHist.values[i],
            }))}
          />
        </Card>
      </div>
    </div>
  );
}

/* ============================================================
   Tab · GM / Dealer Principal
   ============================================================ */
function GMTab() {
  const d = GM_DATA;
  return (
    <div className="space-y-8">
      {/* Hero KPI row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon="payments"
          label="Revenue attributed"
          value={d.revenue.value}
          target={d.revenue.target}
          delta={d.revenue.delta}
          deltaDirection="good"
          sparkline={d.revenue.sparkline}
          windowLabel="vs last 30d"
        />
        <KpiCard
          icon="trending_up"
          label="Calls → appointments"
          value={d.callsToAppointments.value}
          target={d.callsToAppointments.target}
          delta={d.callsToAppointments.delta}
          deltaDirection="good"
          sparkline={d.callsToAppointments.sparkline}
        />
        <KpiCard
          icon="smart_toy"
          label="Vini handle rate"
          value="78%"
          target="85%"
          delta="+4%"
          deltaDirection="good"
        />
        <KpiCard
          icon="security"
          label="DNC / TCPA compliance"
          value={d.dnc.violations === 0 ? "0 violations" : `${d.dnc.violations}`}
          deltaDirection={d.dnc.violations === 0 ? "good" : "bad"}
          delta={d.dnc.violations === 0 ? "0%" : "+"}
        />
      </div>

      {/* Customer experience strip */}
      <div>
        <SectionHeader
          title="Customer experience snapshot"
          description="Three signals every weekly review starts with."
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {d.customerXp.map((cx) => (
            <KpiCard
              key={cx.label}
              icon={
                cx.label.includes("sentiment")
                  ? "sentiment_satisfied"
                  : cx.label.includes("Repeat")
                  ? "autorenew"
                  : "schedule"
              }
              label={cx.label}
              value={cx.value}
              delta={cx.delta}
              deltaDirection={cx.direction}
              target={cx.target}
            />
          ))}
        </div>
      </div>

      {/* Funnel leakage + Vini handle split */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card
            title="Top-line funnel · calls → revenue"
            description="Every drop represents recoverable demand. Showed → completed RO is the biggest lever after appointment booking."
          >
            <Funnel stages={d.funnel} />
          </Card>
        </div>
        <Card
          title="Vini effectiveness"
          description="What % of calls Vini fully handles."
        >
          <StackedBar segments={d.handleSplit} />
        </Card>
      </div>

      {/* Headcount efficiency + After-hours capture */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card
          title="Headcount efficiency"
          description="Calls handled per BDC FTE. Pre-Vini vs current."
        >
          <HeadcountEfficiency
            preVini={d.headcountEfficiency.preVini}
            current={d.headcountEfficiency.current}
            fteCount={d.headcountEfficiency.fteCount}
            pctImprovement={d.headcountEfficiency.pctImprovement}
          />
        </Card>
        <Card
          title="After-hours capture"
          description={`${d.afterHours.captured.toLocaleString()} of ${d.afterHours.total.toLocaleString()} calls (${d.afterHours.pct}%) happened after business hours. Pre-Vini these were voicemail.`}
        >
          <ComparisonBar
            rows={d.afterHours.days.map((day, i) => ({
              label: day,
              left: d.afterHours.inHours[i],
              right: d.afterHours.afterHoursValues[i],
            }))}
            leftLabel="In-hours"
            rightLabel="After-hours"
            leftTone="neutral"
            rightTone="good"
          />
        </Card>
      </div>

      {/* Cross-rooftop leaderboard */}
      <div>
        <SectionHeader
          title="Cross-rooftop benchmark"
          description="Phase 2 group view. Single-rooftop GMs see their own line bolded."
        />
        <Card>
          <LeaderboardTable
            columns={[
              { key: "rooftop", label: "Rooftop" },
              { key: "calls", label: "Calls", align: "right" },
              { key: "apptRate", label: "→ Appt %", align: "right" },
              { key: "vini", label: "Vini %", align: "right" },
              { key: "revenue", label: "Revenue", align: "right" },
              { key: "delta", label: "MoM", align: "right" },
            ]}
            rows={d.rooftops}
          />
        </Card>
      </div>
    </div>
  );
}

/* ============================================================
   Local custom widgets specific to this page
   ============================================================ */

function QueueDeltaChart({
  days,
  created,
  closed,
}: {
  days: string[];
  created: number[];
  closed: number[];
}) {
  const max = Math.max(...created, ...closed, 1);
  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((d, i) => {
        const net = closed[i] - created[i];
        const draining = net >= 0;
        return (
          <div key={d} className="flex flex-col items-center">
            <div className="relative h-32 w-full">
              <div className="absolute bottom-0 left-1/2 flex h-full w-full -translate-x-1/2 items-end gap-0.5">
                <div
                  className="flex-1 rounded-t-sm bg-status-past/70"
                  style={{ height: `${(created[i] / max) * 100}%` }}
                  title={`${created[i]} created`}
                />
                <div
                  className="flex-1 rounded-t-sm bg-status-ok/70"
                  style={{ height: `${(closed[i] / max) * 100}%` }}
                  title={`${closed[i]} closed`}
                />
              </div>
            </div>
            <div className="mt-1 text-meta text-text-tertiary">{d}</div>
            <div
              className={`tabular text-meta ${
                draining ? "text-status-ok" : "text-status-past"
              }`}
            >
              {draining ? "+" : ""}{net}
            </div>
          </div>
        );
      })}
      <div className="col-span-7 mt-2 flex items-center gap-4 border-t border-border-subtle pt-2 text-meta text-text-tertiary">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-status-past/70" /> Created
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-status-ok/70" /> Closed
        </span>
      </div>
    </div>
  );
}

function HeadcountEfficiency({
  preVini,
  current,
  fteCount,
  pctImprovement,
}: {
  preVini: number;
  current: number;
  fteCount: number;
  pctImprovement: string;
}) {
  const max = Math.max(preVini, current);
  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-baseline justify-between">
          <span className="text-card-title text-text-secondary">
            Pre-Vini baseline
          </span>
          <span className="tabular text-card-title text-text-secondary">
            {preVini.toLocaleString()} / FTE
          </span>
        </div>
        <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-surface-subtle">
          <div
            className="h-full bg-text-tertiary"
            style={{ width: `${(preVini / max) * 100}%` }}
          />
        </div>
      </div>
      <div>
        <div className="flex items-baseline justify-between">
          <span className="text-card-title text-text-primary">
            Current (with Vini)
          </span>
          <span className="tabular text-card-title text-status-ok">
            {current.toLocaleString()} / FTE
          </span>
        </div>
        <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-surface-subtle">
          <div
            className="h-full bg-status-ok"
            style={{ width: `${(current / max) * 100}%` }}
          />
        </div>
      </div>
      <div className="flex items-baseline justify-between border-t border-border-subtle pt-3">
        <div>
          <div className="text-meta text-text-tertiary">Efficiency lift</div>
          <div className="text-display text-status-ok">{pctImprovement}</div>
        </div>
        <div className="text-right">
          <div className="text-meta text-text-tertiary">Team size</div>
          <div className="tabular text-card-title text-text-primary">
            {fteCount} FTE
          </div>
        </div>
      </div>
    </div>
  );
}

// Suppress unused-import warning from the wider widget set
void Sparkline;
