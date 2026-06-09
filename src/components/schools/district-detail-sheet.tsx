'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import {
  AlertTriangle,
  CheckCircle2,
  Handshake,
  Lightbulb,
  Target,
  Users,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { SchoolStatusBadge } from '@/components/schools/school-status-badge'
import { categoryLabels, goalStatusLabels } from '@/lib/school-health'
import { cn } from '@/lib/utils'
import type { DistrictDetail } from '@/lib/queries/districts'

const healthAccent = {
  healthy: 'border-l-emerald-500',
  at_risk: 'border-l-amber-500',
  off_track: 'border-l-red-500',
} as const

export function DistrictDetailSheet({
  district,
  open,
  onOpenChange,
}: {
  district: DistrictDetail | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!district) return null

  const openInterventions = district.interventions.filter((i) => i.status === 'open')
  const resolvedInterventions = district.interventions.filter(
    (i) => i.status === 'resolved'
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="font-heading text-xl">{district.district}</SheetTitle>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <SchoolStatusBadge status={district.healthStatus} />
            <span className="text-sm text-muted-foreground">
              {district.schools.length} schools · {district.totalEnrollment.toLocaleString()} students
            </span>
          </div>
        </SheetHeader>

        <div className="space-y-6 py-4">
          <section>
            <h3 className="mb-2 text-sm font-semibold">Status overview</h3>
            <div className="grid grid-cols-3 gap-2">
              <StatusPill label="Healthy" count={district.healthyCount} tone="success" />
              <StatusPill label="At risk" count={district.atRiskCount} tone="warning" />
              <StatusPill label="Off track" count={district.offTrackCount} tone="danger" />
            </div>
            <ul className="mt-3 space-y-1.5">
              {district.schools.map((school) => (
                <li key={school.id}>
                  <Link
                    href={`/schools/${school.id}`}
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm hover:bg-muted/50"
                  >
                    <span className="font-medium">{school.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {school.onTrackPercent}% on track
                      </span>
                      <SchoolStatusBadge status={school.healthStatus} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Lightbulb className="h-4 w-4 text-amber-600" />
              Recommendations to get healthy
            </h3>
            <ul className="space-y-2">
              {district.recommendations.map((rec, i) => (
                <li
                  key={i}
                  className={cn(
                    'rounded-md border-l-4 bg-muted/30 px-3 py-2 text-sm',
                    healthAccent[district.healthStatus]
                  )}
                >
                  {rec}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Target className="h-4 w-4" />
              Goals ({district.goals.length})
            </h3>
            {district.goals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No goals recorded.</p>
            ) : (
              <ul className="max-h-48 space-y-2 overflow-y-auto">
                {district.goals.map((goal) => (
                  <li key={goal.id} className="rounded-md border px-3 py-2 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{goal.metric_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {goal.school_name} · {categoryLabels[goal.category]}
                        </p>
                      </div>
                      <Badge variant="outline" className="shrink-0 text-xs">
                        {goalStatusLabels[goal.status]}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Open interventions ({openInterventions.length})
            </h3>
            {openInterventions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No open interventions.</p>
            ) : (
              <ul className="space-y-2">
                {openInterventions.map((i) => (
                  <li key={i.id} className="rounded-md border border-amber-200 bg-amber-50/50 px-3 py-2 text-sm">
                    <p className="font-medium">{i.issue}</p>
                    <p className="text-xs text-muted-foreground">
                      {i.school_name} · {format(new Date(i.date), 'MMM d, yyyy')}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Resolved interventions ({resolvedInterventions.length})
            </h3>
            {resolvedInterventions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No resolved interventions yet.</p>
            ) : (
              <ul className="space-y-2">
                {resolvedInterventions.slice(0, 5).map((i) => (
                  <li key={i.id} className="rounded-md border border-emerald-200 bg-emerald-50/50 px-3 py-2 text-sm">
                    <p className="font-medium">{i.issue}</p>
                    <p className="text-xs text-muted-foreground">{i.school_name}</p>
                  </li>
                ))}
                {resolvedInterventions.length > 5 && (
                  <p className="text-xs text-muted-foreground">
                    +{resolvedInterventions.length - 5} more resolved
                  </p>
                )}
              </ul>
            )}
          </section>

          <section>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Handshake className="h-4 w-4" />
              Partners ({district.partners.length})
            </h3>
            {district.partners.length === 0 ? (
              <p className="text-sm text-muted-foreground">No partners linked to this district.</p>
            ) : (
              <ul className="space-y-2">
                {district.partners.map((p) => (
                  <li key={p.id} className="rounded-md border px-3 py-2 text-sm">
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs capitalize text-muted-foreground">
                      {p.partner_type} · {p.school_names.join(', ')}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Users className="h-4 w-4" />
              Teachers ({district.teachers.length})
            </h3>
            {district.teachers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No teachers assigned in this district.</p>
            ) : (
              <ul className="max-h-40 space-y-1 overflow-y-auto">
                {district.teachers.map((t) => (
                  <li key={`${t.id}-${t.school_id}`} className="flex justify-between text-sm">
                    <span>{t.name ?? 'Unnamed'}</span>
                    <span className="text-xs text-muted-foreground">{t.school_name}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function StatusPill({
  label,
  count,
  tone,
}: {
  label: string
  count: number
  tone: 'success' | 'warning' | 'danger'
}) {
  const styles = {
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-red-50 text-red-800 border-red-200',
  }
  return (
    <div className={cn('rounded-md border px-2 py-2 text-center', styles[tone])}>
      <p className="text-lg font-semibold tabular-nums">{count}</p>
      <p className="text-[10px] font-medium uppercase tracking-wide">{label}</p>
    </div>
  )
}
