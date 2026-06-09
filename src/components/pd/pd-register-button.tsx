'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { registerForPd } from '@/app/actions/pd'
import { Button } from '@/components/ui/button'

export function PdRegisterButton({ eventId, userId }: { eventId: string; userId: string }) {
  const router = useRouter()

  async function handleRegister() {
    const result = await registerForPd(eventId, userId)
    if (result.error) { toast.error(result.error); return }
    toast.success('Registered for PD event')
    router.refresh()
  }

  return (
    <Button size="sm" onClick={handleRegister}>Register</Button>
  )
}
