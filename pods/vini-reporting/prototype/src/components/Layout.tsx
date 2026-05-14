import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Phone,
  Users,
  Mail,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { Dealer } from '../types'
import StoreSwitcher from './StoreSwitcher'
import WeekPicker from './WeekPicker'

interface LayoutProps {
  children: React.ReactNode
  dealers: Dealer[]
  selectedDealerId: string
  weekStart: string
  onDealerChange: (id: string) => void
  onWeekChange: (weekStart: string) => void
  availableWeeks: string[]
}

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard, exact: true },
  { label: 'After Hours', to: '/after-hours', icon: Phone, exact: false },
  { label: 'Lead Activity', to: '/leads', icon: Users, exact: false },
  { label: 'Email Digest', to: '/email-digest', icon: Mail, exact: false },
]

const COLLAPSE_KEY = 'vini.sidebar.collapsed'

export default function Layout({
  children,
  dealers,
  selectedDealerId,
  weekStart,
  onDealerChange,
  onWeekChange,
  availableWeeks,
}: LayoutProps) {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(COLLAPSE_KEY) === '1'
  })

  useEffect(() => {
    window.localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0')
  }, [collapsed])

  const selectedDealer = dealers.find((d) => d.id === selectedDealerId) ?? dealers[0]

  return (
    <div className="flex h-screen bg-gradient-to-br from-orange-50/50 via-white to-amber-50/40 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`flex-shrink-0 flex flex-col h-full transition-[width] duration-200 ease-out bg-white border-r border-slate-200/80 shadow-[1px_0_0_rgba(15,23,42,0.02)] ${
          collapsed ? 'w-[68px]' : 'w-60'
        }`}
      >
        {/* Logo */}
        <div
          className={`flex items-center gap-3 px-4 py-5 border-b border-slate-100 ${
            collapsed ? 'justify-center px-2' : ''
          }`}
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 shadow-sm shadow-orange-200 flex items-center justify-center flex-shrink-0 ring-1 ring-orange-300/40">
            <span className="text-white font-bold text-sm tracking-tight">V</span>
          </div>
          {!collapsed && (
            <div className="min-w-0 overflow-hidden">
              <p className="text-slate-900 font-semibold text-sm leading-none tracking-tight">Vini</p>
              <p className="text-orange-600/80 text-xs mt-1 truncate">ROI Dashboard</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className={`flex-1 py-4 flex flex-col gap-1 ${collapsed ? 'px-2' : 'px-3'}`}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `group relative flex items-center rounded-lg text-sm font-medium transition-all duration-150 ${
                    collapsed ? 'justify-center h-10 w-10 mx-auto' : 'gap-3 px-3 py-2'
                  } ${
                    isActive
                      ? 'bg-orange-50 text-orange-700'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && !collapsed && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r-full bg-gradient-to-b from-orange-400 to-orange-600" />
                    )}
                    {isActive && collapsed && (
                      <span className="absolute -left-2 top-2 bottom-2 w-0.5 rounded-r-full bg-gradient-to-b from-orange-400 to-orange-600" />
                    )}
                    <Icon
                      className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${
                        isActive ? 'text-orange-600' : 'group-hover:text-slate-700'
                      }`}
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Collapse toggle */}
        <div
          className={`border-t border-slate-100 ${
            collapsed ? 'px-2 py-3 flex justify-center' : 'px-3 py-3 flex items-center justify-between'
          }`}
        >
          {!collapsed && (
            <p className="text-slate-400 text-[11px] uppercase tracking-wider font-medium">
              v0.1
            </p>
          )}
          <button
            onClick={() => setCollapsed((v) => !v)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
          >
            {collapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/70 px-6 py-3 flex items-center justify-between gap-4 flex-shrink-0">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-slate-900 truncate tracking-tight">
              {selectedDealer.name}
            </h1>
            <p className="text-sm text-slate-500 truncate">{selectedDealer.address}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <StoreSwitcher
              dealers={dealers}
              selectedId={selectedDealerId}
              onDealerChange={onDealerChange}
            />
            <WeekPicker weekStart={weekStart} onChange={onWeekChange} availableWeeks={availableWeeks} />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
