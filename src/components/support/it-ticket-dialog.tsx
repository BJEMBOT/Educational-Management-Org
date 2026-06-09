'use client'

import { useState } from 'react'
import { Headphones } from 'lucide-react'
import { toast } from 'sonner'
import { submitItTicket } from '@/app/actions/it-tickets'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTriggerButton,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { ItTicketPriority } from '@/lib/database.types'

export function ItTicketDialog({
  triggerVariant = 'ghost',
  triggerSize = 'default',
  compact = false,
  className,
}: {
  triggerVariant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive'
  triggerSize?: 'default' | 'sm' | 'lg'
  compact?: boolean
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [priority, setPriority] = useState<ItTicketPriority>('normal')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const result = await submitItTicket({
      subject: form.get('subject') as string,
      description: form.get('description') as string,
      priority,
    })

    setLoading(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    if ('warning' in result && result.warning) {
      toast.warning(result.warning)
    } else {
      toast.success('IT ticket submitted. Our team will follow up shortly.')
    }
    setOpen(false)
    setPriority('normal')
    e.currentTarget.reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTriggerButton
        variant={triggerVariant}
        size={triggerSize}
        className={cn(
          compact ? 'h-8 w-8' : 'w-full justify-start gap-2.5 px-2.5',
          className
        )}
        title="Submit IT Ticket"
      >
        <Headphones className="h-4 w-4 shrink-0" />
        {!compact && <span>Submit IT Ticket</span>}
        {compact && <span className="sr-only">Submit IT Ticket</span>}
      </DialogTriggerButton>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Submit IT Ticket</DialogTitle>
          <DialogDescription>
            Describe the issue you are experiencing. Our IT team will review your request.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              name="subject"
              placeholder="Brief summary of the issue"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as ItTicketPriority)}>
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="What happened? Include any error messages or steps to reproduce."
              rows={4}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting…' : 'Submit ticket'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
