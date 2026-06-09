'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Download } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { SchoolStatusBadge } from '@/components/schools/school-status-badge'
import { downloadCSV } from '@/lib/csv-export'
import { healthLabels } from '@/lib/school-health'
import type { SchoolHealth, SchoolWithStats } from '@/lib/database.types'

type SchoolRow = SchoolWithStats & { partnerCount: number }

export function SchoolPortfolioTable({
  schools,
  partnerCounts,
}: {
  schools: SchoolWithStats[]
  partnerCounts: Record<string, number>
}) {
  const [districtFilter, setDistrictFilter] = useState('all')
  const [healthFilter, setHealthFilter] = useState<'all' | SchoolHealth>('all')

  const rows: SchoolRow[] = useMemo(
    () =>
      schools.map((s) => ({
        ...s,
        partnerCount: partnerCounts[s.id] ?? 0,
      })),
    [schools, partnerCounts]
  )

  const districts = useMemo(
    () => [...new Set(schools.map((s) => s.district))].sort(),
    [schools]
  )

  const filtered = useMemo(() => {
    return rows.filter((s) => {
      if (districtFilter !== 'all' && s.district !== districtFilter) return false
      if (healthFilter !== 'all' && s.healthStatus !== healthFilter) return false
      return true
    })
  }, [rows, districtFilter, healthFilter])

  function handleExport() {
    downloadCSV(
      'school-portfolio.csv',
      filtered.map((s) => ({
        name: s.name,
        district: s.district,
        enrollment: s.enrollment,
        goals_on_track_percent: s.onTrackPercent,
        total_goals: s.totalGoals,
        health_status: healthLabels[s.healthStatus],
        open_interventions: s.openInterventions,
        partners: s.partnerCount,
      }))
    )
  }

  if (schools.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">No schools yet. Add your first school to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Select value={districtFilter} onValueChange={(v) => v && setDistrictFilter(v)}>
            <SelectTrigger className="w-[180px]">
              <span>{districtFilter === 'all' ? 'All districts' : districtFilter}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All districts</SelectItem>
              {districts.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={healthFilter} onValueChange={(v) => v && setHealthFilter(v as typeof healthFilter)}>
            <SelectTrigger className="w-[160px]">
              <span className="capitalize">{healthFilter === 'all' ? 'All statuses' : healthFilter.replace('_', ' ')}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="healthy">Healthy</SelectItem>
              <SelectItem value="at_risk">At risk</SelectItem>
              <SelectItem value="off_track">Off track</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>School</TableHead>
              <TableHead>District</TableHead>
              <TableHead className="text-right">Enrollment</TableHead>
              <TableHead className="text-right">Goals</TableHead>
              <TableHead className="text-right">Interventions</TableHead>
              <TableHead className="text-right">Partners</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  No schools match the selected filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((school) => (
                <TableRow key={school.id}>
                  <TableCell>
                    <Link href={`/schools/${school.id}`} className="font-medium hover:underline">
                      {school.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{school.district}</TableCell>
                  <TableCell className="text-right">{school.enrollment.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    {school.onTrackPercent}%
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({school.onTrackCount}/{school.totalGoals})
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{school.openInterventions}</TableCell>
                  <TableCell className="text-right">{school.partnerCount}</TableCell>
                  <TableCell>
                    <SchoolStatusBadge status={school.healthStatus} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
