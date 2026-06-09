'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteCoachingCycle } from '@/app/actions/coaching'
import { Button } from '@/components/ui/button'
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

export function DeleteCoachingCycleButton({
  cycleId,
  teacherName,
  schoolName,
}: {
  cycleId: string
  teacherName: string
  schoolName: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    const result = await deleteCoachingCycle(cycleId)
    setDeleting(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Coaching cycle deleted')
    setOpen(false)
    router.push('/coaching')
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
          <AlertDialogTitle>Delete coaching cycle?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes the cycle for <strong>{teacherName}</strong> at{' '}
            <strong>{schoolName}</strong>, including all check-ins, observations, and logs.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={deleting} onClick={handleDelete}>
            {deleting ? 'Deleting…' : 'Delete cycle'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
