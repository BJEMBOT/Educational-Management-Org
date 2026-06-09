'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarDays } from 'lucide-react'
import { toast } from 'sonner'
import { submitTimeOffRequest } from '@/app/actions/time-off'
import { Button } from '@/components/ui/button'
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
import type { PartnerUser, TimeOffType } from '@/lib/database.types'

export function TimeOffRequestForm({
  employees,
  showEmployeePicker,
  currentUserId,
}: {
  employees: PartnerUser[]
  showEmployeePicker: boolean
  currentUserId: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState<TimeOffType>('absence')
  const [employeeId, setEmployeeId] = useState(employees[0]?.id ?? '')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const result = await submitTimeOffRequest({
      user_id: showEmployeePicker ? employeeId : currentUserId,
      type,
      start_date: form.get('start_date') as string,
      end_date: form.get('end_date') as string,
      reason: form.get('reason') as string,
    })

    setLoading(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success('Time-off request submitted')
    e.currentTarget.reset()
    setType('absence')
    router.refresh()
  }

  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold">Request absence or vacation</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {showEmployeePicker && (
          <div className="space-y-2">
            <Label htmlFor="employee">Employee</Label>
            <Select value={employeeId} onValueChange={(v) => v && setEmployeeId(v)}>
              <SelectTrigger id="employee">
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name ?? 'Unnamed user'}
                    {employee.partner_name ? ` — ${employee.partner_name}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as TimeOffType)}>
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="absence">Absence</SelectItem>
              <SelectItem value="vacation">Vacation</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="start_date">Start date</Label>
            <Input id="start_date" name="start_date" type="date" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_date">End date</Label>
            <Input id="end_date" name="end_date" type="date" required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">Notes</Label>
          <Textarea
            id="reason"
            name="reason"
            placeholder="anything we should know?"
            rows={3}
            required
          />
        </div>

        <Button type="submit" disabled={loading || (showEmployeePicker && !employeeId)}>
          {loading ? 'Submitting…' : 'Submit request'}
        </Button>
      </form>
    </div>
  )
}
