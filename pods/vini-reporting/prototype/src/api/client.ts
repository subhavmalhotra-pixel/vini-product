// API client — replace these implementations with real fetch/axios calls to connect the backend.
// All function signatures must stay the same.

import { DealerWeekData, Dealer } from '../types'
import { DEALERS, getMockData } from '../data/mockData'

export async function fetchDealers(): Promise<Dealer[]> {
  // Replace: GET /api/dealers
  return Promise.resolve(DEALERS)
}

export async function fetchWeekData(dealerId: string, weekStart: string): Promise<DealerWeekData> {
  // Replace: GET /api/dealers/:dealerId/weeks/:weekStart
  await new Promise(r => setTimeout(r, 600)) // simulate network latency
  return getMockData(dealerId, weekStart)
}

export async function sendEmailDigestNow(
  dealerId: string,
  weekStart: string
): Promise<{ success: boolean; sentAt: string }> {
  // Replace: POST /api/dealers/:dealerId/weeks/:weekStart/email-digest/send
  await new Promise(r => setTimeout(r, 1200))
  return { success: true, sentAt: new Date().toISOString() }
}
