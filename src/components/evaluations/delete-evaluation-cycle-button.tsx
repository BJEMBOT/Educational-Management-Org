'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteEvaluationCycle } from '@/app/actions/evaluations'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTriggerButton,
} from '@/components/ui/alert-dialog'

export function DeleteEvaluationCycleButton({
  cycleId,
  teacherName,
  schoolYear,
}: {
  cycleId: string
  teacherName: string
  schoolYear: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    const result = await deleteEvaluationCycle(cycleId)
    setDeleting(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Evaluation deleted')
    setOpen(false)
    router.push('/evaluations')
    router.refresh()
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTriggerButton variant="destructive" size="sm">
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </AlertDialogTriggerButton>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete evaluation cycle?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes the {schoolYear} evaluation for{' '}
            <strong>{teacherName}</strong>, including all observations and artifacts.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={deleting} onClick={handleDelete}>
            {deleting ? 'Deleting…' : 'Delete evaluation'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
