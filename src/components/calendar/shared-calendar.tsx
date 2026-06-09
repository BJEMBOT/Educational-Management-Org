'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getCalendarEventColor } from '@/lib/calendar-styles'
import { cn } from '@/lib/utils'
import type { CalendarEventItem } from '@/lib/database.types'

const sourceLabels = {
  pd: 'PD',
  coaching: 'Coaching',
  intervention: 'Intervention',
  custom: 'Event',
} as const

export function SharedCalendar({ events }: { events: CalendarEventItem[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const gridStart = startOfWeek(monthStart)
  const gridEnd = endOfWeek(monthEnd)
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEventItem[]>()
    for (const event of events) {
      const key = format(new Date(event.start_at), 'yyyy-MM-dd')
      const list = map.get(key) ?? []
      list.push(event)
      map.set(key, list)
    }
    return map
  }, [events])

  const selectedEvents = eventsByDay.get(format(selectedDate, 'yyyy-MM-dd')) ?? []

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="font-heading text-lg font-semibold">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth((m) => addMonths(m, -1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date()
                setCurrentMonth(today)
                setSelectedDate(today)
              }}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-7 border-b text-center text-xs font-medium text-muted-foreground">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="py-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const key = format(day, 'yyyy-MM-dd')
            const dayEvents = eventsByDay.get(key) ?? []
            const isSelected = isSameDay(day, selectedDate)
            const inMonth = isSameMonth(day, currentMonth)
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedDate(day)}
                className={cn(
                  'min-h-[88px] border-b border-r p-1.5 text-left transition-colors hover:bg-muted/40',
                  !inMonth && 'bg-muted/20 text-muted-foreground',
                  isSelected && 'bg-primary/5 ring-1 ring-inset ring-primary/30'
                )}
              >
                <span
                  className={cn(
                    'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs',
                    isSameDay(day, new Date()) && 'bg-primary text-primary-foreground font-medium'
                  )}
                >
                  {format(day, 'd')}
                </span>
                <div className="mt-1 space-y-0.5">
                  {dayEvents.slice(0, 2).map((e) => (
                    <div
                      key={e.id}
                      className="truncate rounded px-1 py-0.5 text-[10px] font-medium bg-muted"
                    >
                      {e.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <p className="px-1 text-[10px] text-muted-foreground">
                      +{dayEvents.length - 2} more
                    </p>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <h3 className="font-heading text-base font-semibold">
          {format(selectedDate, 'EEEE, MMM d')}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {selectedEvents.length === 0
            ? 'No events scheduled'
            : `${selectedEvents.length} event${selectedEvents.length === 1 ? '' : 's'}`}
        </p>
        <ul className="mt-4 space-y-3">
          {selectedEvents.map((event) => {
            const content = (
              <div className="rounded-md border p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-sm">{event.title}</p>
                  <Badge
                    variant="outline"
                    className={cn('shrink-0 text-[10px]', getCalendarEventColor(event.event_type))}
                  >
                    {sourceLabels[event.source]}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {format(new Date(event.start_at), 'h:mm a')}
                  {event.end_at && ` – ${format(new Date(event.end_at), 'h:mm a')}`}
                </p>
                {event.school_name && (
                  <p className="mt-1 text-xs text-muted-foreground">{event.school_name}</p>
                )}
                {event.location && (
                  <p className="mt-1 text-xs text-muted-foreground">{event.location}</p>
                )}
              </div>
            )
            return (
              <li key={event.id}>
                {event.href ? (
                  <Link href={event.href} className="block hover:opacity-90">
                    {content}
                  </Link>
                ) : (
                  content
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
