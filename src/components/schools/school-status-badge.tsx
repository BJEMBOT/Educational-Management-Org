import { Badge } from '@/components/ui/badge'
import { healthLabels } from '@/lib/school-health'
import type { GoalStatus, SchoolHealth } from '@/lib/database.types'
import { cn } from '@/lib/utils'

const healthStyles: Record<SchoolHealth, string> = {
  healthy: 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-50',
  at_risk: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-50',
  off_track: 'bg-red-50 text-red-800 border-red-200 hover:bg-red-50',
}

const goalStatusStyles: Record<GoalStatus, string> = {
  on_track: 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-50',
  at_risk: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-50',
  off_track: 'bg-red-50 text-red-800 border-red-200 hover:bg-red-50',
}

export function SchoolStatusBadge({ status }: { status: SchoolHealth }) {
  return (
    <Badge variant="outline" className={cn(healthStyles[status])}>
      {healthLabels[status]}
    </Badge>
  )
}

export function GoalStatusBadge({ status }: { status: GoalStatus }) {
  const labels = { on_track: 'On Track', at_risk: 'At Risk', off_track: 'Off Track' }
  return (
    <Badge variant="outline" className={cn(goalStatusStyles[status])}>
      {labels[status]}
    </Badge>
  )
}
