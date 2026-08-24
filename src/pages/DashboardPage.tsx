import { ArrowDownLeft, ArrowUpRight, CalendarDays, MoreHorizontal, Plus, TrendingUp } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Panel } from '../components/ui/Card'

const metrics = [
  { label: 'Net balance', value: '$12,480.00', change: '+8.4%', icon: TrendingUp },
  { label: 'Income this month', value: '$4,280.00', change: '+12.1%', icon: ArrowDownLeft },
  { label: 'Expenses this month', value: '$1,842.60', change: '-3.2%', icon: ArrowUpRight },
]

interface DashboardPageProps {
  isLightTheme?: boolean
}

export function DashboardPage({ isLightTheme = false }: DashboardPageProps) {
  const panelClassName = isLightTheme ? 'border-[#D4D4D8] bg-white' : ''
  const headingClassName = isLightTheme ? 'text-[#18181B]' : 'text-white'
  const secondaryClassName = isLightTheme ? 'text-[#52525B]' : 'text-[#A1A1AA]'
  const mutedClassName = 'text-[#71717A]'
  return (
    <div className="min-w-0 animate-screen-enter space-y-6 sm:space-y-8">
      <div className="flex items-end justify-between gap-3 sm:gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#71717A]">Overview</p>
          <h1 className={`mt-2 text-2xl font-bold tracking-tight sm:text-3xl ${headingClassName}`}>Good morning</h1>
          <p className={`mt-2 text-sm ${secondaryClassName}`}>Your local financial picture at a glance.</p>
        </div>
        <Button variant="secondary" title="This month" aria-label="This month" className="shrink-0 px-3 sm:px-4"><CalendarDays className="h-4 w-4" /><span className="hidden sm:inline">This month</span></Button>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Financial summary">
        {metrics.map(({ label, value, change, icon: Icon }) => (
          <Panel key={label} className={`group transition-colors hover:border-[#3F3F46] ${panelClassName}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#71717A]">{label}</span>
              <Icon className="h-4 w-4 text-[#71717A]" />
            </div>
            <p className={`mt-6 font-mono text-2xl font-bold ${headingClassName}`}>{value}</p>
            <p className={`mt-2 text-xs ${secondaryClassName}`}><span className={headingClassName}>{change}</span> from last month</p>
          </Panel>
        ))}
      </section>

      <section className="grid min-w-0 gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Panel className={panelClassName}>
          <div className="flex items-center justify-between">
            <div className="min-w-0"><h2 className={`font-bold ${headingClassName}`}>Cash flow</h2><p className={`mt-1 truncate text-xs ${mutedClassName}`}>Income and expenses over the last 30 days</p></div>
            <Button variant="ghost" title="More cash flow options" aria-label="More cash flow options" className="shrink-0 px-2"><MoreHorizontal className="h-4 w-4" /></Button>
          </div>
          <div className={`mt-8 flex h-48 items-end gap-2 border-b px-2 pb-0 ${isLightTheme ? 'border-[#D4D4D8]' : 'border-[#27272A]'}`}>
            {[36, 52, 44, 70, 58, 82, 64, 92, 74, 100, 78, 88].map((height, index) => <div key={index} className={`flex-1 rounded-t transition-colors hover:bg-[#3B82F6] ${isLightTheme ? 'bg-[#A1A1AA]' : 'bg-[#3F3F46]'}`} style={{ height: `${height}%` }} />)}
          </div>
          <div className="mt-4 flex justify-between text-[10px] uppercase tracking-[0.12em] text-[#71717A]"><span>Jun 01</span><span>Jun 30</span></div>
        </Panel>
        <Panel className={panelClassName}>
          <div className="flex items-center justify-between gap-3"><div className="min-w-0"><h2 className={`font-bold ${headingClassName}`}>Recent transactions</h2><p className={`mt-1 truncate text-xs ${mutedClassName}`}>Latest activity in your ledger</p></div><Button variant="ghost" className="shrink-0 px-2 text-xs">View all</Button></div>
          <div className="mt-5 space-y-1">
            {[['Workspace tools', '-$84.00', 'Today'], ['Client payment', '+$1,200.00', 'Yesterday'], ['Office supplies', '-$126.40', 'Jun 25']].map(([name, amount, date]) => <div key={name} className={`flex items-center justify-between rounded-lg px-2 py-3 transition-colors ${isLightTheme ? 'hover:bg-[#F4F4F5]' : 'hover:bg-[#1E1E24]'}`}><div><p className={`text-sm ${headingClassName}`}>{name}</p><p className={`mt-1 text-xs ${mutedClassName}`}>{date}</p></div><span className={`font-mono text-sm ${amount.startsWith('+') ? headingClassName : secondaryClassName}`}>{amount}</span></div>)}
          </div>
          <Button variant="secondary" className="mt-4 w-full"><Plus className="h-4 w-4" />Add transaction</Button>
        </Panel>
      </section>
    </div>
  )
}
