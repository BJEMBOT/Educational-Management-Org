'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ExternalLink, FileText, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteIntervention, updateIntervention } from '@/app/actions/interventions'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { InterventionFormDialog } from '@/components/interventions/intervention-form-dialog'
import { ResolveInterventionDialog } from '@/components/interventions/resolve-intervention-dialog'
import { cn } from '@/lib/utils'
import type { InterventionWithSchool, School } from '@/lib/database.types'

interface InterventionsTableProps {
  interventions: InterventionWithSchool[]
  schools: School[]
  showSchoolColumn?: boolean
  showFilters?: boolean
}

const statusStyles = {
  open: {
    row: 'bg-amber-50/70 hover:bg-amber-50 border-l-4 border-l-amber-400',
    badge: 'bg-amber-100 text-amber-900 border-amber-300',
    label: 'Open',
  },
  resolved: {
    row: 'bg-emerald-50/60 hover:bg-emerald-50 border-l-4 border-l-emerald-500',
    badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    label: 'Resolved',
  },
} as const

export function InterventionsTable({
  interventions,
  schools,
  showSchoolColumn = true,
  showFilters = true,
}: InterventionsTableProps) {
  const router = useRouter()
  const [schoolFilter, setSchoolFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [editing, setEditing] = useState<InterventionWithSchool | null>(null)
  const [resolveTarget, setResolveTarget] = useState<InterventionWithSchool | null>(null)
  const [selectKeys, setSelectKeys] = useState<Record<string, number>>({})

  const filtered = useMemo(() => {
    return interventions.filter((i) => {
      if (schoolFilter !== 'all' && i.school_id !== schoolFilter) return false
      if (statusFilter !== 'all' && i.status !== statusFilter) return false
      return true
    })
  }, [interventions, schoolFilter, statusFilter])

  const counts = useMemo(() => {
    const open = interventions.filter((i) => i.status === 'open').length
    const resolved = interventions.filter((i) => i.status === 'resolved').length
    return { open, resolved }
  }, [interventions])

  async function handleStatusChange(
    intervention: InterventionWithSchool,
    status: string
  ) {
    if (status === 'resolved' && intervention.status === 'open') {
      setResolveTarget(intervention)
      setSelectKeys((prev) => ({
        ...prev,
        [intervention.id]: (prev[intervention.id] ?? 0) + 1,
      }))
      return
    }

    const result = await updateIntervention(intervention.id, intervention.school_id, {
      status: status as 'open' | 'resolved',
    })
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Status updated')
    router.refresh()
  }

  async function handleDelete(intervention: InterventionWithSchool) {
    const result = await deleteIntervention(intervention.id, intervention.school_id)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Intervention deleted')
    router.refresh()
  }

  if (interventions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">No interventions recorded yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="flex flex-wrap items-center gap-3">
          {showSchoolColumn && (
            <Select value={schoolFilter} onValueChange={(v) => v && setSchoolFilter(v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="School" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Schools</SelectItem>
                {schools.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <div className="ml-auto flex gap-2">
            <Badge variant="outline" className={statusStyles.open.badge}>
              {counts.open} open
            </Badge>
            <Badge variant="outline" className={statusStyles.resolved.badge}>
              {counts.resolved} resolved
            </Badge>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Date</TableHead>
              {showSchoolColumn && <TableHead>School</TableHead>}
              <TableHead>Issue</TableHead>
              <TableHead>Action Taken</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={showSchoolColumn ? 7 : 6}
                  className="text-center text-muted-foreground"
                >
                  No interventions match the selected filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((intervention) => {
                const style = statusStyles[intervention.status]
                return (
                  <TableRow key={intervention.id} className={style.row}>
                    <TableCell className="whitespace-nowrap text-sm font-medium">
                      {format(new Date(intervention.date), 'MMM d, yyyy')}
                    </TableCell>
                    {showSchoolColumn && (
                      <TableCell className="font-medium">
                        {intervention.school_name}
                      </TableCell>
                    )}
                    <TableCell className="max-w-[200px]">
                      <p className="truncate font-medium">{intervention.issue}</p>
                      {intervention.status === 'resolved' &&
                        intervention.resolution_notes && (
                          <p className="mt-1 truncate text-xs text-emerald-800/80">
                            <FileText className="mr-1 inline h-3 w-3" />
                            {intervention.resolution_notes}
                          </p>
                        )}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                      {intervention.action_taken}
                    </TableCell>
                    <TableCell>{intervention.owner}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5">
                        <Select
                          key={`${intervention.id}-${selectKeys[intervention.id] ?? 0}`}
                          defaultValue={intervention.status}
                          onValueChange={(v) => v && handleStatusChange(intervention, v)}
                        >
                          <SelectTrigger
                            className={cn(
                              'h-8 w-[120px] border font-medium',
                              style.badge
                            )}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                        {intervention.status === 'resolved' &&
                          intervention.resolution_evidence_url && (
                            <a
                              href={intervention.resolution_evidence_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View evidence
                            </a>
                          )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon" className="h-8 w-8" />
                          }
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {intervention.status === 'open' && (
                            <DropdownMenuItem
                              onClick={() => setResolveTarget(intervention)}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              Resolve with evidence
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => setEditing(intervention)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(intervention)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {editing && (
        <InterventionFormDialog
          intervention={editing}
          schools={schools}
          open={!!editing}
          onOpenChange={(open) => !open && setEditing(null)}
        />
      )}

      <ResolveInterventionDialog
        intervention={resolveTarget}
        open={!!resolveTarget}
        onOpenChange={(open) => !open && setResolveTarget(null)}
      />
    </div>
  )
}
