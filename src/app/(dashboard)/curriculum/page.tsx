'use client'

import { useEffect } from 'react'
import { ExternalLink, GraduationCap } from 'lucide-react'
import { INSIGHTS_URL } from '@/lib/insights'
import { Button } from '@/components/ui/button'

export default function CurriculumPage() {
  useEffect(() => {
    window.open(INSIGHTS_URL, '_blank', 'noopener,noreferrer')
  }, [])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <GraduationCap className="h-10 w-10 text-primary" />
      <h2 className="mt-4 font-heading text-lg font-semibold">Opening Insights</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Curriculum opens in a new tab. If it didn&apos;t open, use the button below.
      </p>
      <a href={INSIGHTS_URL} target="_blank" rel="noopener noreferrer" className="mt-6">
        <Button>
          Open Insights
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      </a>
    </div>
  )
}
