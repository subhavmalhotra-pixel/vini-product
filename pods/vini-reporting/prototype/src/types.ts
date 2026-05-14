export interface Dealer {
  id: string;
  name: string;
  timezone: string;
  address: string;
  storeCount: number;
}

export interface CallOutcomes {
  appointmentSet: number;
  noAnswer: number;
  callbackRequested: number;
  other: number;
}

export interface WeeklyCallStats {
  totalInbound: number;
  totalOutbound: number;
  afterHoursCount: number;
  outcomes: CallOutcomes;
}

export interface AppointmentFunnel {
  set: number;
  showed: number;
  demoed: number;
  closed: number;
}

export type LeadAction = 'appointment_set' | 'callback_left' | 'no_answer' | 'demoed' | 'closed';

export interface CallLogEntry {
  id: string;
  timestamp: string; // ISO datetime
  direction: 'inbound' | 'outbound';
  durationSec: number;
  timeOfDay: 'after_hours' | 'business_hours';
  outcome: LeadAction | 'no_answer';
  snippet: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string; // masked e.g. "(214) ***-4821"
  vehicleInterest: string;
  attempts: number;
  lastAction: LeadAction;
  lastContactAt: string; // ISO datetime
  appointmentAt?: string;
  callLog: CallLogEntry[];
  transcript?: string;
  recordingDurationSec?: number;
  isHot: boolean;
}

export interface AfterHoursCall {
  id: string;
  caller: string;
  phone: string;
  timestamp: string;
  direction: 'inbound' | 'outbound';
  durationSec: number;
  outcome: 'appointment_set' | 'no_answer' | 'callback_requested';
  snippet: string;
}

export interface InsightCard {
  text: string | null;
  isFallback: boolean;
  generatedAt: string;
}

export interface EmailDigestState {
  nextSendAt: string; // ISO datetime — always Monday 7am local
  lastSentAt: string | null;
  lastSentStatus: 'delivered' | 'failed' | null;
}

export type CampaignType =
  | 'conquest'
  | 'service_follow_up'
  | 're_engagement'
  | 'equity_mining'
  | 'bdc_follow_up';

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: 'active' | 'completed' | 'paused';
  leadsTargeted: number;
  leadsContacted: number;
  responseRate: number; // 0–100
  appointmentsBooked: number;
  startDate: string; // ISO date
}

export interface CampaignSummary {
  activeCampaigns: number;
  totalLeadsTargeted: number;
  totalLeadsContacted: number;
  totalAppointments: number;
  campaigns: Campaign[];
}

export interface DealerWeekData {
  dealer: Dealer;
  weekStartDate: string; // YYYY-MM-DD
  callStats: WeeklyCallStats;
  appointmentFunnel: AppointmentFunnel;
  leads: Lead[];
  afterHoursCalls: AfterHoursCall[];
  insightCard: InsightCard;
  emailDigest: EmailDigestState;
  campaigns?: CampaignSummary; // undefined when no campaign data for the period
}
