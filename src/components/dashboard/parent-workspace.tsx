import { PageHeader } from '@/components/ui/page-header'
import { MetricCard } from '@/components/ui/metric-card'
import { Bell, BookOpen, TrendingUp } from 'lucide-react'
import type { Profile } from '@/lib/database.types'

export async function ParentWorkspace({ profile }: { profile: Profile }) {
  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${profile.name?.split(' ')[0] ?? 'Parent'}`}
        subtitle="Stay connected with your student's school and progress"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Student Progress" value="—" subtext="Coming in Phase 4" icon={TrendingUp} accent="default" />
        <MetricCard label="Announcements" value={0} icon={Bell} accent="default" />
        <MetricCard label="School Resources" value="—" subtext="Coming soon" icon={BookOpen} accent="default" />
      </div>

      <div className="rounded-lg border border-dashed bg-muted/20 px-6 py-12 text-center">
        <h3 className="font-heading text-lg font-semibold">Student Progress Portal</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Detailed student progress, attendance, and portfolio views will be available in a future release.
          School announcements and community reporting are on the roadmap.
        </p>
      </div>
    </div>
  )
}
