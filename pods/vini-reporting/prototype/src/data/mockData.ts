import {
  Dealer,
  DealerWeekData,
  Lead,
  AfterHoursCall,
  CallLogEntry,
  CampaignSummary,
} from '../types'

// ---------------------------------------------------------------------------
// Dealers
// ---------------------------------------------------------------------------

export const DEALERS: Dealer[] = [
  {
    id: 'D001',
    name: 'Sunrise Auto Group',
    timezone: 'America/Chicago',
    address: '4200 N Central Expy, Dallas TX',
    storeCount: 1,
  },
  {
    id: 'D002',
    name: 'Valley Motors',
    timezone: 'America/Los_Angeles',
    address: '8800 Sepulveda Blvd, Los Angeles CA',
    storeCount: 1,
  },
  {
    id: 'D003',
    name: 'Peak Auto Center',
    timezone: 'America/New_York',
    address: '1200 Boston Post Rd, Milford CT',
    storeCount: 1,
  },
  {
    id: 'D004',
    name: 'Metro Cars',
    timezone: 'America/Denver',
    address: '5500 S Broadway, Englewood CO',
    storeCount: 1,
  },
]

// ---------------------------------------------------------------------------
// Helper: extract after-hours calls from leads
// ---------------------------------------------------------------------------

function extractAfterHoursCalls(leads: Lead[]): AfterHoursCall[] {
  const calls: AfterHoursCall[] = []
  for (const lead of leads) {
    for (const entry of lead.callLog) {
      if (entry.timeOfDay === 'after_hours') {
        calls.push({
          id: entry.id,
          caller: lead.name,
          phone: lead.phone,
          timestamp: entry.timestamp,
          direction: entry.direction,
          durationSec: entry.durationSec,
          outcome:
            entry.outcome === 'appointment_set'
              ? 'appointment_set'
              : entry.outcome === 'callback_left'
              ? 'callback_requested'
              : 'no_answer',
          snippet: entry.snippet,
        })
      }
    }
  }
  return calls
}

// ---------------------------------------------------------------------------
// D001 — Sunrise Auto Group
// ---------------------------------------------------------------------------

const D001_LEADS_2026_04_27: Lead[] = [
  {
    id: 'L001',
    name: 'Marcus Thompson',
    phone: '(214) ***-4821',
    vehicleInterest: '2024 Toyota Camry XSE',
    attempts: 4,
    lastAction: 'appointment_set',
    lastContactAt: '2026-04-29T18:32:00',
    appointmentAt: '2026-05-01T14:00:00',
    isHot: true,
    callLog: [
      {
        id: 'c1',
        timestamp: '2026-04-27T20:15:00',
        direction: 'inbound',
        durationSec: 185,
        timeOfDay: 'after_hours',
        outcome: 'appointment_set',
        snippet:
          'Customer inquired about 2024 Camry XSE in Midnight Black. Confirmed availability, discussed financing options, and scheduled appointment for Friday at 2 PM.',
      },
      {
        id: 'c2',
        timestamp: '2026-04-29T18:32:00',
        direction: 'outbound',
        durationSec: 92,
        timeOfDay: 'business_hours',
        outcome: 'appointment_set',
        snippet:
          'Confirmation call for Friday appointment. Customer confirmed attendance and asked about trade-in for a 2019 Honda Accord.',
      },
    ],
    transcript:
      "Vini: Thank you for calling Sunrise Auto Group, this is Vini. How can I help you tonight?\nCustomer: Hi, I'm looking at the 2024 Camry XSE you have listed. Is the Midnight Black one still available?\nVini: Let me check that for you. Yes, the 2024 Camry XSE in Midnight Black is available. It's a great choice — would you like to come in for a test drive?\nCustomer: Yeah, I can do Friday afternoon.\nVini: Perfect. I have you down for Friday May 1st at 2 PM. I'll send a confirmation to your number. Is there anything else I can help with?\nCustomer: No that's great, thanks.",
    recordingDurationSec: 185,
  },
  {
    id: 'L002',
    name: 'Sandra Liu',
    phone: '(972) ***-0934',
    vehicleInterest: '2023 Honda CR-V Hybrid',
    attempts: 3,
    lastAction: 'callback_left',
    lastContactAt: '2026-04-28T14:20:00',
    isHot: true,
    callLog: [
      {
        id: 'c3',
        timestamp: '2026-04-27T09:45:00',
        direction: 'outbound',
        durationSec: 0,
        timeOfDay: 'business_hours',
        outcome: 'no_answer',
        snippet: 'No answer on first outreach attempt. Voicemail left.',
      },
      {
        id: 'c4',
        timestamp: '2026-04-28T11:10:00',
        direction: 'outbound',
        durationSec: 0,
        timeOfDay: 'business_hours',
        outcome: 'no_answer',
        snippet: 'Second attempt — no answer.',
      },
      {
        id: 'c5',
        timestamp: '2026-04-28T14:20:00',
        direction: 'inbound',
        durationSec: 142,
        timeOfDay: 'business_hours',
        outcome: 'callback_left',
        snippet:
          'Customer returned call. Interested in CR-V Hybrid in Sonic Gray Pearl. Requested callback Friday morning with pricing details.',
      },
    ],
    transcript:
      "Vini: Sunrise Auto Group, this is Vini. How can I help?\nCustomer: Hi yes I'm calling back about the CR-V Hybrid.\nVini: Of course! The 2023 CR-V Hybrid in Sonic Gray Pearl — is that the one you had in mind?\nCustomer: Yes, can you send me pricing information before I come in? My husband and I want to review it first.\nVini: Absolutely. I'll have our team send you full pricing and available packages. What's the best time to call you Friday?\nCustomer: Maybe around 10 AM?\nVini: Got it — I'll have someone reach out at 10 AM Friday. Thank you!",
    recordingDurationSec: 142,
  },
  {
    id: 'L003',
    name: 'James Rodriguez',
    phone: '(469) ***-7712',
    vehicleInterest: '2024 Ford F-150 XLT',
    attempts: 2,
    lastAction: 'appointment_set',
    lastContactAt: '2026-04-29T20:45:00',
    appointmentAt: '2026-05-02T10:00:00',
    isHot: true,
    callLog: [
      {
        id: 'c6',
        timestamp: '2026-04-29T20:45:00',
        direction: 'inbound',
        durationSec: 210,
        timeOfDay: 'after_hours',
        outcome: 'appointment_set',
        snippet:
          'After-hours call. Customer wanted to see the F-150 XLT with tow package. Appointment set for Saturday 10 AM.',
      },
    ],
    transcript:
      "Vini: Sunrise Auto Group, you've reached Vini. We're closed right now but I can help with appointments. What can I do for you?\nCustomer: I want to look at the F-150 XLT, the one with the tow package.\nVini: We have that in stock. Would you like to come in Saturday?\nCustomer: Saturday at 10 works.\nVini: Perfect, I have James Rodriguez for Saturday May 2nd at 10 AM. I'll send a reminder the morning of.",
    recordingDurationSec: 210,
  },
  {
    id: 'L004',
    name: 'Priya Sharma',
    phone: '(214) ***-3309',
    vehicleInterest: '2024 Hyundai Tucson Limited',
    attempts: 5,
    lastAction: 'no_answer',
    lastContactAt: '2026-05-01T16:00:00',
    isHot: true,
    callLog: [
      {
        id: 'c7',
        timestamp: '2026-04-27T10:00:00',
        direction: 'outbound',
        durationSec: 0,
        timeOfDay: 'business_hours',
        outcome: 'no_answer',
        snippet: 'First outreach — no answer.',
      },
      {
        id: 'c8',
        timestamp: '2026-04-28T15:30:00',
        direction: 'outbound',
        durationSec: 0,
        timeOfDay: 'business_hours',
        outcome: 'no_answer',
        snippet: 'Second attempt.',
      },
      {
        id: 'c9',
        timestamp: '2026-04-29T11:00:00',
        direction: 'outbound',
        durationSec: 0,
        timeOfDay: 'business_hours',
        outcome: 'no_answer',
        snippet: 'Third attempt.',
      },
      {
        id: 'c10',
        timestamp: '2026-04-30T09:15:00',
        direction: 'outbound',
        durationSec: 0,
        timeOfDay: 'business_hours',
        outcome: 'no_answer',
        snippet: 'Fourth attempt — voicemail full.',
      },
      {
        id: 'c11',
        timestamp: '2026-05-01T16:00:00',
        direction: 'outbound',
        durationSec: 0,
        timeOfDay: 'business_hours',
        outcome: 'no_answer',
        snippet: 'Fifth attempt.',
      },
    ],
    transcript: undefined,
    recordingDurationSec: undefined,
  },
  {
    id: 'L005',
    name: 'Derek Wilson',
    phone: '(817) ***-5584',
    vehicleInterest: '2023 Chevrolet Traverse LT',
    attempts: 2,
    lastAction: 'demoed',
    lastContactAt: '2026-04-30T11:30:00',
    isHot: true,
    callLog: [
      {
        id: 'c12',
        timestamp: '2026-04-28T09:00:00',
        direction: 'outbound',
        durationSec: 165,
        timeOfDay: 'business_hours',
        outcome: 'appointment_set',
        snippet:
          'Customer interested in Traverse LT for family use. Appointment set for Wednesday.',
      },
      {
        id: 'c13',
        timestamp: '2026-04-30T11:30:00',
        direction: 'inbound',
        durationSec: 88,
        timeOfDay: 'business_hours',
        outcome: 'demoed',
        snippet:
          'Post-demo follow-up call. Customer took a test drive Wednesday morning and is considering. Said he will decide by end of week.',
      },
    ],
    transcript:
      "Vini: Good morning! Calling to follow up on your Traverse visit Wednesday. How did the test drive go?\nCustomer: Really good actually. The kids loved the third row. We're pretty close to a decision.\nVini: That's great to hear. Is there anything else you'd like to know about the vehicle or financing before you decide?\nCustomer: Maybe just confirm the lease terms we discussed. Can someone call me back today?\nVini: Absolutely — I'll have our finance team reach out this afternoon.",
    recordingDurationSec: 88,
  },
  {
    id: 'L006',
    name: 'Angela Foster',
    phone: '(214) ***-8820',
    vehicleInterest: '2024 BMW X3 xDrive30i',
    attempts: 3,
    lastAction: 'closed',
    lastContactAt: '2026-05-01T15:00:00',
    isHot: false,
    callLog: [
      {
        id: 'c14',
        timestamp: '2026-04-27T14:00:00',
        direction: 'inbound',
        durationSec: 240,
        timeOfDay: 'business_hours',
        outcome: 'appointment_set',
        snippet:
          'Customer test drive inquiry for X3. Appointment booked for Thursday.',
      },
      {
        id: 'c15',
        timestamp: '2026-05-01T09:00:00',
        direction: 'outbound',
        durationSec: 180,
        timeOfDay: 'business_hours',
        outcome: 'demoed',
        snippet:
          'Pre-appointment confirmation. Customer confirmed and asked about extended warranty.',
      },
      {
        id: 'c16',
        timestamp: '2026-05-01T15:00:00',
        direction: 'inbound',
        durationSec: 125,
        timeOfDay: 'business_hours',
        outcome: 'closed',
        snippet:
          'Customer called to say she is purchasing. Paperwork scheduled for Saturday.',
      },
    ],
    transcript:
      "Customer: Hi, I came in Thursday and drove the X3. I'd like to move forward with the purchase.\nVini: That's wonderful news! I'll connect you with our team to schedule your paperwork. Are you available Saturday?\nCustomer: Yes, Saturday morning works great.\nVini: Perfect. We'll have everything ready for you. Is there anything you'd like us to prepare in advance?\nCustomer: Just the financing paperwork for the amount we discussed.\nVini: Done — see you Saturday!",
    recordingDurationSec: 125,
  },
]

