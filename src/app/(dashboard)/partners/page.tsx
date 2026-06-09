import { Plus } from 'lucide-react'
import { getCurrentProfile } from '@/lib/queries/profile'
import {
  canViewerManagePartners,
  getPartnersForViewer,
} from '@/lib/queries/partners'
import { getSchools } from '@/lib/queries/schools'
import { isPartnerUser } from '@/lib/permissions'
import { PartnerFormDialog } from '@/components/partners/partner-form-dialog'
import { PartnersTable } from '@/components/partners/partners-table'
import { PartnerDetailCard } from '@/components/partners/partner-detail-card'
import { PageHeader } from '@/components/ui/page-header'
import { MetricCard } from '@/components/ui/metric-card'

export default async function PartnersPage() {
  const profile = await getCurrentProfile()
  const canManage = canViewerManagePartners(profile)
  const isPartner = profile ? isPartnerUser(profile) : false

  const [partners, schools] = await Promise.all([
    getPartnersForViewer(profile),
    canManage ? getSchools() : Promise.resolve([]),
  ])

  const current = partners.filter((p) => p.status === 'active')
  const notCurrent = partners.filter((p) => p.status === 'inactive')
  const consultants = current.filter((p) => p.partner_type === 'consultant').length
  const vendors = current.filter((p) => p.partner_type === 'vendor').length

  return (
    <>
      <PageHeader
        title={isPartner ? 'My Organization' : 'Partners'}
        subtitle={
          isPartner
            ? 'Your partner organization profile and school assignments'
            : 'Consultants and vendors supporting your schools and districts'
        }
        actions={
          canManage ? (
            <PartnerFormDialog
              schools={schools}
              trigger={
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Partner
                </>
              }
            />
          ) : undefined
        }
      />

      {!isPartner && (
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            label="Current Partners"
            value={current.length}
            subtext={`${notCurrent.length} not current`}
            accent="success"
          />
          <MetricCard label="Consultants" value={consultants} accent="default" />
          <MetricCard label="Vendors" value={vendors} accent="default" />
        </div>
      )}

      {isPartner ? (
        partners[0] ? (
          <PartnerDetailCard partner={partners[0]} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Your partner organization could not be loaded.
          </p>
        )
      ) : (
        <PartnersTable partners={partners} canManage={canManage} />
      )}
    </>
  )
}
