/**
 * Mock aggregate data for the reporting page.
 *
 * Numbers anchor to the screenshot Subhav shared on 28 May 2026 for Mia ·
 * Service Inbound at Mercedes-Benz Laguna Niguel — keeps the prototype's
 * narrative continuity. Real data would land here via aggregation pipeline.
 */

export const ROOFTOP = {
  name: "MB Laguna Niguel",
  rooftop_id: "mb-laguna-niguel",
  group: "Rochester Toyota",
};

/* ============================================================
   Agent · Mia · service inbound (matches the supplied screenshot)
   ============================================================ */
export const AGENT_DATA = {
  agent_name: "Mia",
  agent_role: "Service Inbound",
  window: "Last 30 days",

  totalCalls: 7370,
  callsDelta: "+8.2%",
  callsSparkline: [820, 870, 910, 880, 940, 1010, 1070, 1080, 1130, 1150, 1180, 1200, 1240, 1250],

  appointments: 3328,
  appointmentsDelta: "+4.0%",
  appointmentsTarget: "3,800",
  appointmentsSparkline: [300, 320, 340, 360, 350, 370, 390, 400, 415, 430],

  revenue: 519750,
  revenueDelta: "+12.0%",
  revenueTarget: "$560,000",
  revenueSparkline: [42000, 44000, 47000, 49000, 51000, 52000, 53500, 54500, 55500, 56000],

  // Funnel: Calls → Interacted → Qualified → Booked → Showed
  funnel: [
    { label: "Calls handled", value: 7370 },
    { label: "Interacted", value: 6710 },
    { label: "Qualified", value: 3795 },
    { label: "Appointments booked", value: 3328 },
    { label: "Showed", value: 2530 },
  ],

  // Vini vs human handled
  handleSplit: [
    { label: "Vini fully handled", value: 5170, tone: "neutral" as const },
    { label: "Routed to human", value: 2200, tone: "warn" as const },
  ],

  // Top intents (calls)
  topIntents: [
    { label: "Maintenance / oil change", value: 1750 },
    { label: "Recall follow-up", value: 1280 },
    { label: "Diagnostic / check-engine", value: 970 },
    { label: "Status update", value: 845 },
    { label: "Reschedule / status", value: 720 },
    { label: "Pricing / estimate", value: 660 },
    { label: "Service department transfer", value: 450 },
    { label: "Recall status check", value: 410 },
    { label: "General info", value: 285 },
  ],

  // Top services REQUESTED vs BOOKED
  servicesRequestedVsBooked: [
    { label: "Maintenance / oil change", left: 1750, right: 1640 },
    { label: "Recall follow-up", left: 1280, right: 1190 },
    { label: "Diagnostic / check-engine", left: 970, right: 820 },
    { label: "Reschedule", left: 720, right: 690 },
    { label: "Tires / alignment", left: 380, right: 240 },
    { label: "Glass replacement", left: 95, right: 0 },
    { label: "Key fob programming", left: 60, right: 0 },
  ],

  // Avg daily appointments — total vs Vini (last 7 days)
  appointmentsDaily: {
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    total: [122, 138, 144, 130, 158, 168, 90],
    vini: [78, 92, 98, 86, 108, 116, 64],
  },

  // Time-of-day heatmap · 7 rows (days) × 12 cols (2-hour buckets)
  timeHeatmap: {
    rows: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    cols: ["6a", "8a", "10a", "12p", "2p", "4p", "6p", "8p", "10p", "12a", "2a", "4a"],
    matrix: [
      [12, 78, 142, 168, 156, 138, 92, 42, 18, 4, 2, 1],
      [14, 82, 148, 172, 162, 142, 96, 44, 20, 5, 2, 1],
      [13, 80, 145, 170, 158, 140, 94, 43, 19, 4, 2, 1],
      [15, 84, 150, 175, 165, 145, 98, 46, 21, 6, 3, 1],
      [18, 92, 162, 188, 178, 158, 108, 52, 24, 8, 3, 2],
      [22, 65, 120, 132, 110, 88, 60, 38, 18, 6, 2, 1],
      [10, 48, 88, 92, 76, 58, 38, 22, 12, 4, 1, 1],
    ],
  },
};

/* ============================================================
   BDC Manager · Anya / Trevor — team-level rollup
   ============================================================ */
