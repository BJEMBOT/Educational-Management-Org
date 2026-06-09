'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { MoreHorizontal, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteCoachingCycle } from '@/app/actions/coaching'
import { frequencyLabels } from '@/lib/coaching-schedule'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { CoachingCycleWithDetails } from '@/lib/database.types'

export function CoachingCyclesTable({
  cycles,
  canDelete,
}: {
  cycles: CoachingCycleWithDetails[]
  canDelete: boolean
}) {
  const router = useRouter()
  const [deleteTarget, setDeleteTarget] = useState<CoachingCycleWithDetails | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const result = await deleteCoachingCycle(deleteTarget.id)
    setDeleting(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Coaching cycle deleted')
    setDeleteTarget(null)
    router.refresh()
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Teacher</TableHead>
            <TableHead>Coach</TableHead>
            <TableHead>School</TableHead>
            <TableHead>Focus</TableHead>
            <TableHead>Frequency</TableHead>
            <TableHead>Next check-in</TableHead>
            <TableHead className="text-right">Observations</TableHead>
            <TableHead>Status</TableHead>
            {canDelete && <TableHead className="w-10" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {cycles.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={canDelete ? 9 : 8}
                className="py-8 text-center text-muted-foreground"
              >
                No coaching cycles yet.
              </TableCell>
            </TableRow>
          ) : (
            cycles.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <Link href={`/coaching/${c.id}`} className="font-medium hover:underline">
                    {c.teacher_name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{c.coach_name}</TableCell>
                <TableCell className="text-muted-foreground">{c.school_name}</TableCell>
                <TableCell>{c.focus_area}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {frequencyLabels[c.check_in_frequency]}
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                  {c.next_check_in_at
                    ? format(new Date(c.next_check_in_at), 'MMM d, yyyy')
                    : '—'}
                </TableCell>
                <TableCell className="text-right">{c.observation_count}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {c.status}
                  </Badge>
                </TableCell>
                {canDelete && (
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={<Button variant="ghost" size="icon" className="h-8 w-8" />}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteTarget(c)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete cycle
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete coaching cycle?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the cycle for{' '}
              <strong>{deleteTarget?.teacher_name}</strong> at{' '}
              <strong>{deleteTarget?.school_name}</strong>, including all scheduled check-ins,
              observations, and coaching logs. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleting}
              onClick={confirmDelete}
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
