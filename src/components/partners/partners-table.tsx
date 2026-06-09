'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Phone, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { setPartnerStatus } from '@/app/actions/partners'
import { DataTableWrapper } from '@/components/ui/data-table-wrapper'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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

function PartnerRows({
  partners,
  canManage,
}: {
  partners: PartnerWithSchools[]
  canManage: boolean
}) {
  const router = useRouter()
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  async function handleStatusToggle(id: string, next: PartnerStatus) {
    setUpdatingId(id)
    const result = await setPartnerStatus(id, next)
    setUpdatingId(null)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success(next === 'active' ? 'Partner marked as current' : 'Partner marked as not current')
    router.refresh()
  }

  if (partners.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
          No partners in this category yet.
        </TableCell>
      </TableRow>
    )
  }

  return (
    <>
      {partners.map((p) => (
        <TableRow
          key={p.id}
          className={cn(p.status === 'inactive' && 'opacity-70')}
        >
          <TableCell>
            <p className="font-medium">{p.name}</p>
            {p.services && (
              <p className="mt-0.5 max-w-sm text-xs text-muted-foreground line-clamp-2">
                {p.services}
              </p>
            )}
          </TableCell>
          <TableCell>
            <Badge variant="outline" className={cn('capitalize', typeStyles[p.partner_type])}>
              {p.partner_type}
            </Badge>
          </TableCell>
          <TableCell>
            <Badge variant="outline" className={cn('text-xs', statusStyles[p.status])}>
              {statusLabels[p.status]}
            </Badge>
          </TableCell>
          <TableCell>
            {p.contact_name ? (
              <div className="text-sm">
                <p>{p.contact_name}</p>
                <div className="mt-0.5 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {p.contact_email && (
                    <a href={`mailto:${p.contact_email}`} className="inline-flex items-center gap-0.5 hover:text-primary">
                      <Mail className="h-3 w-3" />
                      {p.contact_email}
                    </a>
                  )}
                  {p.contact_phone && (
                    <span className="inline-flex items-center gap-0.5">
                      <Phone className="h-3 w-3" />
                      {p.contact_phone}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </TableCell>
          <TableCell>
            {p.school_count === 0 ? (
              <span className="text-muted-foreground">All schools</span>
            ) : p.school_count <= 2 ? (
              <span className="text-sm text-muted-foreground">{p.school_names.join(', ')}</span>
            ) : (
              <span className="text-sm text-muted-foreground">
                {p.school_names.slice(0, 2).join(', ')} +{p.school_count - 2} more
              </span>
            )}
          </TableCell>
          <TableCell>
            <div className="flex flex-col items-start gap-1.5">
              {p.website ? (
                <a
                  href={p.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  Visit
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
              {canManage && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  disabled={updatingId === p.id}
                  onClick={() =>
                    handleStatusToggle(
                      p.id,
                      p.status === 'active' ? 'inactive' : 'active'
                    )
                  }
                >
                  {p.status === 'active' ? 'Mark not current' : 'Mark current'}
                </Button>
              )}
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

export function PartnersTable({
  partners,
  canManage = false,
}: {
  partners: PartnerWithSchools[]
  canManage?: boolean
}) {
  const [statusFilter, setStatusFilter] = useState<PartnerStatus>('active')

  const byStatus = useMemo(
    () => partners.filter((p) => p.status === statusFilter),
    [partners, statusFilter]
  )

  const consultants = useMemo(
    () => byStatus.filter((p) => p.partner_type === 'consultant'),
    [byStatus]
  )
  const vendors = useMemo(
    () => byStatus.filter((p) => p.partner_type === 'vendor'),
    [byStatus]
  )

  const currentCount = partners.filter((p) => p.status === 'active').length
  const notCurrentCount = partners.filter((p) => p.status === 'inactive').length

  const table = (rows: PartnerWithSchools[]) => (
    <DataTableWrapper>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Organization</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Schools</TableHead>
            <TableHead>Website</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <PartnerRows partners={rows} canManage={canManage} />
        </TableBody>
      </Table>
    </DataTableWrapper>
  )

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-lg border bg-muted/40 p-1">
        <button
          type="button"
          onClick={() => setStatusFilter('active')}
          className={cn(
            'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
            statusFilter === 'active'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Current ({currentCount})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('inactive')}
          className={cn(
            'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
            statusFilter === 'inactive'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Not current ({notCurrentCount})
        </button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({byStatus.length})</TabsTrigger>
          <TabsTrigger value="consultants">Consultants ({consultants.length})</TabsTrigger>
          <TabsTrigger value="vendors">Vendors ({vendors.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          {table(byStatus)}
        </TabsContent>
        <TabsContent value="consultants" className="mt-4">
          {table(consultants)}
        </TabsContent>
        <TabsContent value="vendors" className="mt-4">
          {table(vendors)}
        </TabsContent>
      </Tabs>
    </div>
  )
}
