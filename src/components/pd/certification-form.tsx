'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createCertification } from '@/app/actions/pd'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTriggerButton } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { roleLabels } from '@/lib/role-labels'
import type { Profile, School, UserRole } from '@/lib/database.types'

export function CertificationForm({
  userId,
  userName,
  canManage,
  employees,
  schools,
  trigger,
}: {
  userId: string
  userName: string
  canManage: boolean
  employees: Profile[]
  schools: School[]
  trigger: React.ReactNode
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [employeeId, setEmployeeId] = useState(userId)
  const [schoolId, setSchoolId] = useState('')

  useEffect(() => {
    if (open) setEmployeeId(userId)
  }, [open, userId])

  const selectedEmployee = employees.find((e) => e.id === employeeId)
  const selectedSchool = schools.find((s) => s.id === schoolId)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const expiry = form.get('expiry_date') as string
    const result = await createCertification({
      user_id: employeeId,
      certification_type: form.get('certification_type') as string,
      issued_date: form.get('issued_date') as string,
      expiry_date: expiry || undefined,
      school_id: schoolId || undefined,
      location: (form.get('location') as string) || undefined,
    })
    setLoading(false)
    if (result.error) { toast.error(result.error); return }
    toast.success('Certification added')
    setOpen(false)
    setSchoolId('')
    setEmployeeId(userId)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTriggerButton size="sm">{trigger}</DialogTriggerButton>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Certification</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Employee</Label>
            {canManage ? (
              <Select value={employeeId} onValueChange={(v) => v && setEmployeeId(v)}>
                <SelectTrigger className="w-full">
                  <span className={!selectedEmployee ? 'text-muted-foreground' : undefined}>
                    {selectedEmployee?.name ?? 'Select employee'}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name ?? 'Unnamed'} — {roleLabels[e.role as UserRole] ?? e.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input value={userName} readOnly className="bg-muted/50" />
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="certification_type">Certification Type</Label>
            <Input id="certification_type" name="certification_type" placeholder="e.g. State Teaching License" required />
          </div>
          <div className="space-y-2">
            <Label>School</Label>
            <Select value={schoolId} onValueChange={(v) => setSchoolId(v ?? '')}>
              <SelectTrigger className="w-full">
                <span className={!selectedSchool ? 'text-muted-foreground' : undefined}>
                  {selectedSchool?.name ?? 'Select school (optional)'}
                </span>
              </SelectTrigger>
              <SelectContent>
                {schools.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              placeholder="e.g. State of Illinois, district-wide"
            />
            <p className="text-xs text-muted-foreground">
              Use when the certification isn&apos;t tied to a specific school.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="issued_date">Issued Date</Label>
              <Input id="issued_date" name="issued_date" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiry_date">Expiry Date</Label>
              <Input id="expiry_date" name="expiry_date" type="date" />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Saving...' : 'Add Certification'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
