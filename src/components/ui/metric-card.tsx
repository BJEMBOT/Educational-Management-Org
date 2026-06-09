import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

type Accent = 'default' | 'success' | 'warning' | 'danger' | 'primary'

const accentStyles: Record<Accent, string> = {
  default: 'border-l-slate-400',
  success: 'border-l-emerald-500',
  warning: 'border-l-amber-500',
  danger: 'border-l-red-500',
  primary: 'border-l-primary',
}

const valueStyles: Record<Accent, string> = {
  default: 'text-foreground',
  success: 'text-emerald-700',
  warning: 'text-amber-700',
  danger: 'text-red-700',
  primary: 'text-primary',
}

interface MetricCardProps {
  label: string
  value: string | number
  subtext?: string
  icon?: LucideIcon
  accent?: Accent
  href?: string
  className?: string
}

export function MetricCard({
  label,
  value,
  subtext,
  icon: Icon,
  accent = 'default',
  href,
  className,
}: MetricCardProps) {
  const content = (
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className={cn('text-2xl font-semibold tabular-nums', valueStyles[accent])}>
          {value}
        </p>
        {subtext && (
          <p className="text-xs text-muted-foreground">{subtext}</p>
        )}
      </div>
      {Icon && (
        <div className="rounded-md bg-muted/60 p-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </div>
  )

  const cardClassName = cn(
    'rounded-lg border border-l-4 bg-card p-4 shadow-sm',
    accentStyles[accent],
    href && 'transition-shadow hover:shadow-md',
    className
  )

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          cardClassName,
          'block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
        )}
      >
        {content}
      </Link>
    )
  }

  return <div className={cardClassName}>{content}</div>
}
