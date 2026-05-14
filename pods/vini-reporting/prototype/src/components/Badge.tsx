import React from 'react'

type BadgeVariant = 'green' | 'yellow' | 'red' | 'gray' | 'blue' | 'violet'

interface BadgeProps {
  variant: BadgeVariant
  children: React.ReactNode
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  green: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  yellow: 'bg-amber-50 text-amber-700 border border-amber-200',
  red: 'bg-red-50 text-red-600 border border-red-200',
  gray: 'bg-slate-100 text-slate-600 border border-slate-200',
  blue: 'bg-orange-50 text-orange-700 border border-orange-200',
  violet: 'bg-amber-50 text-amber-700 border border-amber-200',
}

export default function Badge({ variant, children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${VARIANT_CLASSES[variant]}`}
    >
      {children}
    </span>
  )
}
