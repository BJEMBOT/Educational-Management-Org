'use client'

import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { INSIGHTS_URL } from '@/lib/insights'
import type { NavItem } from '@/components/layout/nav-config'

export function NavLink({
  item,
  isActive,
  className,
  iconClassName,
  showExternalIcon,
}: {
  item: NavItem
  isActive?: boolean
  className?: string
  iconClassName?: string
  showExternalIcon?: boolean
}) {
  const content = (
    <>
      <item.icon className={cn('h-4 w-4 shrink-0 opacity-80', iconClassName)} />
      <span className="flex-1 truncate">{item.label}</span>
      {showExternalIcon && item.external && (
        <ExternalLink className="h-3 w-3 shrink-0 opacity-50" />
      )}
    </>
  )

  if (item.external) {
    return (
      <a
        href={INSIGHTS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {content}
      </a>
    )
  }

  return (
    <Link
      href={item.disabled ? '#' : item.href}
      aria-disabled={item.disabled}
      className={className}
    >
      {content}
    </Link>
  )
}