const D001_LEADS_2026_04_20: Lead[] = [
  {
    id: 'L101',
    name: 'Kevin Park',
    phone: '(214) ***-2241',
    vehicleInterest: '2024 Kia Telluride SX',
    attempts: 3,
    lastAction: 'appointment_set',
    lastContactAt: '2026-04-21T10:30:00',
    appointmentAt: '2026-04-23T11:00:00',
    isHot: true,
    callLog: [
      {
        id: 'd1',
        timestamp: '2026-04-20T19:45:00',
        direction: 'inbound',
        durationSec: 155,
        timeOfDay: 'after_hours',
        outcome: 'appointment_set',
        snippet:
          'Customer called after hours interested in the Telluride SX. Confirmed availability and scheduled Thursday 11 AM.',
      },
      {
        id: 'd2',
        timestamp: '2026-04-21T10:30:00',
        direction: 'outbound',
        durationSec: 72,
        timeOfDay: 'business_hours',
        outcome: 'appointment_set',
        snippet: 'Confirmed appointment for Thursday. Customer asked about color options.',
      },
    ],
    transcript:
      "Vini: Sunrise Auto Group, this is Vini!\nCustomer: Hi, I'm interested in the Telluride SX. Do you have any in stock?\nVini: Yes, we have the 2024 Telluride SX in Gravity Gray and Ebony Black. Would you like to come in Thursday?\nCustomer: Thursday at 11 works perfectly.\nVini: Great, see you then!",
    recordingDurationSec: 155,
  },
  {
    id: 'L102',
    name: 'Rachel Okonkwo',
    phone: '(972) ***-6618',
    vehicleInterest: '2023 Mazda CX-5 Touring',
    attempts: 2,
    lastAction: 'callback_left',
    lastContactAt: '2026-04-22T13:45:00',
    isHot: true,
    callLog: [
      {
        id: 'd3',
        timestamp: '2026-04-21T09:00:00',
        direction: 'outbound',
        durationSec: 0,
        timeOfDay: 'business_hours',
        outcome: 'no_answer',
        snippet: 'No answer on first attempt.',
      },
      {
        id: 'd4',
        timestamp: '2026-04-22T13:45:00',
        direction: 'inbound',
        durationSec: 110,
        timeOfDay: 'business_hours',
        outcome: 'callback_left',
        snippet:
          'Customer returned call. Interested in CX-5 Touring. Requested pricing sheet before scheduling visit.',
      },
    ],
    transcript:
      "Customer: I'm calling back about the Mazda CX-5.\nVini: Of course! We have the 2023 CX-5 Touring available. Can I get you some pricing details?\nCustomer: Yes please, email those over and I'll call back to schedule.",
    recordingDurationSec: 110,
  },
  {
    id: 'L103',
    name: 'Tony Hernandez',
    phone: '(469) ***-9903',
    vehicleInterest: '2024 Ram 1500 Big Horn',
    attempts: 4,
    lastAction: 'no_answer',
    lastContactAt: '2026-04-25T14:00:00',
    isHot: true,
    callLog: [
      {
        id: 'd5',
        timestamp: '2026-04-21T11:00:00',
        direction: 'outbound',
        durationSec: 0,
        timeOfDay: 'business_hours',
        outcome: 'no_answer',
        snippet: 'First attempt — no answer.',
      },
      {
        id: 'd6',
        timestamp: '2026-04-25T14:00:00',
        direction: 'outbound',
        durationSec: 0,
        timeOfDay: 'business_hours',
        outcome: 'no_answer',
        snippet: 'Fourth attempt — still no answer.',
      },
    ],
  },
  {
    id: 'L104',
    name: 'Melissa Grant',
    phone: '(817) ***-4471',
    vehicleInterest: '2024 Subaru Outback Onyx',
    attempts: 2,
    lastAction: 'demoed',
    lastContactAt: '2026-04-24T10:00:00',
    isHot: false,
    callLog: [
      {
        id: 'd7',
        timestamp: '2026-04-22T09:30:00',
        direction: 'outbound',
        durationSec: 135,
        timeOfDay: 'business_hours',
        outcome: 'appointment_set',
        snippet: 'Customer interested in Outback Onyx. Appointment set for Thursday.',
      },
      {
        id: 'd8',
        timestamp: '2026-04-24T10:00:00',
        direction: 'inbound',
        durationSec: 75,
        timeOfDay: 'business_hours',
        outcome: 'demoed',
        snippet: 'Customer called after test drive. Liked the vehicle, needs to discuss with spouse.',
      },
    ],
    transcript:
      "Vini: Good morning! Following up on your Outback visit.\nCustomer: Yes! I really liked it. The AWD feels solid. Let me talk to my husband tonight and I'll call back tomorrow.",
    recordingDurationSec: 75,
  },
]

