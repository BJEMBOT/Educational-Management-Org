import { Building2, GraduationCap, AlertTriangle, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PortfolioSummary({
  districtCount,
  schoolCount,
  totalEnrollment,
  openInterventions,
  schoolsNeedingAttention,
}: {
  districtCount: number
  schoolCount: number
  totalEnrollment: number
  openInterventions: number
  schoolsNeedingAttention: number
}) {
  const stats = [
    {
      label: 'Districts',
      value: districtCount,
      detail: 'Across the network',
      icon: Building2,
      iconClass: 'text-primary bg-primary/10',
    },
    {
      label: 'Schools',
      value: schoolCount,
      detail: `${totalEnrollment.toLocaleString()} students enrolled`,
      icon: GraduationCap,
      iconClass: 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300',
    },
    {
      label: 'Open Interventions',
      value: openInterventions,
      detail: 'Active support plans',
      icon: AlertTriangle,
      iconClass: 'text-amber-700 bg-amber-100 dark:bg-amber-950 dark:text-amber-400',
    },
    {
      label: 'Need Attention',
      value: schoolsNeedingAttention,
      detail: 'At risk or off track',
      icon: TrendingDown,
      iconClass: 'text-red-700 bg-red-100 dark:bg-red-950 dark:text-red-400',
    },
  ] as const

  return (
    <div className="overflow-hidden rounded-xl border bg-gradient-to-br from-muted/30 via-card to-card shadow-sm">
      <div className="grid divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={cn(
              'flex items-center gap-4 px-5 py-4',
              i === 0 && 'sm:rounded-tl-xl lg:rounded-none',
            )}
          >
            <div
              className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                stat.iconClass
              )}
            >
              <stat.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </p>
              <p className="text-3xl font-bold tabular-nums tracking-tight">
                {stat.value}
              </p>
              <p className="truncate text-xs text-muted-foreground">{stat.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
