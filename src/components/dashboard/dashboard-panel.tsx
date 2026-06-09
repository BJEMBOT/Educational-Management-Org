import Link from 'next/link'
import { cn } from '@/lib/utils'

export function DashboardPanel({
  title,
  href,
  hrefLabel = 'View all →',
  className,
  children,
}: {
  title: string
  href?: string
  hrefLabel?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('rounded-lg border bg-card p-5 shadow-sm', className)}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-base font-semibold">{title}</h2>
        {href && (
          <Link href={href} className="shrink-0 text-xs text-primary hover:underline">
            {hrefLabel}
          </Link>
        )}
      </div>
      {children}
    </div>
  )
}
