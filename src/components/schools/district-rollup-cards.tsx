'use client'

import { useState } from 'react'
import { ChevronRight, Users, School, AlertCircle } from 'lucide-react'
import { DistrictDetailSheet } from '@/components/schools/district-detail-sheet'
import { SchoolStatusBadge } from '@/components/schools/school-status-badge'
import { cn } from '@/lib/utils'
import type { DistrictDetail } from '@/lib/queries/districts'

const healthThemes = {
  healthy: {
    card: 'hover:border-emerald-300/80 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20',
    ring: 'focus-visible:ring-emerald-500/40',
    bar: 'bg-emerald-500',
    glow: 'group-hover:shadow-emerald-500/10',
  },
  at_risk: {
    card: 'hover:border-amber-300/80 hover:bg-amber-50/40 dark:hover:bg-amber-950/20',
    ring: 'focus-visible:ring-amber-500/40',
    bar: 'bg-amber-500',
    glow: 'group-hover:shadow-amber-500/10',
  },
  off_track: {
    card: 'hover:border-red-300/80 hover:bg-red-50/40 dark:hover:bg-red-950/20',
    ring: 'focus-visible:ring-red-500/40',
    bar: 'bg-red-500',
    glow: 'group-hover:shadow-red-500/10',
  },
} as const

function DistrictCard({
  district,
  isSelected,
  onSelect,
}: {
  district: DistrictDetail
  isSelected: boolean
  onSelect: () => void
}) {
  const theme = healthThemes[district.healthStatus]
  const healthyPct = Math.round(
    (district.healthyCount / Math.max(district.schools.length, 1)) * 100
  )
  const attention = district.atRiskCount + district.offTrackCount

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group relative w-full overflow-hidden rounded-xl border bg-card text-left transition-all duration-200',
        'hover:-translate-y-0.5 hover:shadow-lg',
        theme.card,
        theme.glow,
        theme.ring,
        'focus:outline-none focus-visible:ring-2',
        isSelected && 'border-primary/50 ring-2 ring-primary/30 shadow-md'
      )}
    >
      <div className={cn('absolute inset-x-0 top-0 h-1', theme.bar)} />

      <div className="space-y-3 p-4 pt-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-1.5">
            <SchoolStatusBadge status={district.healthStatus} />
            <h3 className="font-heading text-sm font-semibold leading-tight line-clamp-2">
              {district.district}
            </h3>
          </div>
          <ChevronRight
            className={cn(
              'mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
              'group-hover:translate-x-0.5 group-hover:text-foreground'
            )}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Schools on track</span>
            <span className="font-medium tabular-nums">{healthyPct}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={cn('h-full rounded-full transition-all', theme.bar)}
              style={{ width: `${healthyPct}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 border-t pt-3">
          <div className="flex flex-col items-center gap-0.5 rounded-md bg-muted/50 px-1 py-1.5">
            <School className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm font-semibold tabular-nums">
              {district.schools.length}
            </span>
            <span className="text-[10px] text-muted-foreground">schools</span>
          </div>
          <div className="flex flex-col items-center gap-0.5 rounded-md bg-muted/50 px-1 py-1.5">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm font-semibold tabular-nums">
              {(district.totalEnrollment / 1000).toFixed(1)}k
            </span>
            <span className="text-[10px] text-muted-foreground">students</span>
          </div>
          <div className="flex flex-col items-center gap-0.5 rounded-md bg-muted/50 px-1 py-1.5">
            <AlertCircle
              className={cn(
                'h-3.5 w-3.5',
                district.openInterventionCount > 0
                  ? 'text-amber-600'
                  : 'text-muted-foreground'
              )}
            />
            <span className="text-sm font-semibold tabular-nums">
              {district.openInterventionCount}
            </span>
            <span className="text-[10px] text-muted-foreground">open</span>
          </div>
        </div>

        {attention > 0 && (
          <p className="text-[11px] text-muted-foreground">
            <span className="font-medium text-foreground">{attention}</span> school
            {attention === 1 ? '' : 's'} need attention
          </p>
        )}
      </div>
    </button>
  )
}

export function DistrictRollupCards({
  districts,
}: {
  districts: DistrictDetail[]
}) {
  const [selected, setSelected] = useState<DistrictDetail | null>(null)
  const [open, setOpen] = useState(false)

  function handleSelect(district: DistrictDetail) {
    setSelected(district)
    setOpen(true)
  }

  const healthyCount = districts.filter((d) => d.healthStatus === 'healthy').length

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-lg font-semibold">Districts</h2>
            <p className="text-sm text-muted-foreground">
              Click a district to explore schools, goals, and interventions ·{' '}
              <span className="text-emerald-700 dark:text-emerald-400">
                {healthyCount} healthy
              </span>
              ,{' '}
              <span className="text-amber-700 dark:text-amber-400">
                {districts.filter((d) => d.healthStatus === 'at_risk').length} at risk
              </span>
              ,{' '}
              <span className="text-red-700 dark:text-red-400">
                {districts.filter((d) => d.healthStatus === 'off_track').length} off track
              </span>
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {districts.map((d) => (
            <DistrictCard
              key={d.district}
              district={d}
              isSelected={open && selected?.district === d.district}
              onSelect={() => handleSelect(d)}
            />
          ))}
        </div>
      </div>

      <DistrictDetailSheet
        district={selected}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}
