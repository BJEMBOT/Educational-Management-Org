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
import { roleLabels, partnerUserTypeLabels } from '@/lib/permissions'
import type { PartnerUser } from '@/lib/database.types'

export function PartnerUsersTable({
  users,
  showOrganization = true,
}: {
  users: PartnerUser[]
  showOrganization?: boolean
}) {
  if (users.length === 0) {
    return (
      <div className="rounded-lg border bg-card px-5 py-10 text-center text-sm text-muted-foreground">
        No users in this category yet.
      </div>
    )
  }

  return (
    <DataTableWrapper>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            {showOrganization && <TableHead>Organization</TableHead>}
            <TableHead>Role</TableHead>
            <TableHead>Type</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name ?? 'Unnamed user'}</TableCell>
              {showOrganization && (
                <TableCell className="text-muted-foreground">
                  {user.partner_name ?? '—'}
                </TableCell>
              )}
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {roleLabels[user.role]}
                </Badge>
              </TableCell>
              <TableCell>
                {user.partner_user_type ? (
                  <Badge variant="outline" className="text-xs">
                    {partnerUserTypeLabels[user.partner_user_type]}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DataTableWrapper>
  )
}
