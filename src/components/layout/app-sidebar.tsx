'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Building2, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getNavForView, isNavItemActive } from '@/components/layout/nav-config'
import type { AppView } from '@/lib/app-views'
import { NavLink } from '@/components/layout/nav-link'
import { FinanceLockDialog } from '@/components/layout/finance-lock-dialog'
import { ItTicketDialog } from '@/components/support/it-ticket-dialog'
import { Badge } from '@/components/ui/badge'
import { FINANCE_UNLOCK_STORAGE_KEY } from '@/lib/finance-access'
export function AppSidebar({ view }: { view: AppView }) {
  const pathname = usePathname()
  const sections = getNavForView(view)
  const [financeUnlocked, setFinanceUnlocked] = useState(false)
  const [lockDialogOpen, setLockDialogOpen] = useState(false)

  useEffect(() => {
    setFinanceUnlocked(sessionStorage.getItem(FINANCE_UNLOCK_STORAGE_KEY) === 'true')
  }, [])

  return (
    <aside className="hidden min-h-screen w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary">
          <Building2 className="h-4 w-4 text-sidebar-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-none text-sidebar-foreground">Cultivating Learning</p>
          <p className="mt-0.5 text-[10px] uppercase tracking-widest text-sidebar-foreground/60">
            Education Management
          </p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {sections.map((section) => {
          const isLockedSection = section.locked && !financeUnlocked

          return (
            <div key={section.title} className="mb-5 last:mb-0">
              <div className="mb-1.5 flex items-center gap-1.5 px-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/50">
                  {section.title}
                </p>
                {section.locked && (
                  <button
                    type="button"
                    onClick={() => setLockDialogOpen(true)}
                    className={cn(
                      'inline-flex items-center rounded p-0.5 transition-colors',
                      isLockedSection
                        ? 'text-sidebar-foreground/50 hover:text-sidebar-foreground'
                        : 'text-emerald-500/80 hover:text-emerald-500'
                    )}
                    title={isLockedSection ? 'Enter access code to unlock' : 'Finance unlocked'}
                    aria-label={isLockedSection ? 'Unlock Finance section' : 'Finance unlocked'}
                  >
                    <Lock className="h-3 w-3" />
                  </button>
                )}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive =
                    !item.disabled &&
                    !isLockedSection &&
                    isNavItemActive(pathname, item.href)

                  if (isLockedSection) {
                    return (
                      <button
                        key={`${section.title}-${item.label}`}
                        type="button"
                        onClick={() => setLockDialogOpen(true)}
                        className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent/40 hover:text-sidebar-foreground/70"
                      >
                        <item.icon className="h-4 w-4 shrink-0 opacity-50" />
                        <span className="flex-1 truncate text-left">{item.label}</span>
                        <Lock className="h-3 w-3 shrink-0 opacity-50" />
                      </button>
                    )
                  }

                  return (
                    <div key={`${section.title}-${item.label}`} className="relative">
                      <NavLink
                        item={item}
                        isActive={isActive}
                        showExternalIcon
                        className={cn(
                          'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors',
                          item.disabled && 'pointer-events-none opacity-40',
                          isActive
                            ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                            : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
                        )}
                      />
                      {item.badge && (
                        <Badge
                          variant="outline"
                          className="pointer-events-none absolute right-2 top-1/2 h-4 -translate-y-1/2 border-sidebar-border px-1 text-[9px] text-sidebar-foreground/60"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>
      <div className="mt-auto border-t border-sidebar-border px-3 py-3">
        <ItTicketDialog
          triggerVariant="ghost"
          className="text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
        />
      </div>
      <FinanceLockDialog
        open={lockDialogOpen}
        onOpenChange={setLockDialogOpen}
        onUnlocked={() => setFinanceUnlocked(true)}
      />
    </aside>
  )
}

export function MobileNav({ view }: { view: AppView }) {
  const pathname = usePathname()
  const sections = getNavForView(view)
  const items = sections.flatMap((s) => s.items).filter((i) => !i.disabled).slice(0, 5)

  return (
    <nav className="flex gap-1 overflow-x-auto border-b bg-background px-2 py-1.5 md:hidden">
      {items.map((item) => {
        const isActive = isNavItemActive(pathname, item.href)
        return (
          <NavLink
            key={item.label}
            item={item}
            isActive={isActive}
            iconClassName="h-3.5 w-3.5"
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium',
              isActive && !item.external
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground'
            )}
          />
        )
      })}
    </nav>
  )
}
