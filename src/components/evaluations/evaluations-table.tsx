'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteEvaluationCycle } from '@/app/actions/evaluations'
import { cycleTypeLabels } from '@/lib/evaluation-rubric'
import {
  EvaluationRatingBadge,
  EvaluationStatusBadge,
} from '@/components/evaluations/evaluation-status-badge'
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
import type { EvaluationCycleWithDetails } from '@/lib/database.types'

export function EvaluationsTable({
  cycles,
  canDelete,
}: {
  cycles: EvaluationCycleWithDetails[]
  canDelete: boolean
}) {
  const router = useRouter()
  const [deleteTarget, setDeleteTarget] = useState<EvaluationCycleWithDetails | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const result = await deleteEvaluationCycle(deleteTarget.id)
    setDeleting(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Evaluation deleted')
    setDeleteTarget(null)
    router.refresh()
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Teacher</TableHead>
            <TableHead>School</TableHead>
            <TableHead>Framework</TableHead>
            <TableHead>Cycle</TableHead>
            <TableHead>School year</TableHead>
            <TableHead>Evaluator</TableHead>
            <TableHead className="text-right">Observations</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Status</TableHead>
            {canDelete && <TableHead className="w-10" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {cycles.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={canDelete ? 10 : 9}
                className="py-8 text-center text-muted-foreground"
              >
                No evaluation cycles yet.
              </TableCell>
            </TableRow>
          ) : (
            cycles.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <Link href={`/evaluations/${c.id}`} className="font-medium hover:underline">
                    {c.teacher_name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{c.school_name}</TableCell>
                <TableCell className="text-muted-foreground">{c.framework_name}</TableCell>
                <TableCell className="capitalize text-sm text-muted-foreground">
                  {cycleTypeLabels[c.cycle_type]}
                </TableCell>
                <TableCell className="text-sm">{c.school_year}</TableCell>
                <TableCell className="text-muted-foreground">{c.evaluator_name}</TableCell>
                <TableCell className="text-right">{c.observation_count}</TableCell>
                <TableCell>
                  <EvaluationRatingBadge rating={c.overall_rating} />
                </TableCell>
                <TableCell>
                  <EvaluationStatusBadge status={c.status} />
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
                          Delete evaluation
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
            <AlertDialogTitle>Delete evaluation cycle?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the {deleteTarget?.school_year} evaluation for{' '}
              <strong>{deleteTarget?.teacher_name}</strong>, including observations and artifacts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={deleting} onClick={confirmDelete}>
              {deleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
