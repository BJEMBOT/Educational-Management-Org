import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import type { ObservationWithDetails } from '@/lib/database.types'

export function ObservationList({
  observations,
}: {
  observations: ObservationWithDetails[]
}) {
  if (observations.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No observations recorded yet.</p>
    )
  }

  return (
    <ul className="divide-y rounded-lg border">
      {observations.map((obs) => (
        <li key={obs.id} className="space-y-2 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {obs.observation_type}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {format(new Date(obs.observation_date), 'MMM d, yyyy')}
            </span>
            {obs.observer_name && (
              <span className="text-sm text-muted-foreground">
                · {obs.observer_name}
              </span>
            )}
            {obs.rubric_scores.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {obs.rubric_scores.length} indicators scored
              </Badge>
            )}
          </div>
          <p className="text-sm font-medium">{obs.notes}</p>
          <p className="text-sm text-muted-foreground">{obs.feedback}</p>
          {obs.walkthrough_data &&
            Object.keys(obs.walkthrough_data).length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {Object.entries(obs.walkthrough_data).map(([key, value]) =>
                  value ? (
                    <span
                      key={key}
                      className="rounded-md bg-muted px-2 py-0.5 text-xs capitalize"
                    >
                      {key.replace(/_/g, ' ')}: {value}
                    </span>
                  ) : null
                )}
              </div>
            )}
        </li>
      ))}
    </ul>
  )
}
