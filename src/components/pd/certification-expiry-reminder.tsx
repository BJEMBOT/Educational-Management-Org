'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { AlertTriangle, Award } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { submitCertificationRenewal } from '@/app/actions/pd'
import { toast } from 'sonner'
import type { CertificationReminder } from '@/lib/certification-expiry'

const STORAGE_KEY = 'cert-expiry-reminder-date'

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function wasShownToday() {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(STORAGE_KEY) === todayKey()
}

function markShownToday() {
  localStorage.setItem(STORAGE_KEY, todayKey())
}

export function CertificationExpiryReminder({
  reminders,
}: {
  reminders: CertificationReminder[]
}) {
  const [open, setOpen] = useState(false)
  const [renewingId, setRenewingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (reminders.length > 0 && !wasShownToday()) {
      setOpen(true)
    }
  }, [reminders.length])

  function handleDismissToday() {
    markShownToday()
    setOpen(false)
    setRenewingId(null)
  }

  async function handleSubmitRenewal(
    e: React.FormEvent<HTMLFormElement>,
    certId: string
  ) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const result = await submitCertificationRenewal(certId, {
      renewal_issued_date: form.get('renewal_issued_date') as string,
      renewal_expiry_date: form.get('renewal_expiry_date') as string,
    })
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Renewal submitted for admin approval')
    markShownToday()
    setOpen(false)
    setRenewingId(null)
    window.location.reload()
  }

  if (reminders.length === 0) return null

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="max-w-md sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogMedia>
            <AlertTriangle className="text-amber-600" />
          </AlertDialogMedia>
          <AlertDialogTitle>Certification renewal required</AlertDialogTitle>
          <AlertDialogDescription>
            The following certification(s) expire within 30 days. Submit your renewed
            documentation for admin approval. You&apos;ll see this reminder each day until
            an administrator approves your renewal.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <ul className="max-h-48 space-y-2 overflow-y-auto">
          {reminders.map((r) => (
            <li key={r.id} className="rounded-md border px-3 py-2 text-sm">
              <p className="font-medium">{r.certification_type}</p>
              <p className="text-muted-foreground">
                Expires {format(new Date(r.expiry_date), 'MMM d, yyyy')}
                {r.days_remaining < 0
                  ? ' · Expired'
                  : ` · ${r.days_remaining} day(s) left`}
              </p>
              {r.renewal_approval_status === 'pending' && (
                <p className="mt-1 text-xs font-medium text-amber-700">
                  Renewal submitted — awaiting admin approval
                </p>
              )}
              {r.renewal_approval_status === 'rejected' && (
                <p className="mt-1 text-xs font-medium text-destructive">
                  Renewal rejected — please resubmit
                </p>
              )}
              {renewingId !== r.id &&
                r.renewal_approval_status !== 'pending' && (
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="mt-1 h-auto p-0 text-xs"
                    onClick={() => setRenewingId(r.id)}
                  >
                    Submit renewal
                  </Button>
                )}
              {renewingId === r.id && (
                <form
                  className="mt-3 space-y-2 border-t pt-3"
                  onSubmit={(e) => handleSubmitRenewal(e, r.id)}
                >
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor={`issued-${r.id}`} className="text-xs">
                        New issued date
                      </Label>
                      <Input
                        id={`issued-${r.id}`}
                        name="renewal_issued_date"
                        type="date"
                        required
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`expiry-${r.id}`} className="text-xs">
                        New expiry date
                      </Label>
                      <Input
                        id={`expiry-${r.id}`}
                        name="renewal_expiry_date"
                        type="date"
                        required
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" disabled={loading}>
                      {loading ? 'Submitting...' : 'Submit for approval'}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setRenewingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </li>
          ))}
        </ul>

        <AlertDialogFooter>
          <Link href="/certifications">
            <Button variant="outline" size="sm">
              <Award className="mr-1.5 h-3.5 w-3.5" />
              View certifications
            </Button>
          </Link>
          <AlertDialogAction onClick={handleDismissToday}>
            Remind me tomorrow
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function AlertDialogMedia({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-md bg-amber-50">
      {children}
    </div>
  )
}
