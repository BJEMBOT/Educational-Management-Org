'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { canViewPartnerUserDirectory } from '@/lib/permissions'
import type { UserRole } from '@/lib/database.types'

const tabs = [
  { href: '/partners', label: 'Partners', exact: true },
  { href: '/partners/employees', label: 'Employees', exact: false },
  { href: '/partners/administrators', label: 'Administrators', exact: false },
] as const

export function PartnersNavTabs({ role }: { role: UserRole }) {
  const pathname = usePathname()
  const showUserTabs = canViewPartnerUserDirectory(role)
  const visibleTabs = showUserTabs
    ? tabs
    : tabs.filter((tab) => tab.href === '/partners')

  return (
    <div className="inline-flex rounded-lg border bg-muted/40 p-1">
      {visibleTabs.map((tab) => {
        const active = tab.exact
          ? pathname === tab.href
          : pathname === tab.href || pathname.startsWith(`${tab.href}/`)

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
              active
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
