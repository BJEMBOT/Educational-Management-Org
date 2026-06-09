'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { toast } from 'sonner'
import {
  approveCertificationRenewal,
  rejectCertificationRenewal,
} from '@/app/actions/pd'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { CertificationWithSchool } from '@/lib/database.types'

export function CertificationRenewalApprovals({
  pending,
}: {
  pending: CertificationWithSchool[]
}) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  if (pending.length === 0) return null

  async function handleApprove(id: string) {
    setLoadingId(id)
    const result = await approveCertificationRenewal(id)
    setLoadingId(null)
    if (result.error) { toast.error(result.error); return }
    toast.success('Renewal approved')
    router.refresh()
  }

  async function handleReject(id: string) {
    setLoadingId(id)
    const result = await rejectCertificationRenewal(id)
    setLoadingId(null)
    if (result.error) { toast.error(result.error); return }
    toast.success('Renewal rejected')
    router.refresh()
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-5">
      <h3 className="font-heading font-semibold">Pending renewal approvals</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {pending.length} renewal(s) awaiting your review
      </p>
      <ul className="mt-4 divide-y rounded-lg border bg-card">
        {pending.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="text-sm font-medium">{c.certification_type}</p>
              <p className="text-xs text-muted-foreground">
                {c.employee_name ?? 'Employee'} · Submitted{' '}
                {c.renewal_submitted_at
                  ? format(new Date(c.renewal_submitted_at), 'MMM d, yyyy')
                  : '—'}
              </p>
              <p className="mt-1 text-xs">
                New dates:{' '}
                {c.renewal_issued_date
                  ? format(new Date(c.renewal_issued_date), 'MMM d, yyyy')
                  : '—'}{' '}
                →{' '}
                {c.renewal_expiry_date
                  ? format(new Date(c.renewal_expiry_date), 'MMM d, yyyy')
                  : '—'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs capitalize">
                pending
              </Badge>
              <Button
                size="sm"
                onClick={() => handleApprove(c.id)}
                disabled={loadingId === c.id}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleReject(c.id)}
                disabled={loadingId === c.id}
              >
                Reject
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
