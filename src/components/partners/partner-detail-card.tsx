import { Mail, Phone, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { PartnerStatus, PartnerWithSchools } from '@/lib/database.types'

const typeStyles: Record<string, string> = {
  consultant: 'bg-blue-50 text-blue-800 border-blue-200',
  vendor: 'bg-violet-50 text-violet-800 border-violet-200',
}

const statusStyles: Record<PartnerStatus, string> = {
  active: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  inactive: 'bg-gray-100 text-gray-600 border-gray-200',
}

const statusLabels: Record<PartnerStatus, string> = {
  active: 'Current',
  inactive: 'Not current',
}

export function PartnerDetailCard({ partner }: { partner: PartnerWithSchools }) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-semibold">{partner.name}</h2>
          {partner.services && (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{partner.services}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={cn('capitalize', typeStyles[partner.partner_type])}>
            {partner.partner_type}
          </Badge>
          <Badge variant="outline" className={cn('text-xs', statusStyles[partner.status])}>
            {statusLabels[partner.status]}
          </Badge>
        </div>
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Primary Contact
          </dt>
          <dd className="mt-1 text-sm">
            {partner.contact_name ?? '—'}
            {partner.contact_email && (
              <a
                href={`mailto:${partner.contact_email}`}
                className="mt-1 flex items-center gap-1 text-primary hover:underline"
              >
                <Mail className="h-3.5 w-3.5" />
                {partner.contact_email}
              </a>
            )}
            {partner.contact_phone && (
              <span className="mt-1 flex items-center gap-1 text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                {partner.contact_phone}
              </span>
            )}
          </dd>
        </div>

        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Schools Supported
          </dt>
          <dd className="mt-1 text-sm text-muted-foreground">
            {partner.school_count === 0
              ? 'All schools'
              : partner.school_names.join(', ')}
          </dd>
        </div>

        {partner.website && (
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Website
            </dt>
            <dd className="mt-1">
              <a
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                {partner.website}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </dd>
          </div>
        )}

        {partner.notes && (
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Notes
            </dt>
            <dd className="mt-1 text-sm text-muted-foreground">{partner.notes}</dd>
          </div>
        )}
      </dl>
    </div>
  )
}