export const BDC_MANAGER_DATA = {
  team_size: 5,
  window: "Last 7 days",

  // Open items per rep (right now)
  openPerRep: [
    { label: "Madison Reid", value: 14, sublabel: "BDC Agent" },
    { label: "Carlos Vega", value: 11, sublabel: "BDC Agent" },
    { label: "Priya Shah", value: 6, sublabel: "Service Advisor" },
    { label: "David Park", value: 4, sublabel: "Sales Advisor" },
    { label: "Marcus Reid", value: 3, sublabel: "BDC Agent" },
  ],
  teamMedianOpen: 6,

  // Queue trend: 7 days
  queueTrend: {
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Today"],
    created: [42, 38, 45, 51, 48, 26, 38],
    closed: [40, 41, 42, 48, 47, 29, 36],
  },

  // SLA-burn distribution buckets
  slaBurn: [
    { label: "< 25%", value: 14, tone: "good" as const },
    { label: "25–50%", value: 9, tone: "neutral" as const },
    { label: "50–75%", value: 7, tone: "warn" as const },
    { label: "75–100%", value: 4, tone: "warn" as const },
    { label: "Past SLA", value: 1, tone: "bad" as const },
  ],

  // Closure rate per rep · this week vs last
  closureRatePerRep: [
    { label: "Madison Reid", left: 78, right: 82 },
    { label: "Carlos Vega", left: 71, right: 74 },
    { label: "Priya Shah", left: 84, right: 79 },
    { label: "David Park", left: 65, right: 70 },
    { label: "Marcus Reid", left: 88, right: 86 },
  ],

  // Median time-to-close per rep (minutes)
  timeToCloseMins: [
    { label: "Marcus Reid", value: 28, sublabel: "fastest" },
    { label: "Madison Reid", value: 42 },
    { label: "Priya Shah", value: 54 },
    { label: "Carlos Vega", value: 71 },
    { label: "David Park", value: 96, sublabel: "above team median" },
  ],

  // Mark-as-incorrect rate · by rep AND by intent
  markedIncorrectByRep: [
    { label: "Madison Reid", value: 1.2, sublabel: "%" },
    { label: "Carlos Vega", value: 2.4, sublabel: "%" },
    { label: "Priya Shah", value: 1.8, sublabel: "%" },
    { label: "David Park", value: 3.4, sublabel: "%", tone: "warn" as const },
    { label: "Marcus Reid", value: 0.8, sublabel: "%" },
  ],
  markedIncorrectByIntent: [
    { label: "Status update", value: 1.4, sublabel: "%" },
    { label: "Vehicle inquiry", value: 5.8, sublabel: "%", tone: "bad" as const },
    { label: "General info", value: 4.1, sublabel: "%", tone: "warn" as const },
    { label: "Pricing quote", value: 2.0, sublabel: "%" },
    { label: "Callback request", value: 0.9, sublabel: "%" },
  ],

  // Repeat-caller rate
  repeatCallers: {
    value: 7,
    delta: "+3",
    target: "0",
    sparkline: [3, 2, 4, 5, 4, 6, 7],
  },

  // Vini vs human handled
  handleSplit: [
    { label: "Vini fully handled", value: 78, tone: "neutral" as const },
    { label: "Routed to human", value: 22, tone: "warn" as const },
  ],
};

/* ============================================================
   Service Manager · service-bay throughput, recall handling
   ============================================================ */
