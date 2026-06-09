import Link from 'next/link'
import { Suspense } from 'react'
import { format } from 'date-fns'
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ClipboardList,
  BookOpen,
  Award,
  Target,
  Handshake,
} from 'lucide-react'
import {
  getSchoolsWithGoalStats,
  pickSchoolsNeedingAttention,
  summarizeSchools,
} from '@/lib/queries/schools'
import { getPdDashboardSnapshot, getPendingCertificationRenewals } from '@/lib/queries/pd'
import { getRecentOpenInterventions } from '@/lib/queries/interventions'
import { hasPermission } from '@/lib/permissions'
import { PageHeader } from '@/components/ui/page-header'
import { MetricCard } from '@/components/ui/metric-card'
import { SchoolStatusBadge } from '@/components/schools/school-status-badge'
import { Button } from '@/components/ui/button'
import { DashboardPanel } from '@/components/dashboard/dashboard-panel'
import {
  DashboardMetricsSkeleton,
  DashboardPanelsSkeleton,
} from '@/components/dashboard/dashboard-skeletons'
import type { Profile } from '@/lib/database.types'

export function ExecutiveDashboard({ profile }: { profile?: Profile | null }) {
  const canManageCerts = profile
    ? hasPermission(profile.role, 'certifications.manage')
    : false

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="What needs your attention across the network"
      />

      <Suspense fallback={<DashboardMetricsSkeleton count={6} />}>
        <ExecutiveMetrics />
      </Suspense>

      <div className="flex flex-wrap gap-2">
        <Link href="/schools"><Button variant="outline" size="sm">School Portfolio</Button></Link>
        <Link href="/goals"><Button variant="outline" size="sm"><Target className="mr-1.5 h-3.5 w-3.5" />Goals</Button></Link>
        <Link href="/interventions"><Button variant="outline" size="sm"><ClipboardList className="mr-1.5 h-3.5 w-3.5" />Interventions</Button></Link>
        <Link href="/partners"><Button variant="outline" size="sm"><Handshake className="mr-1.5 h-3.5 w-3.5" />Partners</Button></Link>
        <Link href="/certifications"><Button variant="outline" size="sm"><Award className="mr-1.5 h-3.5 w-3.5" />Certifications</Button></Link>
        <Link href="/pd"><Button variant="outline" size="sm"><BookOpen className="mr-1.5 h-3.5 w-3.5" />PD Catalog</Button></Link>
      </div>

      <Suspense fallback={<DashboardPanelsSkeleton count={canManageCerts ? 4 : 3} />}>
        <ExecutiveDashboardPanels canManageCerts={canManageCerts} />
      </Suspense>
    </div>
  )
}

async function ExecutiveMetrics() {
  const [schools, pdSnapshot] = await Promise.all([
    getSchoolsWithGoalStats(),
    getPdDashboardSnapshot().catch(() => ({
      summary: { upcoming: 0, totalCredits: 0 },
      upcoming: [],
    })),
  ])

  const summary = summarizeSchools(schools)

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <MetricCard label="Total Schools" value={summary.totalSchools} icon={Building2} accent="primary" />
      <MetricCard label="Healthy" value={summary.healthyCount} icon={CheckCircle2} accent="success" subtext="≥80% goals on track" />
      <MetricCard label="At Risk" value={summary.atRiskCount} icon={AlertTriangle} accent="warning" subtext="60–79% on track" />
      <MetricCard label="Off Track" value={summary.offTrackCount} icon={XCircle} accent="danger" subtext="<60% on track" />
      <MetricCard label="Open Interventions" value={summary.openInterventions} icon={ClipboardList} accent="default" />
      <MetricCard
        label="Upcoming PD"
        value={pdSnapshot.summary.upcoming}
        icon={BookOpen}
        accent="primary"
        subtext={`${pdSnapshot.summary.totalCredits} total credit hrs`}
      />
    </div>
  )
}

async function ExecutiveDashboardPanels({ canManageCerts }: { canManageCerts: boolean }) {
  const [schools, pdSnapshot, openInterventions, pendingRenewals] = await Promise.all([
    getSchoolsWithGoalStats(),
    getPdDashboardSnapshot().catch(() => ({ summary: { upcoming: 0, totalCredits: 0 }, upcoming: [] })),
    getRecentOpenInterventions(5),
    canManageCerts ? getPendingCertificationRenewals() : Promise.resolve([]),
  ])

  const attentionSchools = pickSchoolsNeedingAttention(schools, 5)
  const upcomingPd = pdSnapshot.upcoming

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <DashboardPanel title="Schools Needing Attention" href="/schools" hrefLabel="View portfolio →">
        {attentionSchools.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">All schools are on track.</p>
        ) : (
          <ul className="mt-3 divide-y">
            {attentionSchools.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-2.5">
                <div>
                  <Link href={`/schools/${s.id}`} className="text-sm font-medium hover:underline">
                    {s.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">{s.district} · {s.onTrackPercent}% on track</p>
                </div>
                <SchoolStatusBadge status={s.healthStatus} />
              </li>
            ))}
          </ul>
        )}
      </DashboardPanel>

      <DashboardPanel title="Open Interventions" href="/interventions">
        {openInterventions.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No open interventions.</p>
        ) : (
          <ul className="mt-3 divide-y">
            {openInterventions.map((i) => (
              <li key={i.id} className="py-2.5">
                <p className="text-sm font-medium line-clamp-1">{i.issue}</p>
                <p className="text-xs text-muted-foreground">
                  {i.school_name} · {format(new Date(i.date), 'MMM d, yyyy')}
                </p>
              </li>
            ))}
          </ul>
        )}
      </DashboardPanel>

      <DashboardPanel title="Upcoming PD" href="/pd" hrefLabel="View catalog →">
        {upcomingPd.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No upcoming sessions scheduled.</p>
        ) : (
          <ul className="mt-3 divide-y">
            {upcomingPd.map((e) => (
              <li key={e.id} className="py-2.5">
                <Link href={`/pd/${e.id}`} className="text-sm font-medium hover:underline">
                  {e.title}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(e.start_date), 'MMM d, yyyy')} · {e.credit_hours} hrs
                </p>
              </li>
            ))}
          </ul>
        )}
      </DashboardPanel>

      {canManageCerts && (
        <DashboardPanel title="Certification Alerts" href="/certifications" hrefLabel="Manage →">
          <div className="mt-3 space-y-2">
            {pendingRenewals.length > 0 ? (
              <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {pendingRenewals.length} renewal(s) pending your approval
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No pending renewal approvals.</p>
            )}
            <p className="text-xs text-muted-foreground">
              Staff with expiring certifications receive daily renewal reminders.
            </p>
          </div>
        </DashboardPanel>
      )}
    </div>
  )
}
