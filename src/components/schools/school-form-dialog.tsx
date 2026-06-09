'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createSchool, updateSchool } from '@/app/actions/schools'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTriggerButton,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { School } from '@/lib/database.types'

interface SchoolFormDialogProps {
  school?: School
  trigger?: React.ReactNode
  triggerVariant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive'
  triggerSize?: 'default' | 'sm' | 'lg'
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function SchoolFormDialog({
  school,
  trigger,
  triggerVariant = 'default',
  triggerSize = 'default',
  open: controlledOpen,
  onOpenChange,
}: SchoolFormDialogProps) {
  const router = useRouter()
  const [internalOpen, setInternalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const data = {
      name: form.get('name') as string,
      district: form.get('district') as string,
      enrollment: Number(form.get('enrollment')),
    }

    const result = school
      ? await updateSchool(school.id, data)
      : await createSchool(data)

    setLoading(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success(school ? 'School updated' : 'School created')
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && (
        <DialogTriggerButton variant={triggerVariant} size={triggerSize}>
          {trigger}
        </DialogTriggerButton>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{school ? 'Edit School' : 'Add School'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">School Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={school?.name}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="district">District</Label>
            <Input
              id="district"
              name="district"
              defaultValue={school?.district}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="enrollment">Enrollment</Label>
            <Input
              id="enrollment"
              name="enrollment"
              type="number"
              min={0}
              defaultValue={school?.enrollment ?? 0}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Saving...' : school ? 'Update School' : 'Create School'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
