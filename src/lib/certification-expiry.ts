import type { Certification, CertificationStatus } from '@/lib/database.types'

export const CERT_EXPIRY_WARNING_DAYS = 30

export function daysUntilExpiry(expiryDate: string | null): number | null {
  if (!expiryDate) return null
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((expiry.getTime() - today.getTime()) / 86400000)
}

export function computeCertificationStatus(
  expiryDate: string | null
): CertificationStatus {
  const days = daysUntilExpiry(expiryDate)
  if (days === null) return 'active'
  if (days < 0) return 'expired'
  if (days <= CERT_EXPIRY_WARNING_DAYS) return 'expiring'
  return 'active'
}

export function certificationNeedsReminder(
  cert: Pick<
    Certification,
    'expiry_date' | 'renewal_approval_status'
  >
): boolean {
  if (cert.renewal_approval_status === 'approved') return false
  const days = daysUntilExpiry(cert.expiry_date)
  if (days === null) return false
  return days <= CERT_EXPIRY_WARNING_DAYS
}

export type CertificationReminder = {
  id: string
  certification_type: string
  expiry_date: string
  days_remaining: number
  renewal_approval_status: string | null
  school_name?: string | null
  location?: string | null
}
