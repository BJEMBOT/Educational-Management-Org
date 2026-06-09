import { Badge } from '@/components/ui/badge'
import { roleLabels } from '@/lib/role-labels'
import type { UserRole } from '@/lib/database.types'

export function PdRegistrationsList({
  registrations,
}: {
  registrations: {
    id: string
    status: string
    user_name: string
    user_role: string
    assigned_by_name: string | null
  }[]
}) {
  if (registrations.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No registrations yet.</p>
    )
  }

  return (
    <ul className="divide-y rounded-lg border">
      {registrations.map((r) => (
        <li key={r.id} className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-sm font-medium">{r.user_name}</p>
            <p className="text-xs text-muted-foreground">
              {roleLabels[r.user_role as UserRole] ?? r.user_role}
              {r.assigned_by_name && (
                <span className="ml-2 text-primary">
                  · Assigned by {r.assigned_by_name}
                </span>
              )}
            </p>
          </div>
          <Badge variant="outline" className="capitalize text-xs">
            {r.status}
          </Badge>
        </li>
      ))}
    </ul>
  )
}
