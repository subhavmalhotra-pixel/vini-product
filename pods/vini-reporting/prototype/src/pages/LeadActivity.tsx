import { useState } from 'react'
import { Flame, Phone, CalendarCheck } from 'lucide-react'
import { useWeekData } from '../hooks/useWeekData'
import MetricCard from '../components/MetricCard'
import LeadsTable from '../components/LeadsTable'
import LeadDrawer from '../components/LeadDrawer'
import { Lead } from '../types'

interface LeadActivityProps {
  dealerId: string
  weekStart: string
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex flex-col gap-2">
          <div className="h-4 w-28 bg-slate-200 rounded" />
          <div className="h-8 w-16 bg-slate-200 rounded" />
        </div>
        <div className="w-10 h-10 bg-slate-200 rounded-lg" />
      </div>
      <div className="h-3 w-32 bg-slate-200 rounded" />
    </div>
  )
}

export default function LeadActivity({ dealerId, weekStart }: LeadActivityProps) {
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

  const hotLeads = data?.leads.filter((l) => l.isHot) ?? []
  const totalAttempts = data?.leads.reduce((sum, l) => sum + l.attempts, 0) ?? 0
  const apptFromLeads = data?.leads.filter(
    (l) => l.lastAction === 'appointment_set' || l.lastAction === 'demoed' || l.lastAction === 'closed'
  ).length ?? 0

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Page header */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Lead Activity</h2>
          <p className="text-sm text-slate-400 mt-1">
            All leads contacted this week, with full outreach history
          </p>
        </div>

        {/* Stats */}
        {loading || !data ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <MetricCard
                label="Hot Leads Contacted"
                value={hotLeads.length}
                subtext={`${data.leads.length} total leads this week`}
                icon={<Flame className="w-5 h-5 text-orange-500" />}
                iconBg="bg-orange-100"
              />
              <MetricCard
                label="Total Outreach Attempts"
                value={totalAttempts}
                subtext={
                  data.leads.length > 0
                    ? `${(totalAttempts / data.leads.length).toFixed(1)} avg per lead`
                    : 'No leads'
                }
                icon={<Phone className="w-5 h-5 text-orange-600" />}
                iconBg="bg-orange-100"
              />
              <MetricCard
                label="Appointments From Leads"
                value={apptFromLeads}
                subtext={
                  data.leads.length > 0
                    ? `${Math.round((apptFromLeads / data.leads.length) * 100)}% conversion`
                    : 'No leads'
                }
                icon={<CalendarCheck className="w-5 h-5 text-emerald-600" />}
                iconBg="bg-emerald-100"
              />
            </div>

            <LeadsTable leads={data.leads} onLeadClick={setSelectedLead} />
          </>
        )}
      </div>

      <LeadDrawer lead={selectedLead} onClose={() => setSelectedLead(null)} />
    </>
  )
}
