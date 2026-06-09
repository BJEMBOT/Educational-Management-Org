'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { categoryLabels } from '@/lib/school-health'
import type { Goal, GoalCategory } from '@/lib/database.types'

export function GoalsCategoryChart({ goals }: { goals: Goal[] }) {
  const categories = Object.keys(categoryLabels) as GoalCategory[]

  const data = categories.map((category) => {
    const categoryGoals = goals.filter((g) => g.category === category)
    const avgTarget =
      categoryGoals.length > 0
        ? categoryGoals.reduce((sum, g) => sum + Number(g.target_value), 0) /
          categoryGoals.length
        : 0
    const avgCurrent =
      categoryGoals.length > 0
        ? categoryGoals.reduce((sum, g) => sum + Number(g.current_value), 0) /
          categoryGoals.length
        : 0

    return {
      category: categoryLabels[category],
      target: Math.round(avgTarget * 10) / 10,
      current: Math.round(avgCurrent * 10) / 10,
    }
  }).filter((d) => d.target > 0 || d.current > 0)

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        No goal data to display
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="category" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="target" name="Target" fill="#94a3b8" radius={[4, 4, 0, 0]} />
        <Bar dataKey="current" name="Current" fill="#2563eb" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
