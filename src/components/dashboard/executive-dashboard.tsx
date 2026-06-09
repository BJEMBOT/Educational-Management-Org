import Link from 'next/link'
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
  getDashboardSummary,
  getSchoolsNeedingAttention,
} from '@/lib/queries/schools'
import { getPdSummary, getPdEvents, getPendingCertificationRenewals } from '@/lib/queries/pd'
import { getRecentOpenInterventions } from '@/lib/queries/interventions'
import { getCurrentProfile } from '@/lib/queries/profile'
import { hasPermission } from '@/lib/permissions'
import { PageHeader } from '@/components/ui/page-header'
import { MetricCard } from '@/components/ui/metric-card'
import { SchoolStatusBadge } from '@/components/schools/school-status-badge'
import { Button } from '@/components/ui/button'
export async function ExecutiveDashboard() {
  const profile = await getCurrentProfile()
  const canManageCerts = profile
    ? hasPermission(profile.role, 'certifications.manage')
    : false

  const [
    summary,
    pdSummary,
    attentionSchools,
    openInterventions,
    pdEvents,
    pendingRenewals,
  ] = await Promise.all([
    getDashboardSummary(),
    getPdSummary().catch(() => ({ upcoming: 0, totalCredits: 0 })),
    getSchoolsNeedingAttention(5),
    getRecentOpenInterventions(5),
    getPdEvents().catch(() => []),
    canManageCerts ? getPendingCertificationRenewals() : Promise.resolve([]),
  ])

  const upcomingPd = pdEvents
    .filter((e) => e.status === 'scheduled')
    .slice(0, 3)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="What needs your attention across the network"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard label="Total Schools" value={summary.totalSchools} icon={Building2} accent="primary" />
        <MetricCard label="Healthy" value={summary.healthyCount} icon={CheckCircle2} accent="success" subtext="≥80% goals on track" />
        <MetricCard label="At Risk" value={summary.atRiskCount} icon={AlertTriangle} accent="warning" subtext="60–79% on track" />
        <MetricCard label="Off Track" value={summary.offTrackCount} icon={XCircle} accent="danger" subtext="<60% on track" />
        <MetricCard label="Open Interventions" value={summary.openInterventions} icon={ClipboardList} accent="default" />
        <MetricCard label="Upcoming PD" value={pdSummary.upcoming} icon={BookOpen} accent="primary" subtext={`${pdSummary.totalCredits} total credit hrs`} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/schools"><Button variant="outline" size="sm">School Portfolio</Button></Link>
        <Link href="/goals"><Button variant="outline" size="sm"><Target className="mr-1.5 h-3.5 w-3.5" />Goals</Button></Link>
        <Link href="/interventions"><Button variant="outline" size="sm"><ClipboardList className="mr-1.5 h-3.5 w-3.5" />Interventions</Button></Link>
        <Link href="/partners"><Button variant="outline" size="sm"><Handshake className="mr-1.5 h-3.5 w-3.5" />Partners</Button></Link>
        <Link href="/certifications"><Button variant="outline" size="sm"><Award className="mr-1.5 h-3.5 w-3.5" />Certifications</Button></Link>
        <Link href="/pd"><Button variant="outline" size="sm"><BookOpen className="mr-1.5 h-3.5 w-3.5" />PD Catalog</Button></Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-base font-semibold">Schools Needing Attention</h2>
            <Link href="/schools" className="text-xs text-primary hover:underline">View portfolio →</Link>
          </div>
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
        </div>

        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-base font-semibold">Open Interventions</h2>
            <Link href="/interventions" className="text-xs text-primary hover:underline">View all →</Link>
          </div>
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
        </div>

        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-base font-semibold">Upcoming PD</h2>
            <Link href="/pd" className="text-xs text-primary hover:underline">View catalog →</Link>
          </div>
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
        </div>

        {canManageCerts && (
          <div className="rounded-lg border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-base font-semibold">Certification Alerts</h2>
              <Link href="/certifications" className="text-xs text-primary hover:underline">Manage →</Link>
            </div>
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
          </div>
        )}
      </div>
    </div>
  )
}
