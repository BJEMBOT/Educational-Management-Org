'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteSchool } from '@/app/actions/schools'
import { SchoolFormDialog } from '@/components/schools/school-form-dialog'
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
import type { School } from '@/lib/database.types'

export function SchoolDetailActions({ school }: { school: School }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    const result = await deleteSchool(school.id)
    setDeleting(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success('School deleted')
    router.push('/')
    router.refresh()
  }

  return (
    <div className="flex gap-2">
      <SchoolFormDialog
        school={school}
        triggerVariant="outline"
        triggerSize="sm"
        trigger={
          <>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </>
        }
      />
      <AlertDialog>
        <AlertDialogTriggerButton variant="outline" size="sm" className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </AlertDialogTriggerButton>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {school.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the school and all associated goals
              and interventions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
