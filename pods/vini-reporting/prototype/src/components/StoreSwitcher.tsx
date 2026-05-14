import { ChevronDown } from 'lucide-react'
import { Dealer } from '../types'

interface StoreSwitcherProps {
  dealers: Dealer[]
  selectedId: string
  onDealerChange: (id: string) => void
}

export default function StoreSwitcher({
  dealers,
  selectedId,
  onDealerChange,
}: StoreSwitcherProps) {
  return (
    <div className="relative inline-flex items-center">
      <select
        value={selectedId}
        onChange={(e) => onDealerChange(e.target.value)}
        className="appearance-none border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-sm bg-white text-slate-700 font-medium cursor-pointer hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-colors"
      >
        {dealers.map((dealer) => (
          <option key={dealer.id} value={dealer.id}>
            {dealer.name}
          </option>
        ))}
      </select>
      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
    </div>
  )
}
