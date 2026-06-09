import Link from 'next/link'
import { Users, Eye, BookOpen } from 'lucide-react'
import { getCoachingCycles, summarizeCoachingCycles } from '@/lib/queries/coaching'
import { getPdDashboardSnapshot } from '@/lib/queries/pd'
import { PageHeader } from '@/components/ui/page-header'
import { MetricCard } from '@/components/ui/metric-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Profile } from '@/lib/database.types'

export async function CoachWorkspace({ profile }: { profile: Profile }) {
  const [cycles, pdSnapshot] = await Promise.all([
    getCoachingCycles({ coachId: profile.id }),
    getPdDashboardSnapshot(),
  ])

  const summary = summarizeCoachingCycles(cycles)

  const activeCycles = cycles.filter((c) => c.status === 'active')

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Coaching"
        subtitle="Manage coaching cycles, observations, and teacher growth"
        actions={
          <Link href="/coaching">
            <Button size="sm">New Coaching Cycle</Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Active Cycles" value={summary.active} icon={Users} accent="primary" />
        <MetricCard label="Teachers Supported" value={summary.teachers} icon={Users} accent="success" />
        <MetricCard label="Upcoming PD Events" value={pdSnapshot.summary.upcoming} icon={BookOpen} accent="default" />
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="font-heading text-base font-semibold">Active Coaching Cycles</h3>
          <Link href="/coaching">
            <Button size="sm" variant="outline">Log Observation</Button>
          </Link>
        </div>
        {activeCycles.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted-foreground">No active cycles. Start a coaching cycle to begin.</p>
        ) : (
          <ul className="divide-y">
            {activeCycles.map((c) => (
              <li key={c.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <Link href={`/coaching/${c.id}`} className="font-medium hover:underline">
                    {c.teacher_name}
                  </Link>
                  <p className="text-sm text-muted-foreground">{c.school_name} · {c.focus_area}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="h-3.5 w-3.5" />
                    {c.observation_count} observations
                  </span>
                  <Badge variant="outline" className="capitalize">{c.status}</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