const D001_LEADS_2026_05_04: Lead[] = [
  {
    id: 'L201',
    name: 'Bryan Carter',
    phone: '(214) ***-7723',
    vehicleInterest: '2024 Toyota RAV4 XLE',
    attempts: 3,
    lastAction: 'closed',
    lastContactAt: '2026-05-08T15:00:00',
    isHot: true,
    callLog: [
      {
        id: 'e1',
        timestamp: '2026-05-05T19:30:00',
        direction: 'inbound',
        durationSec: 195,
        timeOfDay: 'after_hours',
        outcome: 'appointment_set',
        snippet: 'After-hours inquiry about RAV4 XLE. Appointment scheduled for Tuesday.',
      },
      {
        id: 'e2',
        timestamp: '2026-05-08T15:00:00',
        direction: 'inbound',
        durationSec: 110,
        timeOfDay: 'business_hours',
        outcome: 'closed',
        snippet: 'Customer confirmed purchase. Financing approved. Coming in Friday to sign.',
      },
    ],
    transcript:
      "Customer: I drove the RAV4 Tuesday and I want to move forward.\nVini: Fantastic! Our finance team has your paperwork ready. Friday works — we'll see you then.",
    recordingDurationSec: 110,
  },
  {
    id: 'L202',
    name: 'Cynthia Moore',
    phone: '(972) ***-1192',
    vehicleInterest: '2023 Honda Pilot Touring',
    attempts: 2,
    lastAction: 'appointment_set',
    lastContactAt: '2026-05-05T11:00:00',
    appointmentAt: '2026-05-07T13:00:00',
    isHot: true,
    callLog: [
      {
        id: 'e3',
        timestamp: '2026-05-04T21:00:00',
        direction: 'inbound',
        durationSec: 175,
        timeOfDay: 'after_hours',
        outcome: 'appointment_set',
        snippet: 'After-hours call. Interested in Pilot Touring for road trips. Appointment Thursday 1 PM.',
      },
      {
        id: 'e4',
        timestamp: '2026-05-05T11:00:00',
        direction: 'outbound',
        durationSec: 65,
        timeOfDay: 'business_hours',
        outcome: 'appointment_set',
        snippet: 'Confirmation call. Customer excited about the appointment.',
      },
    ],
    transcript:
      "Vini: Calling to confirm your Thursday 1 PM appointment for the Honda Pilot!\nCustomer: Yes! I'm really looking forward to it. I have three kids so I need all that space.",
    recordingDurationSec: 65,
  },
  {
    id: 'L203',
    name: 'Nathan Ellis',
    phone: '(469) ***-5538',
    vehicleInterest: '2024 Jeep Grand Cherokee L',
    attempts: 3,
    lastAction: 'demoed',
    lastContactAt: '2026-05-07T14:30:00',
    isHot: true,
    callLog: [
      {
        id: 'e5',
        timestamp: '2026-05-05T10:15:00',
        direction: 'outbound',
        durationSec: 145,
        timeOfDay: 'business_hours',
        outcome: 'appointment_set',
        snippet: 'Customer interested in Grand Cherokee L. Appointment Wednesday.',
      },
      {
        id: 'e6',
        timestamp: '2026-05-07T14:30:00',
        direction: 'inbound',
        durationSec: 95,
        timeOfDay: 'business_hours',
        outcome: 'demoed',
        snippet: 'Post-demo. Customer loved the 3rd row and tech package. Considering financing.',
      },
    ],
    transcript:
      "Customer: I just left the dealership. That Grand Cherokee is awesome.\nVini: Glad to hear it! Would you like me to connect you with our finance team?\nCustomer: Yes, let's do that.",
    recordingDurationSec: 95,
  },
  {
    id: 'L204',
    name: 'Valeria Reyes',
    phone: '(817) ***-6640',
    vehicleInterest: '2024 Nissan Rogue SL',
    attempts: 2,
    lastAction: 'appointment_set',
    lastContactAt: '2026-05-06T09:45:00',
    appointmentAt: '2026-05-09T10:00:00',
    isHot: true,
    callLog: [
      {
        id: 'e7',
        timestamp: '2026-05-06T09:45:00',
        direction: 'inbound',
        durationSec: 130,
        timeOfDay: 'business_hours',
        outcome: 'appointment_set',
        snippet: 'Customer interested in Rogue SL. Saturday appointment confirmed.',
      },
      {
        id: 'e8',
        timestamp: '2026-05-07T16:00:00',
        direction: 'outbound',
        durationSec: 55,
        timeOfDay: 'business_hours',
        outcome: 'appointment_set',
        snippet: 'Reminder call sent. Customer confirmed Saturday at 10 AM.',
      },
    ],
    transcript: undefined,
    recordingDurationSec: 55,
  },
  {
    id: 'L205',
    name: 'Greg Mitchell',
    phone: '(214) ***-3380',
    vehicleInterest: '2024 Cadillac Escalade ESV',
    attempts: 4,
    lastAction: 'closed',
    lastContactAt: '2026-05-09T14:00:00',
    isHot: false,
    callLog: [
      {
        id: 'e9',
        timestamp: '2026-05-04T15:30:00',
        direction: 'inbound',
        durationSec: 220,
        timeOfDay: 'business_hours',
        outcome: 'appointment_set',
        snippet: 'High-intent inquiry for Escalade ESV. Appointment Friday.',
      },
      {
        id: 'e10',
        timestamp: '2026-05-09T14:00:00',
        direction: 'inbound',
        durationSec: 145,
        timeOfDay: 'business_hours',
        outcome: 'closed',
        snippet: 'Customer purchased Escalade ESV. Cash deal. Title being processed.',
      },
    ],
    transcript:
      "Customer: I'd like to finalize the Escalade purchase today.\nVini: Excellent! Our team is ready for you. We'll have everything prepared.\nCustomer: Perfect. See you in an hour.",
    recordingDurationSec: 145,
  },
]

// ---------------------------------------------------------------------------
// D002 — Valley Motors leads
// ---------------------------------------------------------------------------

const D002_LEADS_2026_04_27: Lead[] = []

const D002_LEADS_2026_04_20: Lead[] = [
  {
    id: 'M001',
    name: 'Oscar Ruiz',
    phone: '(213) ***-4412',
    vehicleInterest: '2023 Toyota Highlander XLE',
    attempts: 2,
    lastAction: 'no_answer',
    lastContactAt: '2026-04-22T11:00:00',
    isHot: true,
    callLog: [
      {
        id: 'f1',
        timestamp: '2026-04-21T10:00:00',
        direction: 'outbound',
        durationSec: 0,
        timeOfDay: 'business_hours',
        outcome: 'no_answer',
        snippet: 'First outreach — no answer.',
      },
      {
        id: 'f2',
        timestamp: '2026-04-22T11:00:00',
        direction: 'outbound',
        durationSec: 0,
        timeOfDay: 'business_hours',
        outcome: 'no_answer',
        snippet: 'Second attempt — voicemail left.',
      },
    ],
  },
  {
    id: 'M002',
    name: 'Denise Walsh',
    phone: '(310) ***-8831',
    vehicleInterest: '2024 Ford Bronco Sport',
    attempts: 3,
    lastAction: 'callback_left',
    lastContactAt: '2026-04-23T14:15:00',
    isHot: true,
    callLog: [
      {
        id: 'f3',
        timestamp: '2026-04-21T09:00:00',
        direction: 'outbound',
        durationSec: 0,
        timeOfDay: 'business_hours',
        outcome: 'no_answer',
        snippet: 'No answer.',
      },
      {
        id: 'f4',
        timestamp: '2026-04-23T14:15:00',
        direction: 'inbound',
        durationSec: 115,
        timeOfDay: 'business_hours',
        outcome: 'callback_left',
        snippet: 'Returned call. Interested in Bronco Sport outer banks. Callback requested for tomorrow.',
      },
    ],
  },
  {
    id: 'M003',
    name: 'Patrick Lee',
    phone: '(818) ***-2290',
    vehicleInterest: '2024 Chevrolet Equinox EV',
    attempts: 2,
    lastAction: 'no_answer',
    lastContactAt: '2026-04-24T13:00:00',
    isHot: false,
    callLog: [
      {
        id: 'f5',
        timestamp: '2026-04-23T10:30:00',
        direction: 'outbound',
        durationSec: 0,
        timeOfDay: 'business_hours',
        outcome: 'no_answer',
        snippet: 'No answer.',
      },
      {
        id: 'f6',
        timestamp: '2026-04-24T13:00:00',
        direction: 'outbound',
        durationSec: 0,
        timeOfDay: 'business_hours',
        outcome: 'no_answer',
        snippet: 'No answer. Voicemail box full.',
      },
    ],
  },
]

