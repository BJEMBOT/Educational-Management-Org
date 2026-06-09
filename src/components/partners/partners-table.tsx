'use client'

import { useMemo, useState } from 'react'
import { Mail, Phone, ExternalLink } from 'lucide-react'
import { DataTableWrapper } from '@/components/ui/data-table-wrapper'
import { Badge } from '@/components/ui/badge'
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
import type { PartnerWithSchools } from '@/lib/database.types'

const typeStyles: Record<string, string> = {
  consultant: 'bg-blue-50 text-blue-800 border-blue-200',
  vendor: 'bg-violet-50 text-violet-800 border-violet-200',
}

function PartnerRows({ partners }: { partners: PartnerWithSchools[] }) {
  if (partners.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
          No partners in this category yet.
        </TableCell>
      </TableRow>
    )
  }

  return (
    <>
      {partners.map((p) => (
        <TableRow key={p.id}>
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
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

export function PartnersTable({ partners }: { partners: PartnerWithSchools[] }) {
  const consultants = useMemo(
    () => partners.filter((p) => p.partner_type === 'consultant'),
    [partners]
  )
  const vendors = useMemo(
    () => partners.filter((p) => p.partner_type === 'vendor'),
    [partners]
  )

  const table = (rows: PartnerWithSchools[]) => (
    <DataTableWrapper>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Organization</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Schools</TableHead>
            <TableHead>Website</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <PartnerRows partners={rows} />
        </TableBody>
      </Table>
    </DataTableWrapper>
  )

  return (
    <Tabs defaultValue="all">
      <TabsList>
        <TabsTrigger value="all">All ({partners.length})</TabsTrigger>
        <TabsTrigger value="consultants">Consultants ({consultants.length})</TabsTrigger>
        <TabsTrigger value="vendors">Vendors ({vendors.length})</TabsTrigger>
      </TabsList>
      <TabsContent value="all" className="mt-4">
        {table(partners)}
      </TabsContent>
      <TabsContent value="consultants" className="mt-4">
        {table(consultants)}
      </TabsContent>
      <TabsContent value="vendors" className="mt-4">
        {table(vendors)}
      </TabsContent>
    </Tabs>
  )
}