export const SERVICE_MANAGER_DATA = {
  window: "Last 30 days",

  // Service intent mix
  intentMix: [
    { label: "Maintenance", value: 1750 },
    { label: "Diagnostic", value: 970 },
    { label: "Recall", value: 880 },
    { label: "Warranty", value: 420 },
    { label: "Other", value: 360 },
  ],

  // Vini-booked vs advisor-booked appointments (last 4 weeks)
  viniVsAdvisor: {
    weeks: ["Wk1", "Wk2", "Wk3", "Wk4"],
    vini: [580, 640, 720, 810],
    advisor: [320, 340, 380, 358],
  },

  // Top services requested vs booked
  servicesRequestedVsBooked: [
    { label: "Oil change", left: 1750, right: 1640 },
    { label: "Brake service", left: 720, right: 680 },
    { label: "Diagnostic / engine", left: 970, right: 820 },
    { label: "Recall (airbag)", left: 880, right: 810 },
    { label: "Tire / alignment", left: 380, right: 240 },
    { label: "Glass repair", left: 95, right: 0 },
    { label: "Key fob programming", left: 60, right: 0 },
  ],

  // Warm transfers · funnel
  transferFunnel: [
    { label: "Warm transfers initiated", value: 412 },
    { label: "Advisor picked up", value: 378 },
    { label: "Booking completed by advisor", value: 354 },
  ],

  // Repeat callers on status_update
  statusUpdateRepeatCallers: {
    value: 4,
    target: "0",
    sparkline: [2, 3, 4, 3, 5, 5, 4],
    delta: "+2",
  },

  // Recall response SLA
  recallSla: {
    value: 87,
    target: 95,
    label: "Recall response within 2h",
  },

  // Median advisor pickup time
  pickupTimeSecs: 42,
  pickupTimeSparkline: [54, 48, 50, 45, 44, 41, 42],

  // After-hours service demand histogram
  afterHoursHist: {
    hours: ["7p", "8p", "9p", "10p", "11p", "12a", "1a", "2a", "3a", "4a", "5a", "6a"],
    values: [148, 112, 84, 56, 38, 22, 12, 8, 6, 4, 12, 38],
  },
};

/* ============================================================
   GM / Dealer Principal — top-line ROI
   ============================================================ */
export const GM_DATA = {
  window: "Last 30 days",

  revenue: {
    value: "$519,750",
    delta: "+12.0%",
    target: "$560,000",
    sparkline: [42000, 44000, 47000, 49000, 51000, 52000, 53500, 54500, 55500, 56000],
  },

  callsToAppointments: {
    value: "45.1%",
    delta: "+3.2%",
    target: "50%",
    sparkline: [38, 39, 41, 42, 43, 44, 45, 45.1],
  },

  handleSplit: [
    { label: "Vini fully handled", value: 5170, tone: "neutral" as const },
    { label: "Routed to human", value: 2200, tone: "warn" as const },
  ],

  // 3-KPI strip · customer experience
  customerXp: [
    {
      label: "Positive sentiment",
      value: "80%",
      delta: "+2%",
      direction: "good" as const,
      target: "85%",
    },
    {
      label: "Repeat callers (week)",
      value: "7",
      delta: "+3",
      direction: "bad" as const,
      target: "0",
    },
    {
      label: "Median time-to-resolve",
      value: "2h 10m",
      delta: "-18m",
      direction: "good" as const,
      target: "< 4h",
    },
  ],

  // Headcount efficiency
  headcountEfficiency: {
    preVini: 1100,
    current: 1843,
    fteCount: 4,
    pctImprovement: "+67%",
  },

  // After-hours captured
  afterHours: {
    captured: 1210,
    total: 7370,
    pct: 16.4,
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    inHours: [600, 620, 640, 580, 700, 580, 480],
    afterHoursValues: [140, 155, 170, 160, 220, 200, 165],
  },

  // Funnel leakage (executive top-level)
  funnel: [
    { label: "Calls handled", value: 7370 },
    { label: "Qualified", value: 3795 },
    { label: "Appointments booked", value: 3328 },
    { label: "Showed", value: 2530 },
    { label: "Completed RO / closed", value: 2380 },
  ],

  // DNC compliance
  dnc: {
    violations: 0,
    target: 0,
    label: "DNC / TCPA compliance",
  },

  // Cross-rooftop leaderboard (Phase 2 preview)
  rooftops: [
    {
      rooftop: "MB Laguna Niguel",
      calls: "7,370",
      apptRate: "45.1%",
      vini: "78%",
      revenue: "$519.7K",
      delta: "+12%",
    },
    {
      rooftop: "MB San Diego",
      calls: "8,210",
      apptRate: "42.4%",
      vini: "76%",
      revenue: "$498.3K",
      delta: "+8%",
    },
    {
      rooftop: "MB Newport Beach",
      calls: "5,920",
      apptRate: "48.7%",
      vini: "81%",
      revenue: "$610.2K",
      delta: "+18%",
    },
    {
      rooftop: "MB Anaheim",
      calls: "6,840",
      apptRate: "40.8%",
      vini: "72%",
      revenue: "$402.5K",
      delta: "−3%",
    },
  ],
};
