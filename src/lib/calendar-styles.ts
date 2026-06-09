import type { CalendarEventType } from '@/lib/database.types'

const typeColors: Record<CalendarEventType, string> = {
  pd: 'bg-violet-100 text-violet-800 border-violet-200',
  coaching: 'bg-sky-100 text-sky-800 border-sky-200',
  evaluation: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  intervention: 'bg-amber-100 text-amber-800 border-amber-200',
  meeting: 'bg-blue-100 text-blue-800 border-blue-200',
  deadline: 'bg-rose-100 text-rose-800 border-rose-200',
  other: 'bg-gray-100 text-gray-700 border-gray-200',
}

export function getCalendarEventColor(type: CalendarEventType) {
  return typeColors[type]
}
