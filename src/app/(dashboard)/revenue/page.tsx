import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { Plus, DollarSign } from 'lucide-react'
import { getCurrentProfile } from '@/lib/queries/profile'
import { hasFinanceAccess } from '@/lib/finance-access.server'
import { getRevenueEntries, getRevenueSummary } from '@/lib/queries/revenue'
import { FinanceUnlockScreen } from '@/components/layout/finance-unlock-screen'
import { getSchools } from '@/lib/queries/schools'
import { RevenueFormDialog } from '@/components/revenue/revenue-form-dialog'
import { FinancePinResetDialog } from '@/components/layout/finance-pin-reset-dialog'
import { PageHeader } from '@/components/ui/page-header'
import { MetricCard } from '@/components/ui/metric-card'
import { DataTableWrapper } from '@/components/ui/data-table-wrapper'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { RevenueSource } from '@/lib/database.types'

const sourceLabels: Record<RevenueSource, string> = {
  contract: 'Contract',
  pd: 'PD',
  consulting: 'Consulting',
  grant: 'Grant',
  other: 'Other',
}

const sourceStyles: Record<RevenueSource, string> = {
  contract: 'bg-blue-50 text-blue-800 border-blue-200',
  pd: 'bg-violet-50 text-violet-800 border-violet-200',
  consulting: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  grant: 'bg-amber-50 text-amber-800 border-amber-200',
  other: 'bg-gray-50 text-gray-700 border-gray-200',
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default async function RevenuePage() {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'developer') {
    redirect('/')
  }

  if (!(await hasFinanceAccess())) {
    return <FinanceUnlockScreen />
  }

  const [entries, summary, schools] = await Promise.all([
    getRevenueEntries(),
    getRevenueSummary(),
    getSchools(),
  ])

  const topSchools = Object.entries(summary.bySchool)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Revenue"
        subtitle="Financial overview — secured access"
        actions={
          <div className="flex items-center gap-2">
            <FinancePinResetDialog />
            <RevenueFormDialog
              schools={schools}
              trigger={
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Record Revenue
                </>
              }
            />
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Revenue"
          value={formatCurrency(summary.total)}
          icon={DollarSign}
          accent="primary"
          subtext={`${summary.entryCount} entries`}
        />
        <MetricCard
          label="Year to Date"
          value={formatCurrency(summary.ytd)}
          icon={DollarSign}
          accent="success"
          subtext={String(new Date().getFullYear())}
        />
        <MetricCard
          label="Contracts"
          value={formatCurrency(summary.bySource.contract)}
          accent="default"
        />
        <MetricCard
          label="Grants & Other"
          value={formatCurrency(summary.bySource.grant + summary.bySource.other + summary.bySource.pd + summary.bySource.consulting)}
          accent="default"
        />
      </div>

      {topSchools.length > 0 && (
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <h2 className="font-heading text-base font-semibold">Revenue by School</h2>
          <ul className="mt-3 space-y-2">
            {topSchools.map(([name, amount]) => (
              <li key={name} className="flex items-center justify-between text-sm">
                <span>{name}</span>
                <span className="font-medium">{formatCurrency(amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <DataTableWrapper>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>School</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  No revenue entries yet.
                </TableCell>
              </TableRow>
            ) : (
              entries.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>
                    <p className="font-medium">{e.description}</p>
                    {e.notes && (
                      <p className="text-xs text-muted-foreground">{e.notes}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('text-xs', sourceStyles[e.source])}>
                      {sourceLabels[e.source]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {e.school_name ?? '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(e.revenue_date), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(Number(e.amount))}
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
