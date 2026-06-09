import { Skeleton } from '@/components/ui/skeleton'
import {
  DashboardMetricsSkeleton,
  DashboardPanelsSkeleton,
} from '@/components/dashboard/dashboard-skeletons'

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <DashboardMetricsSkeleton count={6} />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-28 rounded-md" />
        ))}
      </div>
      <DashboardPanelsSkeleton count={4} />
    </div>
  )
}