const D002_LEADS_2026_04_13: Lead[] = [
  {
    id: 'N001',
    name: 'Carla Jimenez',
    phone: '(213) ***-5529',
    vehicleInterest: '2024 Honda Accord Sport',
    attempts: 2,
    lastAction: 'appointment_set',
    lastContactAt: '2026-04-15T10:00:00',
    appointmentAt: '2026-04-17T14:00:00',
    isHot: true,
    callLog: [
      {
        id: 'g1',
        timestamp: '2026-04-14T09:30:00',
        direction: 'outbound',
        durationSec: 140,
        timeOfDay: 'business_hours',
        outcome: 'appointment_set',
        snippet: 'Outbound call connected. Customer interested in Accord Sport. Thursday appointment confirmed.',
      },
      {
        id: 'g2',
        timestamp: '2026-04-15T10:00:00',
        direction: 'outbound',
        durationSec: 60,
        timeOfDay: 'business_hours',
        outcome: 'appointment_set',
        snippet: 'Reminder call. Appointment confirmed.',
      },
    ],
  },
  {
    id: 'N002',
    name: 'Jordan Bennett',
    phone: '(310) ***-7701',
    vehicleInterest: '2023 Lexus RX 350',
    attempts: 3,
    lastAction: 'demoed',
    lastContactAt: '2026-04-17T15:00:00',
    isHot: true,
    callLog: [
      {
        id: 'g3',
        timestamp: '2026-04-13T11:00:00',
        direction: 'outbound',
        durationSec: 165,
        timeOfDay: 'business_hours',
        outcome: 'appointment_set',
        snippet: 'Customer connected. Interested in RX 350 Premium. Saturday appointment.',
      },
      {
        id: 'g4',
        timestamp: '2026-04-17T15:00:00',
        direction: 'inbound',
        durationSec: 90,
        timeOfDay: 'business_hours',
        outcome: 'demoed',
        snippet: 'Post-test drive. Customer liked the vehicle, requesting lease quote.',
      },
    ],
  },
  {
    id: 'N003',
    name: 'Shirley Huang',
    phone: '(626) ***-4482',
    vehicleInterest: '2024 Toyota Venza XLE',
    attempts: 2,
    lastAction: 'closed',
    lastContactAt: '2026-04-19T13:00:00',
    isHot: false,
    callLog: [
      {
        id: 'g5',
        timestamp: '2026-04-14T10:00:00',
        direction: 'outbound',
        durationSec: 180,
        timeOfDay: 'business_hours',
        outcome: 'appointment_set',
        snippet: 'Customer very interested in Venza XLE. Test drive Friday.',
      },
      {
        id: 'g6',
        timestamp: '2026-04-19T13:00:00',
        direction: 'inbound',
        durationSec: 120,
        timeOfDay: 'business_hours',
        outcome: 'closed',
        snippet: 'Customer wants to buy. Paperwork scheduled.',
      },
    ],
  },
]

const D002_LEADS_2026_04_28: Lead[] = [
  {
    id: 'O001',
    name: 'Michael Torres',
    phone: '(213) ***-8843',
    vehicleInterest: '2024 Dodge Challenger GT',
    attempts: 2,
    lastAction: 'appointment_set',
    lastContactAt: '2026-04-30T10:30:00',
    appointmentAt: '2026-05-02T11:00:00',
    isHot: true,
    callLog: [
      {
        id: 'h1',
        timestamp: '2026-04-29T19:00:00',
        direction: 'inbound',
        durationSec: 160,
        timeOfDay: 'after_hours',
        outcome: 'appointment_set',
        snippet: 'After-hours inquiry about Challenger GT. Saturday appointment confirmed.',
      },
      {
        id: 'h2',
        timestamp: '2026-04-30T10:30:00',
        direction: 'outbound',
        durationSec: 80,
        timeOfDay: 'business_hours',
        outcome: 'appointment_set',
        snippet: 'Confirmation call. Customer confirmed.',
      },
    ],
  },
  {
    id: 'O002',
    name: 'Amber Collins',
    phone: '(310) ***-9920',
    vehicleInterest: '2023 Mercedes GLC 300',
    attempts: 3,
    lastAction: 'demoed',
    lastContactAt: '2026-05-01T14:00:00',
    isHot: true,
    callLog: [
      {
        id: 'h3',
        timestamp: '2026-04-28T10:00:00',
        direction: 'outbound',
        durationSec: 150,
        timeOfDay: 'business_hours',
        outcome: 'appointment_set',
        snippet: 'Outreach connected. GLC 300 test drive Thursday.',
      },
      {
        id: 'h4',
        timestamp: '2026-05-01T14:00:00',
        direction: 'inbound',
        durationSec: 100,
        timeOfDay: 'business_hours',
        outcome: 'demoed',
        snippet: 'Post-demo. Very interested. Comparing to the BMW X3.',
      },
    ],
  },
  {
    id: 'O003',
    name: 'Isaac Murphy',
    phone: '(818) ***-3371',
    vehicleInterest: '2024 Tesla Model Y Long Range',
    attempts: 2,
    lastAction: 'callback_left',
    lastContactAt: '2026-04-30T16:00:00',
    isHot: true,
    callLog: [
      {
        id: 'h5',
        timestamp: '2026-04-29T21:15:00',
        direction: 'inbound',
        durationSec: 135,
        timeOfDay: 'after_hours',
        outcome: 'callback_left',
        snippet: 'After-hours call. Interested in Model Y LR. Pricing callback requested.',
      },
      {
        id: 'h6',
        timestamp: '2026-04-30T16:00:00',
        direction: 'outbound',
        durationSec: 90,
        timeOfDay: 'business_hours',
        outcome: 'callback_left',
        snippet: 'Followed up with pricing. Customer reviewing. Will call back.',
      },
    ],
  },
]

