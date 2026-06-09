import Link from 'next/link'
import { format } from 'date-fns'
import { Sprout, Users, BookOpen, Award, ClipboardCheck } from 'lucide-react'
import { getGrowthPlans, summarizeGrowthPlans } from '@/lib/queries/growth-plans'
import { getCoachingCycles, getNextCheckInForTeacher } from '@/lib/queries/coaching'
import { getActiveEvaluationForTeacher } from '@/lib/queries/evaluations'
import { EvaluationRatingBadge, EvaluationStatusBadge } from '@/components/evaluations/evaluation-status-badge'
import { frequencyLabels } from '@/lib/coaching-schedule'
import { getUserRegistrations, getCertifications } from '@/lib/queries/pd'
import { PageHeader } from '@/components/ui/page-header'
import { MetricCard } from '@/components/ui/metric-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Profile } from '@/lib/database.types'

export async function TeacherWorkspace({ profile }: { profile: Profile }) {
  const [plans, cycles, registrations, certs, nextCheckIn, activeEvaluation] =
    await Promise.all([
      getGrowthPlans(profile.id),
      getCoachingCycles({ teacherId: profile.id }),
      getUserRegistrations(profile.id),
      getCertifications(profile.id),
      getNextCheckInForTeacher(profile.id),
      getActiveEvaluationForTeacher(profile.id),
    ])

  const planSummary = summarizeGrowthPlans(plans)

  const activeCycle = cycles.find((c) => c.status === 'active')
  const upcomingPd = registrations.filter((r) => r.status === 'registered').slice(0, 3)
  const expiringCerts = certs.filter((c) => c.status === 'expiring' || c.status === 'expired')

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${profile.name?.split(' ')[0] ?? 'Educator'}`}
        subtitle="Your unified workspace for growth, coaching, and professional development"
        actions={
          <Link href="/growth-plans">
            <Button size="sm">New Growth Plan</Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Growth Plans" value={planSummary.active} subtext={`${planSummary.total} total`} icon={Sprout} accent="primary" />
        <MetricCard label="Coaching Cycles" value={cycles.filter((c) => c.status === 'active').length} icon={Users} accent="success" />
        <MetricCard label="PD Registered" value={registrations.length} icon={BookOpen} accent="default" />
        <MetricCard label="Certifications" value={certs.length} subtext={expiringCerts.length > 0 ? `${expiringCerts.length} need attention` : 'All current'} icon={Award} accent={expiringCerts.length > 0 ? 'warning' : 'success'} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <h3 className="font-heading text-base font-semibold">My Growth Plans</h3>
          {plans.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No growth plans yet. Create one to set your professional goals.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {plans.slice(0, 4).map((p) => (
                <li key={p.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                  <div>
                    <Link href={`/growth-plans/${p.id}`} className="text-sm font-medium hover:underline">
                      {p.school_year} — {p.school_name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{p.goal_count} goals</p>
                  </div>
                  <Badge variant="outline" className="capitalize text-xs">{p.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-base font-semibold">Teacher Evaluation</h3>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </div>
          {activeEvaluation ? (
            <div className="mt-3 space-y-2">
              <p className="text-sm">
                <span className="text-muted-foreground">School year:</span>{' '}
                {activeEvaluation.school_year}
              </p>
              <p className="text-sm text-muted-foreground">
                {activeEvaluation.framework_name} · Evaluator:{' '}
                {activeEvaluation.evaluator_name}
              </p>
              <div className="flex flex-wrap gap-2">
                <EvaluationStatusBadge status={activeEvaluation.status} />
                <EvaluationRatingBadge rating={activeEvaluation.overall_rating} />
              </div>
              <Link href={`/evaluations/${activeEvaluation.id}`} className="mt-2 inline-block">
                <Button size="sm" variant="outline">
                  View evaluation
                </Button>
              </Link>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              No active evaluation cycle assigned.
            </p>
          )}
        </div>

        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <h3 className="font-heading text-base font-semibold">Latest Coaching Feedback</h3>
          {activeCycle ? (
            <div className="mt-3 space-y-2">
              <p className="text-sm"><span className="text-muted-foreground">Coach:</span> {activeCycle.coach_name}</p>
              <p className="text-sm"><span className="text-muted-foreground">Focus:</span> {activeCycle.focus_area}</p>
              <p className="text-sm text-muted-foreground">
                {frequencyLabels[activeCycle.check_in_frequency]} check-ins ·{' '}
                {activeCycle.observation_count} observations logged
              </p>
              {nextCheckIn && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Next check-in:</span>{' '}
                  {format(new Date(nextCheckIn.scheduled_at), 'MMM d, yyyy · h:mm a')}
                </p>
              )}
              <Link href={`/coaching/${activeCycle.id}`} className="mt-2 inline-block">
                <Button size="sm" variant="outline">View Cycle</Button>
              </Link>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">No active coaching cycle assigned.</p>
          )}
        </div>

        <div className="rounded-lg border bg-card p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-base font-semibold">Upcoming Professional Development</h3>
            <Link href="/pd" className="text-xs text-primary hover:underline">Browse catalog →</Link>
          </div>
          {upcomingPd.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No upcoming PD registrations.</p>
          ) : (
            <ul className="mt-3 divide-y">
              {upcomingPd.map((r) => (
                <li key={r.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">{r.event_title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(r.start_date), 'MMM d, yyyy')} · {r.credit_hours} hrs
                      {r.assigned_by_name && (
                        <span className="ml-1 text-primary">
                          · Assigned by {r.assigned_by_name}
                        </span>
                      )}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">{r.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
