import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string | number
  subtext?: string
  trend?: 'up' | 'down' | 'neutral'
  trendLabel?: string
  icon: React.ReactNode
  iconBg?: string
}

export default function MetricCard({
  label,
  value,
  subtext,
  trend,
  trendLabel,
  icon,
  iconBg = 'bg-orange-100',
}: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-slate-500 font-medium">{label}</span>
          <span className="text-3xl font-bold text-slate-900 leading-none">{value}</span>
        </div>
        <div className={`${iconBg} p-2.5 rounded-lg flex-shrink-0`}>{icon}</div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {subtext && (
          <span className="text-sm text-slate-400">{subtext}</span>
        )}
        {trend && trendLabel && (
          <span
            className={`flex items-center gap-0.5 text-sm font-medium ${
              trend === 'up'
                ? 'text-emerald-600'
                : trend === 'down'
                ? 'text-red-500'
                : 'text-slate-400'
            }`}
          >
            {trend === 'up' ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : trend === 'down' ? (
              <TrendingDown className="w-3.5 h-3.5" />
            ) : (
              <Minus className="w-3.5 h-3.5" />
            )}
            {trendLabel}
          </span>
        )}
      </div>
    </div>
  )
}