const D002_LEADS_2026_04_06: Lead[] = [
  {
    id: 'P001',
    name: 'Elena Vasquez',
    phone: '(213) ***-6614',
    vehicleInterest: '2024 Honda HR-V Sport',
    attempts: 2,
    lastAction: 'appointment_set',
    lastContactAt: '2026-04-07T08:30:00',
    appointmentAt: '2026-04-09T10:00:00',
    isHot: true,
    callLog: [
      {
        id: 'q1',
        timestamp: '2026-04-06T20:45:00',
        direction: 'inbound',
        durationSec: 145,
        timeOfDay: 'after_hours',
        outcome: 'appointment_set',
        snippet: 'After-hours inquiry. HR-V Sport in Sonic Gray. Thursday appointment confirmed.',
      },
      {
        id: 'q2',
        timestamp: '2026-04-07T08:30:00',
        direction: 'outbound',
        durationSec: 0,
        timeOfDay: 'business_hours',
        outcome: 'no_answer',
        snippet: 'Confirmation attempt — no answer. Text confirmation sent.',
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// D003 — Peak Auto Center leads
// ---------------------------------------------------------------------------

const D003_LEADS_2026_04_27: Lead[] = [
  {
    id: 'Q001',
    name: 'Frank Nguyen',
    phone: '(203) ***-5512',
    vehicleInterest: '2024 Volvo XC90 Recharge',
    attempts: 2,
    lastAction: 'appointment_set',
    lastContactAt: '2026-04-28T09:00:00',
    appointmentAt: '2026-04-30T14:00:00',
    isHot: true,
    callLog: [
      {
        id: 'r1',
        timestamp: '2026-04-27T21:00:00',
        direction: 'inbound',
        durationSec: 195,
        timeOfDay: 'after_hours',
        outcome: 'appointment_set',
        snippet: 'Late night inquiry about XC90 Recharge. Wednesday 2 PM appointment confirmed.',
      },
      {
        id: 'r2',
        timestamp: '2026-04-28T09:00:00',
        direction: 'outbound',
        durationSec: 75,
        timeOfDay: 'business_hours',
        outcome: 'appointment_set',
        snippet: 'Morning confirmation. Customer confirmed appointment.',
      },
    ],
  },
  {
    id: 'Q002',
    name: 'Tanya Brooks',
    phone: '(860) ***-3398',
    vehicleInterest: '2023 Audi Q5 Premium',
    attempts: 3,
    lastAction: 'no_answer',
    lastContactAt: '2026-05-01T15:30:00',
    isHot: true,
    callLog: [
      {
        id: 'r3',
        timestamp: '2026-04-28T10:30:00',
        direction: 'outbound',
        durationSec: 0,
        timeOfDay: 'business_hours',
        outcome: 'no_answer',
        snippet: 'First outreach — no answer.',
      },
      {
        id: 'r4',
        timestamp: '2026-05-01T15:30:00',
        direction: 'outbound',
        durationSec: 0,
        timeOfDay: 'business_hours',
        outcome: 'no_answer',
        snippet: 'Third attempt — voicemail left.',
      },
    ],
  },
  {
    id: 'Q003',
    name: 'Louis Petrov',
    phone: '(203) ***-7723',
    vehicleInterest: '2024 Toyota Prius Prime',
    attempts: 2,
    lastAction: 'callback_left',
    lastContactAt: '2026-04-29T11:45:00',
    isHot: false,
    callLog: [
      {
        id: 'r5',
        timestamp: '2026-04-29T11:45:00',
        direction: 'inbound',
        durationSec: 115,
        timeOfDay: 'business_hours',
        outcome: 'callback_left',
        snippet: 'Customer called inquiring about Prius Prime plug-in range. Callback requested for pricing.',
      },
      {
        id: 'r6',
        timestamp: '2026-04-30T14:00:00',
        direction: 'outbound',
        durationSec: 0,
        timeOfDay: 'business_hours',
        outcome: 'no_answer',
        snippet: 'Follow-up call — no answer.',
      },
    ],
  },
]

const D003_LEADS_2026_04_13: Lead[] = [
  {
    id: 'S001',
    name: 'David Kowalski',
    phone: '(203) ***-1143',
    vehicleInterest: '2024 Ford Mustang GT',
    attempts: 2,
    lastAction: 'appointment_set',
    lastContactAt: '2026-04-14T11:00:00',
    appointmentAt: '2026-04-16T13:00:00',
    isHot: true,
    callLog: [
      {
        id: 's1',
        timestamp: '2026-04-13T10:00:00',
        direction: 'outbound',
        durationSec: 160,
        timeOfDay: 'business_hours',
        outcome: 'appointment_set',
        snippet: 'Outbound connected. Mustang GT in Race Red. Thursday appointment.',
      },
      {
        id: 's2',
        timestamp: '2026-04-14T11:00:00',
        direction: 'outbound',
        durationSec: 70,
        timeOfDay: 'business_hours',
        outcome: 'appointment_set',
        snippet: 'Confirmation. Customer confirmed Thursday.',
      },
    ],
  },
  {
    id: 'S002',
    name: 'Nina Fitzgerald',
    phone: '(860) ***-5512',
    vehicleInterest: '2023 BMW 3-Series 330i',
    attempts: 3,
    lastAction: 'demoed',
    lastContactAt: '2026-04-18T14:30:00',
    isHot: true,
    callLog: [
      {
        id: 's3',
        timestamp: '2026-04-13T14:00:00',
        direction: 'outbound',
        durationSec: 175,
        timeOfDay: 'business_hours',
        outcome: 'appointment_set',
        snippet: 'Outreach call. 330i xDrive in Alpine White. Friday appointment.',
      },
      {
        id: 's4',
        timestamp: '2026-04-18T14:30:00',
        direction: 'inbound',
        durationSec: 105,
        timeOfDay: 'business_hours',
        outcome: 'demoed',
        snippet: 'Post-demo follow-up. Loved the sport package. Reviewing lease vs buy.',
      },
    ],
  },
  {
    id: 'S003',
    name: 'Warren Scott',
    phone: '(203) ***-9980',
    vehicleInterest: '2024 Jeep Wrangler Rubicon',
    attempts: 2,
    lastAction: 'closed',
    lastContactAt: '2026-04-19T11:00:00',
    isHot: false,
    callLog: [
      {
        id: 's5',
        timestamp: '2026-04-14T09:00:00',
        direction: 'outbound',
        durationSec: 190,
        timeOfDay: 'business_hours',
        outcome: 'appointment_set',
        snippet: 'High intent. Wrangler Rubicon in Hydro Blue. Monday appointment.',
      },
      {
        id: 's6',
        timestamp: '2026-04-19T11:00:00',
        direction: 'inbound',
        durationSec: 135,
        timeOfDay: 'business_hours',
        outcome: 'closed',
        snippet: 'Customer purchasing Wrangler Rubicon. Cash deal.',
      },
    ],
  },
]

const D003_LEADS_2026_04_06: Lead[] = [
  {
    id: 'T001',
    name: 'Harriet Clark',
    phone: '(203) ***-4420',
    vehicleInterest: '2024 Lincoln Nautilus Reserve',
    attempts: 3,
    lastAction: 'appointment_set',
    lastContactAt: '2026-04-08T10:00:00',
    appointmentAt: '2026-04-10T14:00:00',
    isHot: true,
    callLog: [
      {
        id: 't1',
        timestamp: '2026-04-06T10:00:00',
        direction: 'outbound',
        durationSec: 200,
        timeOfDay: 'business_hours',
        outcome: 'appointment_set',
        snippet: 'Outbound connected. Lincoln Nautilus Reserve. Friday appointment.',
      },
      {
        id: 't2',
        timestamp: '2026-04-08T10:00:00',
        direction: 'outbound',
        durationSec: 85,
        timeOfDay: 'business_hours',
        outcome: 'appointment_set',
        snippet: 'Confirmation call. Confirmed Friday at 2 PM.',
      },
    ],
  },
  {
    id: 'T002',
    name: 'Preston Yates',
    phone: '(860) ***-6612',
    vehicleInterest: '2023 Cadillac CT5 Luxury',
    attempts: 4,
    lastAction: 'demoed',
    lastContactAt: '2026-04-11T15:00:00',
    isHot: true,
    callLog: [
      {
        id: 't3',
        timestamp: '2026-04-07T11:00:00',
        direction: 'outbound',
        durationSec: 155,
        timeOfDay: 'business_hours',
        outcome: 'appointment_set',
        snippet: 'CT5 Luxury in Stellar Black. Tuesday appointment.',
      },
      {
        id: 't4',
        timestamp: '2026-04-11T15:00:00',
        direction: 'inbound',
        durationSec: 115,
        timeOfDay: 'business_hours',
        outcome: 'demoed',
        snippet: 'Great test drive. Customer comparing to BMW 5-series.',
      },
    ],
  },
  {
    id: 'T003',
    name: 'Bridget O\'Neal',
    phone: '(203) ***-8871',
    vehicleInterest: '2024 Chevrolet Blazer EV RS',
    attempts: 2,
    lastAction: 'no_answer',
    lastContactAt: '2026-04-11T09:00:00',
    isHot: true,
    callLog: [
      {
        id: 't5',
        timestamp: '2026-04-08T09:30:00',
        direction: 'outbound',
        durationSec: 0,
        timeOfDay: 'business_hours',
        outcome: 'no_answer',
        snippet: 'No answer on first attempt.',
      },
      {
        id: 't6',
        timestamp: '2026-04-11T09:00:00',
        direction: 'outbound',
        durationSec: 0,
        timeOfDay: 'business_hours',
        outcome: 'no_answer',
        snippet: 'Second attempt — no answer.',
      },
    ],
  },
  {
    id: 'T004',
    name: 'Carl Whitmore',
    phone: '(860) ***-2241',
    vehicleInterest: '2024 Porsche Macan EV',
    attempts: 2,
    lastAction: 'closed',
    lastContactAt: '2026-04-12T14:00:00',
    isHot: false,
    callLog: [
      {
        id: 't7',
        timestamp: '2026-04-07T14:00:00',
        direction: 'outbound',
        durationSec: 245,
        timeOfDay: 'business_hours',
        outcome: 'appointment_set',
        snippet: 'High-value inquiry. Macan EV. Thursday appointment.',
      },
      {
        id: 't8',
        timestamp: '2026-04-12T14:00:00',
        direction: 'inbound',
        durationSec: 155,
        timeOfDay: 'business_hours',
        outcome: 'closed',
        snippet: 'Customer purchasing Macan EV. Finance approved.',
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// D004 — Metro Cars leads
// ---------------------------------------------------------------------------

const D004_LEADS_2026_04_27: Lead[] = [
  {
    id: 'U001',
    name: 'Samuel Knight',
    phone: '(720) ***-4411',
    vehicleInterest: '2024 Toyota Tundra TRD Pro',
    attempts: 3,
    lastAction: 'closed',
    lastContactAt: '2026-05-01T16:00:00',
    isHot: true,
    callLog: [
      {
        id: 'u1',
        timestamp: '2026-04-28T20:00:00',
        direction: 'inbound',
        durationSec: 215,
        timeOfDay: 'after_hours',
        outcome: 'appointment_set',
        snippet: 'After-hours call. Tundra TRD Pro in Army Green. Thursday appointment.',
      },
      {
        id: 'u2',
        timestamp: '2026-05-01T16:00:00',
        direction: 'inbound',
        durationSec: 130,
        timeOfDay: 'business_hours',
        outcome: 'closed',
        snippet: 'Purchased Tundra TRD Pro. Financing signed.',
      },
    ],
  },
  {
    id: 'U002',
    name: 'Holly Patterson',
    phone: '(303) ***-8823',
    vehicleInterest: '2023 BMW X5 xDrive40i',
    attempts: 2,
    lastAction: 'appointment_set',
    lastContactAt: '2026-04-29T10:00:00',
    appointmentAt: '2026-05-01T13:00:00',
    isHot: true,
    callLog: [
      {
        id: 'u3',
        timestamp: '2026-04-28T21:30:00',
        direction: 'inbound',
        durationSec: 185,
        timeOfDay: 'after_hours',
        outcome: 'appointment_set',
        snippet: 'After-hours. X5 xDrive40i in Carbon Black. Friday 1 PM appointment.',
      },
      {
        id: 'u4',
        timestamp: '2026-04-29T10:00:00',
        direction: 'outbound',
        durationSec: 65,
        timeOfDay: 'business_hours',
        outcome: 'appointment_set',
        snippet: 'Confirmed Friday appointment.',
      },
    ],
  },
  {
    id: 'U003',
    name: 'Diego Santos',
    phone: '(720) ***-6640',
    vehicleInterest: '2024 Ram 2500 Laramie',
    attempts: 4,
    lastAction: 'demoed',
    lastContactAt: '2026-04-30T14:30:00',
    isHot: true,
    callLog: [
      {
        id: 'u5',
        timestamp: '2026-04-27T11:00:00',
        direction: 'outbound',
        durationSec: 170,
        timeOfDay: 'business_hours',
        outcome: 'appointment_set',
        snippet: 'Outreach connected. Ram 2500 Laramie with diesel. Wednesday appointment.',
      },
      {
        id: 'u6',
        timestamp: '2026-04-30T14:30:00',
        direction: 'inbound',
        durationSec: 105,
        timeOfDay: 'business_hours',
        outcome: 'demoed',
        snippet: 'Post-demo. Customer very impressed with towing capacity. Wants lease quote.',
      },
    ],
  },
  {
    id: 'U004',
    name: 'Cecilia Burns',
    phone: '(303) ***-5591',
    vehicleInterest: '2024 Rivian R1T Adventure',
    attempts: 2,
    lastAction: 'callback_left',
    lastContactAt: '2026-04-29T19:00:00',
    isHot: true,
    callLog: [
      {
        id: 'u7',
        timestamp: '2026-04-29T19:00:00',
        direction: 'inbound',
        durationSec: 155,
        timeOfDay: 'after_hours',
        outcome: 'callback_left',
        snippet: 'After-hours call. Very interested in R1T. Requested callback Monday with availability and pricing.',
      },
      {
        id: 'u8',
        timestamp: '2026-04-30T09:00:00',
        direction: 'outbound',
        durationSec: 0,
        timeOfDay: 'business_hours',
        outcome: 'no_answer',
        snippet: 'Follow-up attempt — no answer.',
      },
    ],
  },
]

const D004_LEADS_2026_04_20: Lead[] = [
  {
    id: 'V001',
    name: 'Roy Crawford',
    phone: '(720) ***-1123',
    vehicleInterest: '2024 Chevrolet Silverado 1500 Z71',
    attempts: 3,
    lastAction: 'appointment_set',
    lastContactAt: '2026-04-22T10:30:00',
    appointmentAt: '2026-04-24T10:00:00',
    isHot: true,
    callLog: [
      {
        id: 'v1',
        timestamp: '2026-04-21T19:45:00',
        direction: 'inbound',
        durationSec: 175,
        timeOfDay: 'after_hours',
        outcome: 'appointment_set',
        snippet: 'After-hours. Silverado Z71 in Midnight Blue. Friday appointment confirmed.',
      },
      {
        id: 'v2',
        timestamp: '2026-04-22T10:30:00',
        direction: 'outbound',
        durationSec: 80,
        timeOfDay: 'business_hours',
        outcome: 'appointment_set',
        snippet: 'Confirmation call. Customer confirmed Friday at 10.',
      },
    ],
  },
  {
    id: 'V002',
    name: 'Penelope Shaw',
    phone: '(303) ***-7732',
    vehicleInterest: '2023 Volkswagen ID.4 Pro S',
    attempts: 2,
    lastAction: 'demoed',
    lastContactAt: '2026-04-25T15:00:00',
    isHot: true,
    callLog: [
      {
        id: 'v3',
        timestamp: '2026-04-22T11:00:00',
        direction: 'outbound',
        durationSec: 145,
        timeOfDay: 'business_hours',
        outcome: 'appointment_set',
        snippet: 'ID.4 Pro S in Moonstone Grey. Thursday appointment.',
      },
      {
        id: 'v4',
        timestamp: '2026-04-25T15:00:00',
        direction: 'inbound',
        durationSec: 95,
        timeOfDay: 'business_hours',
        outcome: 'demoed',
        snippet: 'Post-demo. Loved the range and cargo space. Reviewing federal EV credit eligibility.',
      },
    ],
  },
  {
    id: 'V003',
    name: 'Gerald Hudson',
    phone: '(720) ***-8801',
    vehicleInterest: '2024 Porsche Cayenne E-Hybrid',
    attempts: 4,
    lastAction: 'closed',
    lastContactAt: '2026-04-26T14:00:00',
    isHot: false,
    callLog: [
      {
        id: 'v5',
        timestamp: '2026-04-20T10:00:00',
        direction: 'inbound',
        durationSec: 250,
        timeOfDay: 'business_hours',
        outcome: 'appointment_set',
        snippet: 'Cayenne E-Hybrid in Mahogany. Wednesday appointment.',
      },
      {
        id: 'v6',
        timestamp: '2026-04-26T14:00:00',
        direction: 'inbound',
        durationSec: 160,
        timeOfDay: 'business_hours',
        outcome: 'closed',
        snippet: 'Purchased Cayenne E-Hybrid. Luxury deal closed.',
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Common email digest state
// ---------------------------------------------------------------------------

const COMMON_EMAIL_DIGEST = {
  nextSendAt: '2026-05-11T07:00:00',
  lastSentAt: '2026-05-04T07:00:00',
  lastSentStatus: 'delivered' as const,
}

// ---------------------------------------------------------------------------
// Campaign data
// ---------------------------------------------------------------------------

const CAMPAIGNS_D001_0427: CampaignSummary = {
  activeCampaigns: 2,
  totalLeadsTargeted: 73,
  totalLeadsContacted: 54,
  totalAppointments: 11,
  campaigns: [
    {
      id: 'cp1', name: 'Spring Sales Drive', type: 'conquest', status: 'active',
      leadsTargeted: 45, leadsContacted: 32, responseRate: 71, appointmentsBooked: 8,
      startDate: '2026-04-21',
    },
    {
      id: 'cp2', name: 'Service Follow-Up Q2', type: 'service_follow_up', status: 'completed',
      leadsTargeted: 28, leadsContacted: 22, responseRate: 79, appointmentsBooked: 3,
      startDate: '2026-04-14',
    },
  ],
}

const CAMPAIGNS_D001_0420: CampaignSummary = {
  activeCampaigns: 1,
  totalLeadsTargeted: 35,
  totalLeadsContacted: 28,
  totalAppointments: 6,
  campaigns: [
    {
      id: 'cp3', name: 'April Trade-In Push', type: 're_engagement', status: 'active',
      leadsTargeted: 35, leadsContacted: 28, responseRate: 80, appointmentsBooked: 6,
      startDate: '2026-04-15',
    },
  ],
}

const CAMPAIGNS_D001_0504: CampaignSummary = {
  activeCampaigns: 2,
  totalLeadsTargeted: 88,
  totalLeadsContacted: 61,
  totalAppointments: 14,
  campaigns: [
    {
      id: 'cp4', name: 'May BDC Blitz', type: 'bdc_follow_up', status: 'active',
      leadsTargeted: 55, leadsContacted: 38, responseRate: 69, appointmentsBooked: 9,
      startDate: '2026-05-01',
    },
    {
      id: 'cp5', name: 'Equity Mining Q2', type: 'equity_mining', status: 'active',
      leadsTargeted: 33, leadsContacted: 23, responseRate: 70, appointmentsBooked: 5,
      startDate: '2026-04-28',
    },
  ],
}

const CAMPAIGNS_D004_0427: CampaignSummary = {
  activeCampaigns: 3,
  totalLeadsTargeted: 180,
  totalLeadsContacted: 142,
  totalAppointments: 28,
  campaigns: [
    {
      id: 'cp6', name: 'Metro Conquest Spring', type: 'conquest', status: 'active',
      leadsTargeted: 80, leadsContacted: 65, responseRate: 81, appointmentsBooked: 14,
      startDate: '2026-04-20',
    },
    {
      id: 'cp7', name: 'Service Outreach Wave 2', type: 'service_follow_up', status: 'active',
      leadsTargeted: 60, leadsContacted: 48, responseRate: 80, appointmentsBooked: 9,
      startDate: '2026-04-21',
    },
    {
      id: 'cp8', name: 'Dormant Lead Re-Engagement', type: 're_engagement', status: 'completed',
      leadsTargeted: 40, leadsContacted: 29, responseRate: 73, appointmentsBooked: 5,
      startDate: '2026-04-14',
    },
  ],
}

const CAMPAIGNS_D004_0420: CampaignSummary = {
  activeCampaigns: 2,
  totalLeadsTargeted: 120,
  totalLeadsContacted: 94,
  totalAppointments: 18,
  campaigns: [
    {
      id: 'cp9', name: 'April Internet Lead BDC', type: 'bdc_follow_up', status: 'active',
      leadsTargeted: 70, leadsContacted: 56, responseRate: 80, appointmentsBooked: 11,
      startDate: '2026-04-14',
    },
    {
      id: 'cp10', name: 'Trade-Up Equity Program', type: 'equity_mining', status: 'active',
      leadsTargeted: 50, leadsContacted: 38, responseRate: 76, appointmentsBooked: 7,
      startDate: '2026-04-16',
    },
  ],
}

const CAMPAIGNS_D003_0406: CampaignSummary = {
  activeCampaigns: 2,
  totalLeadsTargeted: 95,
  totalLeadsContacted: 72,
  totalAppointments: 15,
  campaigns: [
    {
      id: 'cp11', name: 'Peak Conquest Q2', type: 'conquest', status: 'active',
      leadsTargeted: 55, leadsContacted: 42, responseRate: 76, appointmentsBooked: 9,
      startDate: '2026-04-01',
    },
    {
      id: 'cp12', name: 'Service Retention Drive', type: 'service_follow_up', status: 'completed',
      leadsTargeted: 40, leadsContacted: 30, responseRate: 75, appointmentsBooked: 6,
      startDate: '2026-03-31',
    },
  ],
}

const CAMPAIGNS_D003_0427_LOW: CampaignSummary = {
  activeCampaigns: 1,
  totalLeadsTargeted: 60,
  totalLeadsContacted: 38,
  totalAppointments: 2,
  campaigns: [
    {
      id: 'cp13', name: 'Spring Conquest (Underperforming)', type: 'conquest', status: 'active',
      leadsTargeted: 60, leadsContacted: 38, responseRate: 63, appointmentsBooked: 2,
      startDate: '2026-04-21',
    },
  ],
}

// ---------------------------------------------------------------------------
// Dataset map
// ---------------------------------------------------------------------------

type DatasetKey = `${string}:${string}`

function makeKey(dealerId: string, weekStart: string): DatasetKey {
  return `${dealerId}:${weekStart}` as DatasetKey
}

const DATASET: Map<DatasetKey, DealerWeekData> = new Map()

function register(data: DealerWeekData) {
  DATASET.set(makeKey(data.dealer.id, data.weekStartDate), data)
}

// --- D001:2026-04-27 ---
const d001_leads_0427 = D001_LEADS_2026_04_27
register({
  dealer: DEALERS[0],
  weekStartDate: '2026-04-27',
  callStats: {
    totalInbound: 42,
    totalOutbound: 18,
    afterHoursCount: 18,
    outcomes: { appointmentSet: 12, noAnswer: 22, callbackRequested: 8, other: 18 },
  },
  appointmentFunnel: { set: 12, showed: 8, demoed: 5, closed: 3 },
  leads: d001_leads_0427,
  afterHoursCalls: extractAfterHoursCalls(d001_leads_0427),
  insightCard: {
    text: 'Sunrise Auto Group handled 60 total calls the week of Apr 27–May 3, 2026 — 18 of those after hours. After-hours calls resulted in 8 appointments set. The full-week funnel: 12 appointments set, 8 showed, 5 demo\'d, and 3 closed. Ten hot leads received 24 outreach attempts. Callbacks were scheduled for 8 leads who weren\'t reachable on first contact.',
    isFallback: false,
    generatedAt: '2026-05-04T07:01:22',
  },
  emailDigest: COMMON_EMAIL_DIGEST,
  campaigns: CAMPAIGNS_D001_0427,
})

// --- D001:2026-04-20 ---
const d001_leads_0420 = D001_LEADS_2026_04_20
register({
  dealer: DEALERS[0],
  weekStartDate: '2026-04-20',
  callStats: {
    totalInbound: 38,
    totalOutbound: 22,
    afterHoursCount: 10,
    outcomes: { appointmentSet: 9, noAnswer: 18, callbackRequested: 6, other: 27 },
  },
  appointmentFunnel: { set: 9, showed: 6, demoed: 4, closed: 2 },
  leads: d001_leads_0420,
  afterHoursCalls: extractAfterHoursCalls(d001_leads_0420),
  insightCard: {
    text: 'Sunrise Auto Group handled 60 calls the week of Apr 20–26, 2026, including 10 after-hours calls. Nine appointments were set — 6 showed, 4 were demo\'d, and 2 closed. Eight hot leads were contacted with 19 total outreach attempts. Six callers requested callbacks and were followed up during business hours.',
    isFallback: false,
    generatedAt: '2026-04-27T07:01:09',
  },
  emailDigest: COMMON_EMAIL_DIGEST,
  campaigns: CAMPAIGNS_D001_0420,
})

// --- D001:2026-05-04 ---
const d001_leads_0504 = D001_LEADS_2026_05_04
register({
  dealer: DEALERS[0],
  weekStartDate: '2026-05-04',
  callStats: {
    totalInbound: 35,
    totalOutbound: 25,
    afterHoursCount: 8,
    outcomes: { appointmentSet: 14, noAnswer: 20, callbackRequested: 6, other: 20 },
  },
  appointmentFunnel: { set: 14, showed: 11, demoed: 8, closed: 5 },
  leads: d001_leads_0504,
  afterHoursCalls: extractAfterHoursCalls(d001_leads_0504),
  insightCard: {
    text: 'Sunrise Auto Group handled 60 calls the week of May 4–10, 2026, with 8 after-hours calls. This was a high-conversion week: 14 appointments set, 11 showed (79% show rate), 8 demo\'d, and 5 closed. Twelve hot leads received 28 outreach attempts. After-hours calls produced 4 of the 14 appointments set.',
    isFallback: false,
    generatedAt: '2026-05-11T07:01:45',
  },
  emailDigest: COMMON_EMAIL_DIGEST,
  campaigns: CAMPAIGNS_D001_0504,
})

// --- D002:2026-04-27 (zero calls) ---
register({
  dealer: DEALERS[1],
  weekStartDate: '2026-04-27',
  callStats: {
    totalInbound: 0,
    totalOutbound: 0,
    afterHoursCount: 0,
    outcomes: { appointmentSet: 0, noAnswer: 0, callbackRequested: 0, other: 0 },
  },
  appointmentFunnel: { set: 0, showed: 0, demoed: 0, closed: 0 },
  leads: D002_LEADS_2026_04_27,
  afterHoursCalls: [],
  insightCard: {
    text: "No call activity was recorded for Valley Motors the week of Apr 27–May 3, 2026. Zero inbound or outbound calls were handled. No leads were contacted and no appointments were set. If this is unexpected, please verify that Vini's phone integration is active.",
    isFallback: false,
    generatedAt: '2026-05-04T07:01:30',
  },
  emailDigest: COMMON_EMAIL_DIGEST,
})

// --- D002:2026-04-20 (zero appointments) ---
const d002_leads_0420 = D002_LEADS_2026_04_20
register({
  dealer: DEALERS[1],
  weekStartDate: '2026-04-20',
  callStats: {
    totalInbound: 25,
    totalOutbound: 10,
    afterHoursCount: 6,
    outcomes: { appointmentSet: 0, noAnswer: 25, callbackRequested: 6, other: 4 },
  },
  appointmentFunnel: { set: 0, showed: 0, demoed: 0, closed: 0 },
  leads: d002_leads_0420,
  afterHoursCalls: extractAfterHoursCalls(d002_leads_0420),
  insightCard: {
    text: 'Valley Motors received 35 calls the week of Apr 20–26, 2026 — 6 after hours. No appointments were set this week. Twenty-five calls ended without connection and 6 callers requested callbacks. Three hot leads were contacted with 8 outreach attempts.',
    isFallback: false,
    generatedAt: '2026-04-27T07:01:18',
  },
  emailDigest: COMMON_EMAIL_DIGEST,
})

// --- D002:2026-04-13 (zero after-hours) ---
const d002_leads_0413 = D002_LEADS_2026_04_13
register({
  dealer: DEALERS[1],
  weekStartDate: '2026-04-13',
  callStats: {
    totalInbound: 30,
    totalOutbound: 15,
    afterHoursCount: 0,
    outcomes: { appointmentSet: 8, noAnswer: 22, callbackRequested: 5, other: 10 },
  },
  appointmentFunnel: { set: 8, showed: 5, demoed: 3, closed: 2 },
  leads: d002_leads_0413,
  afterHoursCalls: [],
  insightCard: {
    text: 'Valley Motors handled 45 calls the week of Apr 13–19, 2026, all during business hours — no after-hours call activity this week. Eight appointments were set, 5 showed, 3 were demo\'d, and 2 closed. Six leads were contacted with 14 outreach attempts.',
    isFallback: false,
    generatedAt: '2026-04-20T07:01:05',
  },
  emailDigest: COMMON_EMAIL_DIGEST,
})

// --- D002:2026-04-28 (month boundary) ---
const d002_leads_0428 = D002_LEADS_2026_04_28
register({
  dealer: DEALERS[1],
  weekStartDate: '2026-04-28',
  callStats: {
    totalInbound: 32,
    totalOutbound: 18,
    afterHoursCount: 9,
    outcomes: { appointmentSet: 10, noAnswer: 20, callbackRequested: 8, other: 12 },
  },
  appointmentFunnel: { set: 10, showed: 7, demoed: 4, closed: 2 },
  leads: d002_leads_0428,
  afterHoursCalls: extractAfterHoursCalls(d002_leads_0428),
  insightCard: {
    text: 'Valley Motors handled 50 calls the week of Apr 28–May 4, 2026, including 9 after-hours calls. Ten appointments were set, 7 showed, 4 demo\'d, and 2 closed. Eight hot leads received 18 outreach attempts. The week spans the end of April and the start of May.',
    isFallback: false,
    generatedAt: '2026-05-05T07:01:22',
  },
  emailDigest: COMMON_EMAIL_DIGEST,
})

// --- D002:2026-04-06 (thin data) ---
const d002_leads_0406 = D002_LEADS_2026_04_06
register({
  dealer: DEALERS[1],
  weekStartDate: '2026-04-06',
  callStats: {
    totalInbound: 2,
    totalOutbound: 0,
    afterHoursCount: 1,
    outcomes: { appointmentSet: 1, noAnswer: 1, callbackRequested: 0, other: 0 },
  },
  appointmentFunnel: { set: 1, showed: 1, demoed: 0, closed: 0 },
  leads: d002_leads_0406,
  afterHoursCalls: extractAfterHoursCalls(d002_leads_0406),
  insightCard: {
    text: 'Valley Motors had minimal call activity the week of Apr 6–12, 2026 — only 2 inbound calls recorded. One call occurred after hours and resulted in an appointment. The other call went unanswered. One lead was contacted with 2 attempts.',
    isFallback: false,
    generatedAt: '2026-04-13T07:00:58',
  },
  emailDigest: COMMON_EMAIL_DIGEST,
})

// --- D003:2026-04-27 (near-zero conversion) ---
const d003_leads_0427 = D003_LEADS_2026_04_27
register({
  dealer: DEALERS[2],
  weekStartDate: '2026-04-27',
  callStats: {
    totalInbound: 55,
    totalOutbound: 35,
    afterHoursCount: 14,
    outcomes: { appointmentSet: 3, noAnswer: 70, callbackRequested: 10, other: 7 },
  },
  appointmentFunnel: { set: 3, showed: 1, demoed: 0, closed: 0 },
  leads: d003_leads_0427,
  afterHoursCalls: extractAfterHoursCalls(d003_leads_0427),
  insightCard: {
    text: 'Peak Auto Center handled 90 calls the week of Apr 27–May 3, 2026 — 14 after hours. Despite high call volume, only 3 appointments were set and 1 showed. Seventy calls ended without connection. Ten callers requested callbacks. Five hot leads received 12 outreach attempts.',
    isFallback: false,
    generatedAt: '2026-05-04T07:01:11',
  },
  emailDigest: COMMON_EMAIL_DIGEST,
  campaigns: CAMPAIGNS_D003_0427_LOW,
})

// --- D003:2026-04-13 (zero inbound, all outbound) ---
const d003_leads_0413 = D003_LEADS_2026_04_13
register({
  dealer: DEALERS[2],
  weekStartDate: '2026-04-13',
  callStats: {
    totalInbound: 0,
    totalOutbound: 40,
    afterHoursCount: 0,
    outcomes: { appointmentSet: 8, noAnswer: 28, callbackRequested: 4, other: 0 },
  },
  appointmentFunnel: { set: 8, showed: 5, demoed: 3, closed: 2 },
  leads: d003_leads_0413,
  afterHoursCalls: [],
  insightCard: {
    text: 'Peak Auto Center ran a fully outbound week of Apr 13–19, 2026 — 40 outbound calls placed, zero inbound. Eight appointments were set from outbound efforts, 5 showed, 3 demo\'d, and 2 closed. All activity was during business hours.',
    isFallback: false,
    generatedAt: '2026-04-20T07:01:02',
  },
  emailDigest: COMMON_EMAIL_DIGEST,
})

// --- D003:2026-04-06 (high volume) ---
const d003_leads_0406 = D003_LEADS_2026_04_06
register({
  dealer: DEALERS[2],
  weekStartDate: '2026-04-06',
  callStats: {
    totalInbound: 87,
    totalOutbound: 43,
    afterHoursCount: 23,
    outcomes: { appointmentSet: 25, noAnswer: 65, callbackRequested: 22, other: 18 },
  },
  appointmentFunnel: { set: 25, showed: 17, demoed: 11, closed: 6 },
  leads: d003_leads_0406,
  afterHoursCalls: extractAfterHoursCalls(d003_leads_0406),
  insightCard: {
    text: 'Peak Auto Center handled 130 calls the week of Apr 6–12, 2026, including 23 after-hours calls. Twenty-five appointments were set, 17 showed (68% show rate), 11 demo\'d, and 6 closed. Eighteen hot leads received 42 outreach attempts. Twenty-two callers requested callbacks.',
    isFallback: false,
    generatedAt: '2026-04-13T07:01:07',
  },
  emailDigest: COMMON_EMAIL_DIGEST,
  campaigns: CAMPAIGNS_D003_0406,
})

// --- D004:2026-04-27 (very high volume) ---
const d004_leads_0427 = D004_LEADS_2026_04_27
register({
  dealer: DEALERS[3],
  weekStartDate: '2026-04-27',
  callStats: {
    totalInbound: 100,
    totalOutbound: 50,
    afterHoursCount: 40,
    outcomes: { appointmentSet: 35, noAnswer: 80, callbackRequested: 25, other: 10 },
  },
  appointmentFunnel: { set: 35, showed: 22, demoed: 15, closed: 8 },
  leads: d004_leads_0427,
  afterHoursCalls: extractAfterHoursCalls(d004_leads_0427),
  insightCard: {
    text: 'Metro Cars handled 150 calls the week of Apr 27–May 3, 2026 — 40 after hours. Thirty-five appointments were set, 22 showed (63% show rate), 15 demo\'d, and 8 closed. Thirty hot leads received 75 outreach attempts. After-hours calls contributed significantly to the appointment volume.',
    isFallback: false,
    generatedAt: '2026-05-04T07:01:38',
  },
  emailDigest: COMMON_EMAIL_DIGEST,
  campaigns: CAMPAIGNS_D004_0427,
})

// --- D004:2026-04-20 (50 hot leads) ---
const d004_leads_0420 = D004_LEADS_2026_04_20
register({
  dealer: DEALERS[3],
  weekStartDate: '2026-04-20',
  callStats: {
    totalInbound: 60,
    totalOutbound: 45,
    afterHoursCount: 20,
    outcomes: { appointmentSet: 22, noAnswer: 55, callbackRequested: 18, other: 10 },
  },
  appointmentFunnel: { set: 22, showed: 15, demoed: 10, closed: 5 },
  leads: d004_leads_0420,
  afterHoursCalls: extractAfterHoursCalls(d004_leads_0420),
  insightCard: {
    text: 'Metro Cars handled 105 calls the week of Apr 20–26, 2026, including 20 after-hours calls. Twenty-two appointments were set from 50 hot leads contacted — 120 total outreach attempts. Fifteen showed, 10 demo\'d, and 5 closed.',
    isFallback: false,
    generatedAt: '2026-04-27T07:01:20',
  },
  emailDigest: COMMON_EMAIL_DIGEST,
  campaigns: CAMPAIGNS_D004_0420,
})

// ---------------------------------------------------------------------------
// Public exports
// ---------------------------------------------------------------------------

export const AVAILABLE_WEEKS: string[] = Array.from(
  new Set(Array.from(DATASET.keys()).map(k => k.split(':')[1]))
).sort()

export const DEALER_WEEKS: Record<string, string[]> = DEALERS.reduce<Record<string, string[]>>(
  (acc, d) => {
    acc[d.id] = Array.from(DATASET.keys())
      .filter(k => k.startsWith(d.id + ':'))
      .map(k => k.split(':')[1])
      .sort()
    return acc
  },
  {}
)

const FALLBACK_KEY = makeKey('D001', '2026-04-27')

export function getMockData(dealerId: string, weekStart: string): DealerWeekData {
  const key = makeKey(dealerId, weekStart)
  const data = DATASET.get(key)
  if (!data) {
    console.warn(
      `[mockData] No data for ${key}, falling back to D001:2026-04-27`
    )
    return DATASET.get(FALLBACK_KEY)!
  }
  return data
}
