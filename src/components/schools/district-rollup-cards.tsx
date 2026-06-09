'use client'

import { useState } from 'react'
import { MetricCard } from '@/components/ui/metric-card'
import { DistrictDetailSheet } from '@/components/schools/district-detail-sheet'
import type { DistrictDetail } from '@/lib/queries/districts'

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

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {districts.map((d) => {
          const accent =
            d.healthStatus === 'off_track'
              ? 'danger'
              : d.healthStatus === 'at_risk'
                ? 'warning'
                : 'success'

          return (
            <button
              key={d.district}
              type="button"
              onClick={() => handleSelect(d)}
              className="text-left transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
            >
              <MetricCard
                label={d.district}
                value={d.schools.length}
                subtext={`${d.totalEnrollment.toLocaleString()} students · ${d.atRiskCount + d.offTrackCount} need attention`}
                accent={accent}
                className="cursor-pointer hover:shadow-md transition-shadow h-full"
              />
            </button>
          )
        })}
      </div>

      <DistrictDetailSheet
        district={selected}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}
