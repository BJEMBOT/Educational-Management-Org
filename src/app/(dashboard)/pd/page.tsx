import Link from 'next/link'
import { format } from 'date-fns'
import { Plus } from 'lucide-react'
import { getCurrentProfile } from '@/lib/queries/profile'
import { canManagePd } from '@/lib/permissions'
import { getPdEvents, getUserRegistrations } from '@/lib/queries/pd'
import { PdEventForm } from '@/components/pd/pd-event-form'
import { PdAssignDialog } from '@/components/pd/pd-assign-dialog'
import { PageHeader } from '@/components/ui/page-header'
import { DataTableWrapper } from '@/components/ui/data-table-wrapper'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default async function PdCatalogPage() {
  const profile = await getCurrentProfile()
  const canManage = profile ? canManagePd(profile.role) : false
  const [events, registrations] = await Promise.all([
    getPdEvents(),
    profile ? getUserRegistrations(profile.id) : Promise.resolve([]),
  ])

  const registeredIds = new Set(registrations.map((r) => r.event_id))
  const assignedByMap = new Map(
    registrations.filter((r) => r.assigned_by_name).map((r) => [r.event_id, r.assigned_by_name])
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Professional Development Catalog"
        subtitle="Browse sessions, register for training, and track continuing education hours"
        actions={
          canManage ? (
            <PdEventForm
              trigger={
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Event
                </>
              }
            />
          ) : undefined
        }
      />

      <DataTableWrapper>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Session</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Format</TableHead>
              <TableHead className="text-right">Credits</TableHead>
              <TableHead className="text-right">Registered</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((e) => (
              <TableRow key={e.id}>
                <TableCell>
                  <Link href={`/pd/${e.id}`} className="font-medium hover:underline">
                    {e.title}
                  </Link>
                  {e.description && (
                    <p className="mt-0.5 max-w-xs truncate text-xs text-muted-foreground">{e.description}</p>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {format(new Date(e.start_date), 'MMM d, yyyy')}
                </TableCell>
                <TableCell className="capitalize text-muted-foreground">{e.format}</TableCell>
                <TableCell className="text-right">{e.credit_hours}</TableCell>
                <TableCell className="text-right">{e.registration_count}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">{e.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    {canManage && e.status === 'scheduled' && (
                      <PdAssignDialog
                        eventId={e.id}
                        eventTitle={e.title}
                        trigger="Assign"
                      />
                    )}
                    {registeredIds.has(e.id) ? (
                      <div className="text-right">
                        <Badge className="text-xs">Registered</Badge>
                        {assignedByMap.get(e.id) && (
                          <p className="mt-0.5 text-[10px] text-muted-foreground">
                            Assigned by {assignedByMap.get(e.id)}
                          </p>
                        )}
                      </div>
                    ) : e.status === 'scheduled' && profile ? (
                      <Link href={`/pd/${e.id}`}>
                        <Button size="sm" variant="outline">View</Button>
                      </Link>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataTableWrapper>
    </div>
  )
}
