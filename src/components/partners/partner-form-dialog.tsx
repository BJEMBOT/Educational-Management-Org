'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createPartner } from '@/app/actions/partners'
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
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import type { PartnerType, School } from '@/lib/database.types'

export function PartnerFormDialog({
  schools,
  trigger,
}: {
  schools: School[]
  trigger: React.ReactNode
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [partnerType, setPartnerType] = useState<PartnerType>('consultant')
  const [selectedSchoolIds, setSelectedSchoolIds] = useState<Set<string>>(new Set())

  function toggleSchool(id: string) {
    setSelectedSchoolIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const result = await createPartner({
      name: form.get('name') as string,
      partner_type: partnerType,
      contact_name: (form.get('contact_name') as string) || undefined,
      contact_email: (form.get('contact_email') as string) || undefined,
      contact_phone: (form.get('contact_phone') as string) || undefined,
      services: (form.get('services') as string) || undefined,
      website: (form.get('website') as string) || undefined,
      notes: (form.get('notes') as string) || undefined,
      school_ids: [...selectedSchoolIds],
    })
    setLoading(false)
    if (result.error) { toast.error(result.error); return }
    toast.success('Partner added')
    setOpen(false)
    setSelectedSchoolIds(new Set())
    setPartnerType('consultant')
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTriggerButton size="sm">{trigger}</DialogTriggerButton>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Partner</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name</Label>
            <Input id="name" name="name" placeholder="e.g. EdLead Consulting Group" required />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              value={partnerType}
              onValueChange={(v) => v && setPartnerType(v as PartnerType)}
            >
              <SelectTrigger className="w-full">
                <span className="capitalize">{partnerType}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="consultant">Consultant</SelectItem>
                <SelectItem value="vendor">Vendor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact_name">Primary Contact</Label>
            <Input id="contact_name" name="contact_name" placeholder="Contact person name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="contact_email">Email</Label>
              <Input id="contact_email" name="contact_email" type="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Phone</Label>
              <Input id="contact_phone" name="contact_phone" type="tel" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="services">Services Provided</Label>
            <Textarea
              id="services"
              name="services"
              rows={2}
              placeholder="What support do they provide to schools?"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" name="website" type="url" placeholder="https://" />
          </div>
          <div className="space-y-2">
            <Label>Schools Supported</Label>
            <div className="max-h-36 overflow-y-auto rounded-md border divide-y">
              {schools.map((s) => (
                <label
                  key={s.id}
                  className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-muted/50"
                >
                  <input
                    type="checkbox"
                    checked={selectedSchoolIds.has(s.id)}
                    onChange={() => toggleSchool(s.id)}
                    className="rounded border-border"
                  />
                  {s.name}
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={2} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Saving...' : 'Add Partner'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
