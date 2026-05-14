import { useState } from 'react'
import { Phone, Moon, CalendarCheck, TrendingUp } from 'lucide-react'
import { useWeekData } from '../hooks/useWeekData'
import MetricCard from '../components/MetricCard'
import AppointmentFunnel from '../components/AppointmentFunnel'
import InsightCard from '../components/InsightCard'
import LeadsTable from '../components/LeadsTable'
import LeadDrawer from '../components/LeadDrawer'
import CallsTable from '../components/CallsTable'
import { Lead } from '../types'

interface DashboardProps {
  dealerId: string
  weekStart: string
}

function pct(n: number, d: number): string {
  if (d === 0) return '—'
  return Math.round((n / d) * 100) + '%'
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex flex-col gap-2">
          <div className="h-4 w-24 bg-slate-200 rounded" />
          <div className="h-8 w-16 bg-slate-200 rounded" />
        </div>
        <div className="w-10 h-10 bg-slate-200 rounded-lg" />
      </div>
      <div className="h-3 w-32 bg-slate-200 rounded mt-2" />
    </div>
  )
}

export default function Dashboard({ dealerId, weekStart }: DashboardProps) {
  const { data, loading, error } = useWeekData(dealerId, weekStart)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <p className="text-red-700 font-medium">Failed to load data</p>
        <p className="text-red-500 text-sm mt-1">{error}</p>
      </div>
    )
  }

  if (loading || !data) {
    return (
      <div className="flex flex-col gap-6">
        {/* Metric cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        {/* Insight skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 animate-pulse">
          <div className="h-5 w-36 bg-slate-200 rounded mb-4" />
          <div className="flex flex-col gap-2">
            <div className="h-4 bg-slate-200 rounded w-full" />
            <div className="h-4 bg-slate-200 rounded w-5/6" />
            <div className="h-4 bg-slate-200 rounded w-4/6" />
          </div>
        </div>
      </div>
    )
  }

  const { callStats, appointmentFunnel, leads, afterHoursCalls, insightCard } = data
  const totalCalls = callStats.totalInbound + callStats.totalOutbound
  const afterHoursPct = totalCalls > 0
    ? Math.round((callStats.afterHoursCount / totalCalls) * 100) + '%'
    : '—'
  const showRate = pct(appointmentFunnel.showed, appointmentFunnel.set)
  const hotLeads = leads.filter((l) => l.isHot)

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Row 1: Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard
            label="Total Calls"
            value={totalCalls}
            subtext={`${callStats.totalInbound} inbound · ${callStats.totalOutbound} outbound`}
            icon={<Phone className="w-5 h-5 text-orange-600" />}
            iconBg="bg-orange-100"
          />
          <MetricCard
            label="After-Hours Calls"
            value={callStats.afterHoursCount}
            subtext={`${afterHoursPct} of total`}
            icon={<Moon className="w-5 h-5 text-amber-600" />}
            iconBg="bg-amber-100"
          />
          <MetricCard
            label="Appointments Set"
            value={appointmentFunnel.set}
            subtext={`${appointmentFunnel.showed} showed (${showRate})`}
            icon={<CalendarCheck className="w-5 h-5 text-emerald-600" />}
            iconBg="bg-emerald-100"
          />
          <MetricCard
            label="Deals Closed"
            value={appointmentFunnel.closed}
            subtext={`${appointmentFunnel.demoed} demo'd · ${appointmentFunnel.closed} closed`}
            icon={<TrendingUp className="w-5 h-5 text-amber-600" />}
            iconBg="bg-amber-100"
          />
        </div>

        {/* Row 2: Funnel + Insight */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 xl:col-span-7">
            <AppointmentFunnel funnel={appointmentFunnel} />
          </div>
          <div className="col-span-12 xl:col-span-5">
            <InsightCard insightCard={insightCard} loading={false} />
          </div>
        </div>

        {/* Row 3: After-Hours + Hot Leads */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 xl:col-span-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-lg font-semibold text-slate-800">After-Hours Activity</h3>
              </div>
              <CallsTable calls={afterHoursCalls.slice(0, 5)} />
            </div>
          </div>
          <div className="col-span-12 xl:col-span-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">Hot Leads</h3>
                <span className="text-xs text-slate-400 font-medium">{hotLeads.length} this week</span>
              </div>
              <LeadsTable
                leads={hotLeads.slice(0, 5)}
                onLeadClick={setSelectedLead}
              />
            </div>
          </div>
        </div>
      </div>

      <LeadDrawer lead={selectedLead} onClose={() => setSelectedLead(null)} />
    </>
  )
}
