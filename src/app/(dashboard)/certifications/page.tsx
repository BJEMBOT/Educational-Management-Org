import { format } from 'date-fns'
import { Plus, AlertTriangle } from 'lucide-react'
import { getCurrentProfile } from '@/lib/queries/profile'
import { CERT_EXPIRY_WARNING_DAYS, getCertifications, getPendingCertificationRenewals } from '@/lib/queries/pd'
import { certificationNeedsReminder } from '@/lib/certification-expiry'
import { CertificationRenewalApprovals } from '@/components/pd/certification-renewal-approvals'
import { getSchools } from '@/lib/queries/schools'
import { getAllProfiles } from '@/lib/queries/users'
import { hasPermission } from '@/lib/permissions'
import { CertificationForm } from '@/components/pd/certification-form'
import { PageHeader } from '@/components/ui/page-header'
import { MetricCard } from '@/components/ui/metric-card'
import { DataTableWrapper } from '@/components/ui/data-table-wrapper'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

const statusStyles: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  expiring: 'bg-amber-50 text-amber-800 border-amber-200',
  expired: 'bg-red-50 text-red-800 border-red-200',
}

export default async function CertificationsPage() {
  const profile = await getCurrentProfile()
  const canManage = profile ? hasPermission(profile.role, 'certifications.manage') : false
  const [certs, schools, employees, pendingRenewals] = await Promise.all([
    getCertifications(canManage ? undefined : profile?.id),
    getSchools(),
    canManage ? getAllProfiles() : Promise.resolve([]),
    canManage ? getPendingCertificationRenewals() : Promise.resolve([]),
  ])

  const needingAttention = certs.filter((c) => certificationNeedsReminder(c))
  const expiring = needingAttention.filter((c) => c.status === 'expiring').length
  const expired = needingAttention.filter((c) => c.status === 'expired').length
  const pending = certs.filter((c) => c.renewal_approval_status === 'pending').length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Certifications"
        subtitle="Track state certifications, renewals, and compliance deadlines"
        actions={
          profile ? (
            <CertificationForm
              userId={profile.id}
              userName={profile.name ?? 'You'}
              canManage={canManage}
              employees={employees}
              schools={schools}
              trigger={
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Certification
                </>
              }
            />
          ) : undefined
        }
      />

      {canManage && pendingRenewals.length > 0 && (
        <CertificationRenewalApprovals pending={pendingRenewals} />
      )}

      {(expiring > 0 || expired > 0 || pending > 0) && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {expiring > 0 && (
            <span>
              {expiring} certification(s) expiring within {CERT_EXPIRY_WARNING_DAYS} days.
            </span>
          )}
          {expired > 0 && <span>{expired} expired.</span>}
          {pending > 0 && <span>{pending} renewal(s) pending admin approval.</span>}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Total" value={certs.length} accent="primary" />
        <MetricCard label="Active" value={certs.filter((c) => c.status === 'active').length} accent="success" />
        <MetricCard label="Need Attention" value={expiring + expired} accent={expiring + expired > 0 ? 'warning' : 'success'} />
      </div>

      <DataTableWrapper>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Certification</TableHead>
              {canManage && <TableHead>Employee</TableHead>}
              <TableHead>School / Location</TableHead>
              <TableHead>Issued</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Renewal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {certs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canManage ? 7 : 6} className="py-8 text-center text-muted-foreground">
                  No certifications tracked yet.
                </TableCell>
              </TableRow>
            ) : (
              certs.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.certification_type}</TableCell>
                  {canManage && (
                    <TableCell className="text-muted-foreground">
                      {c.employee_name ?? '—'}
                    </TableCell>
                  )}
                  <TableCell className="text-muted-foreground">
                    {c.school_name ?? c.location ?? '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(c.issued_date), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.expiry_date ? format(new Date(c.expiry_date), 'MMM d, yyyy') : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('capitalize', statusStyles[c.status])}>
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {c.renewal_approval_status ? (
                      <Badge
                        variant="outline"
                        className={cn(
                          'capitalize text-xs',
                          c.renewal_approval_status === 'pending' && 'border-amber-200 bg-amber-50 text-amber-800',
                          c.renewal_approval_status === 'approved' && 'border-emerald-200 bg-emerald-50 text-emerald-800',
                          c.renewal_approval_status === 'rejected' && 'border-red-200 bg-red-50 text-red-800'
                        )}
                      >
                        {c.renewal_approval_status}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </DataTableWrapper>
    </div>
  )
}
