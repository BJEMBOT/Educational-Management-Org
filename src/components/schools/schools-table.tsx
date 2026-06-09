'use client'

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
import { SchoolStatusBadge } from '@/components/schools/school-status-badge'
import { downloadCSV } from '@/lib/csv-export'
import { healthLabels } from '@/lib/school-health'
import type { SchoolWithStats } from '@/lib/database.types'

export function SchoolsTable({ schools }: { schools: SchoolWithStats[] }) {
  function handleExport() {
    downloadCSV(
      'schools-summary.csv',
      schools.map((s) => ({
        name: s.name,
        district: s.district,
        enrollment: s.enrollment,
        goals_on_track_percent: s.onTrackPercent,
        health_status: healthLabels[s.healthStatus],
        open_interventions: s.openInterventions,
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
      <div className="flex justify-end">
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
              <TableHead className="text-right">Goals On Track</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schools.map((school) => (
              <TableRow key={school.id}>
                <TableCell>
                  <Link
                    href={`/schools/${school.id}`}
                    className="font-medium hover:underline"
                  >
                    {school.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {school.district}
                </TableCell>
                <TableCell className="text-right">
                  {school.enrollment.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  {school.onTrackPercent}%
                  <span className="text-muted-foreground text-xs ml-1">
                    ({school.onTrackCount}/{school.totalGoals})
                  </span>
                </TableCell>
                <TableCell>
                  <SchoolStatusBadge status={school.healthStatus} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
