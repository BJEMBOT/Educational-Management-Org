'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteGoal, updateGoal } from '@/app/actions/goals'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { GoalFormDialog } from '@/components/goals/goal-form-dialog'
import { downloadCSV } from '@/lib/csv-export'
import { categoryLabels, goalStatusLabels } from '@/lib/school-health'
import type {
  GoalCategory,
  GoalStatus,
  GoalWithSchool,
  School,
} from '@/lib/database.types'

interface GoalsTableProps {
  goals: GoalWithSchool[]
  schools: School[]
  showSchoolColumn?: boolean
  showFilters?: boolean
  showExport?: boolean
  canManage?: boolean
}

export function GoalsTable({
  goals,
  schools,
  showSchoolColumn = true,
  showFilters = true,
  showExport = true,
  canManage = false,
}: GoalsTableProps) {
  const router = useRouter()
  const [schoolFilter, setSchoolFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [editingGoal, setEditingGoal] = useState<GoalWithSchool | null>(null)

  const filtered = useMemo(() => {
    return goals.filter((g) => {
      if (schoolFilter !== 'all' && g.school_id !== schoolFilter) return false
      if (categoryFilter !== 'all' && g.category !== categoryFilter) return false
      if (statusFilter !== 'all' && g.status !== statusFilter) return false
      return true
    })
  }, [goals, schoolFilter, categoryFilter, statusFilter])

  async function handleInlineUpdate(
    goal: GoalWithSchool,
    field: 'current_value' | 'status',
    value: string
  ) {
    const update =
      field === 'current_value'
        ? { current_value: Number(value) }
        : { status: value as GoalStatus }

    const result = await updateGoal(goal.id, goal.school_id, update)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Goal updated')
    router.refresh()
  }

  async function handleDelete(goal: GoalWithSchool) {
    const result = await deleteGoal(goal.id, goal.school_id)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Goal deleted')
    router.refresh()
  }

  function handleExport() {
    downloadCSV(
      'goals.csv',
      filtered.map((g) => ({
        school: g.school_name,
        category: categoryLabels[g.category],
        metric: g.metric_name,
        target: g.target_value,
        current: g.current_value,
        status: goalStatusLabels[g.status],
        time_period: g.time_period,
      }))
    )
  }

  if (goals.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">No goals yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="flex flex-wrap gap-3">
          {showSchoolColumn && (
            <Select value={schoolFilter} onValueChange={(v) => v && setSchoolFilter(v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="School" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Schools</SelectItem>
                {schools.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select value={categoryFilter} onValueChange={(v) => v && setCategoryFilter(v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {(Object.keys(categoryLabels) as GoalCategory[]).map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {categoryLabels[cat]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="on_track">On Track</SelectItem>
              <SelectItem value="at_risk">At Risk</SelectItem>
              <SelectItem value="off_track">Off Track</SelectItem>
            </SelectContent>
          </Select>
          {showExport && (
            <Button variant="outline" size="sm" className="ml-auto" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          )}
        </div>
      )}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {showSchoolColumn && <TableHead>School</TableHead>}
              <TableHead>Category</TableHead>
              <TableHead>Metric</TableHead>
              <TableHead className="text-right">Target</TableHead>
              <TableHead className="text-right">Current</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Period</TableHead>
              {canManage && <TableHead className="w-10" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={showSchoolColumn ? (canManage ? 8 : 7) : canManage ? 7 : 6}
                  className="text-center text-muted-foreground"
                >
                  No goals match the selected filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((goal) => (
                <TableRow key={goal.id}>
                  {showSchoolColumn && (
                    <TableCell className="font-medium">{goal.school_name}</TableCell>
                  )}
                  <TableCell>{categoryLabels[goal.category]}</TableCell>
                  <TableCell>{goal.metric_name}</TableCell>
                  <TableCell className="text-right">{goal.target_value}</TableCell>
                  <TableCell className="text-right">
                    {canManage ? (
                      <Input
                        type="number"
                        step="any"
                        className="h-8 w-20 ml-auto text-right"
                        defaultValue={goal.current_value}
                        onBlur={(e) => {
                          if (Number(e.target.value) !== goal.current_value) {
                            handleInlineUpdate(goal, 'current_value', e.target.value)
                          }
                        }}
                      />
                    ) : (
                      goal.current_value
                    )}
                  </TableCell>
                  <TableCell>
                    {canManage ? (
                      <Select
                        defaultValue={goal.status}
                        onValueChange={(v) => v && handleInlineUpdate(goal, 'status', v)}
                      >
                        <SelectTrigger className="h-8 w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="on_track">On Track</SelectItem>
                          <SelectItem value="at_risk">At Risk</SelectItem>
                          <SelectItem value="off_track">Off Track</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      goalStatusLabels[goal.status]
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {goal.time_period}
                  </TableCell>
                  {canManage && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon" className="h-8 w-8" />
                          }
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingGoal(goal)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(goal)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editingGoal && (
        <GoalFormDialog
          goal={editingGoal}
          schools={schools}
          open={!!editingGoal}
          onOpenChange={(open) => !open && setEditingGoal(null)}
        />
      )}
    </div>
  )
}
