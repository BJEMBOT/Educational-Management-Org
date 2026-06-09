'use client'

import { useRouter } from 'next/navigation'
import { Eye } from 'lucide-react'
import { toast } from 'sonner'
import { setDeveloperView } from '@/app/actions/developer-view'
import { appViewLabels, type PreviewAppView } from '@/lib/app-views'
import { labelsToSelectOptions } from '@/lib/select-options'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DEVELOPER_PREVIEW_VIEWS } from '@/lib/developer-view'

const previewViewLabels = Object.fromEntries(
  DEVELOPER_PREVIEW_VIEWS.map((view) => [view, appViewLabels[view]])
) as Record<PreviewAppView, string>
const viewOptions = labelsToSelectOptions(previewViewLabels)

export function DeveloperViewToggle({
  effectiveView,
  isPreview,
}: {
  effectiveView: PreviewAppView | 'developer'
  isPreview: boolean
}) {
  const router = useRouter()
  const selectValue = isPreview ? effectiveView : 'developer'

  async function handleChange(value: string | null) {
    if (!value) return
    const result = await setDeveloperView(value as PreviewAppView | 'developer')
    if (result.error) {
      toast.error(result.error)
      return
    }
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      {isPreview && (
        <Badge variant="outline" className="hidden border-amber-300 bg-amber-50 text-[10px] text-amber-900 sm:inline-flex">
          Preview
        </Badge>
      )}
      <Select value={selectValue} onValueChange={handleChange} items={viewOptions}>
        <SelectTrigger className="h-8 w-[140px] gap-1.5 text-xs lg:w-[160px]">
          <Eye className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <SelectValue placeholder="View as" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="developer">Developer</SelectItem>
          {DEVELOPER_PREVIEW_VIEWS.map((view) => (
            <SelectItem key={view} value={view}>
              {appViewLabels[view]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
