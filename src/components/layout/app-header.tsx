'use client'

import { usePathname, useRouter } from 'next/navigation'
import { LogOut, Bell, Search, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { roleLabels } from '@/lib/permissions'
import type { Profile } from '@/lib/database.types'
import Link from 'next/link'

const pathLabels: Record<string, string> = {
  '': 'Dashboard',
  workspace: 'My Workspace',
  goals: 'Goals',
  interventions: 'Interventions',
  schools: 'School Portfolio',
  'growth-plans': 'Growth Plans',
  coaching: 'Coaching',
  pd: 'PD Catalog',
  certifications: 'Certifications',
  partners: 'Partners',
  employees: 'Employees',
  administrators: 'Administrators',
  calendar: 'Calendar',
  messages: 'Messages',
  curriculum: 'Curriculum',
  revenue: 'Revenue',
}

function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) {
    return (
      <span className="text-sm font-medium text-foreground">Dashboard</span>
    )
  }

  return (
    <nav className="flex items-center gap-1 text-sm">
      <Link href="/" className="text-muted-foreground hover:text-foreground">
        Home
      </Link>
      {segments.map((seg, i) => {
        const href = '/' + segments.slice(0, i + 1).join('/')
        const label = pathLabels[seg] ?? seg
        const isLast = i === segments.length - 1
        return (
          <span key={href} className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            {isLast ? (
              <span className="font-medium text-foreground">{label}</span>
            ) : (
              <Link href={href} className="text-muted-foreground hover:text-foreground">
                {label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}

export function AppHeader({
  profile,
  alertCount = 0,
}: {
  profile: Profile | null
  alertCount?: number
}) {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = profile?.name
    ? profile.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b bg-card px-4 lg:px-6">
      <div className="hidden min-w-0 sm:block">
        <Breadcrumbs />
      </div>
      <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
        <div className="relative hidden max-w-xs flex-1 md:block">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search schools, plans, PD..."
            className="h-8 pl-8 text-xs"
            disabled
          />
        </div>
        <Button variant="ghost" size="icon" className="relative h-8 w-8">
          <Bell className="h-4 w-4" />
          {alertCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
              {alertCount}
            </span>
          )}
        </Button>
        {profile && (
          <div className="flex items-center gap-2 border-l pl-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {initials}
            </div>
            <div className="hidden lg:block">
              <p className="text-xs font-medium leading-none">{profile.name ?? 'User'}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {roleLabels[profile.role]}
              </p>
            </div>
            <Badge variant="secondary" className="hidden text-[10px] capitalize xl:inline-flex">
              {profile.role.replace('_', ' ')}
            </Badge>
          </div>
        )}
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
