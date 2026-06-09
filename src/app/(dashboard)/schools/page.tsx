import { SchoolPortfolio } from '@/components/schools/school-portfolio'
import { SchoolHealthList } from '@/components/schools/school-health-list'
import type { SchoolHealth } from '@/lib/database.types'

function isSchoolHealth(value: string | undefined): value is SchoolHealth {
  return value === 'healthy' || value === 'at_risk' || value === 'off_track'
}

export default async function SchoolsPage({
  searchParams,
}: {
  searchParams: Promise<{ health?: string }>
}) {
  const { health } = await searchParams

  if (isSchoolHealth(health)) {
    return <SchoolHealthList health={health} />
  }

  return <SchoolPortfolio />
}
