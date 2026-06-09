'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { updateTimeOffRequestStatus } from '@/app/actions/time-off'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTableWrapper } from '@/components/ui/data-table-wrapper'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { RequestStatus, TimeOffRequestWithDetails } from '@/lib/database.types'

const statusVariant: Record<
  RequestStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  pending: 'secondary',
  approved: 'default',
  denied: 'destructive',
  cancelled: 'outline',
}

export function TimeOffRequestsPanel({
  requests,
  canReview,
  showEmployeeColumn,
}: {
  requests: TimeOffRequestWithDetails[]
  canReview: boolean
  showEmployeeColumn: boolean
}) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function handleReview(id: string, status: 'approved' | 'denied') {
    setLoadingId(id)
    const result = await updateTimeOffRequestStatus(id, status)
    setLoadingId(null)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success(status === 'approved' ? 'Request approved' : 'Request denied')
    router.refresh()
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-lg border bg-card px-5 py-10 text-center text-sm text-muted-foreground">
        No time-off requests yet.
      </div>
    )
  }

  return (
    <DataTableWrapper>
      <Table>
        <TableHeader>
          <TableRow>
            {showEmployeeColumn && <TableHead>Employee</TableHead>}
            <TableHead>Type</TableHead>
            <TableHead>Dates</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead>Status</TableHead>
            {canReview && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              {showEmployeeColumn && (
                <TableCell className="font-medium">
                  {request.employee_name ?? 'Unnamed user'}
                  {request.partner_name && (
                    <p className="text-xs text-muted-foreground">{request.partner_name}</p>
                  )}
                </TableCell>
              )}
              <TableCell className="capitalize">{request.type}</TableCell>
              <TableCell className="whitespace-nowrap text-sm">
                {format(new Date(request.start_date), 'MMM d, yyyy')}
                {' — '}
                {format(new Date(request.end_date), 'MMM d, yyyy')}
              </TableCell>
              <TableCell className="max-w-[200px] truncate text-muted-foreground">
                {request.reason}
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant[request.status]} className="text-xs capitalize">
                  {request.status}
                </Badge>
              </TableCell>
              {canReview && (
                <TableCell className="text-right">
                  {request.status === 'pending' ? (
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={loadingId === request.id}
                        onClick={() => handleReview(request.id, 'approved')}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={loadingId === request.id}
                        onClick={() => handleReview(request.id, 'denied')}
                      >
                        Deny
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DataTableWrapper>
  )
}
