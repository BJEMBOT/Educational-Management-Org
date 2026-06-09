import { cn } from '@/lib/utils'

interface DataTableWrapperProps {
  children: React.ReactNode
  toolbar?: React.ReactNode
  className?: string
}

export function DataTableWrapper({ children, toolbar, className }: DataTableWrapperProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {toolbar}
      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="overflow-x-auto">{children}</div>
      </div>
    </div>
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 px-6 py-16 text-center">
      <p className="font-medium text-foreground">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
