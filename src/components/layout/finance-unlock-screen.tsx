'use client'

import { useState } from 'react'
import { Lock } from 'lucide-react'
import { toast } from 'sonner'
import { unlockFinanceAccess } from '@/app/actions/finance-access'
import { FINANCE_UNLOCK_STORAGE_KEY } from '@/lib/finance-access'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function FinanceUnlockScreen() {
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (pin.length !== 5) {
      toast.error('Enter the 5-digit access code.')
      return
    }
    setLoading(true)
    const result = await unlockFinanceAccess(pin)
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
      setPin('')
      return
    }
    sessionStorage.setItem(FINANCE_UNLOCK_STORAGE_KEY, 'true')
    window.location.reload()
  }

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="w-full max-w-sm rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5 text-muted-foreground" />
          <h1 className="font-heading text-lg font-semibold">Finance Access</h1>
        </div>
        <p className="mb-6 text-sm text-muted-foreground">
          Enter the 5-digit access code to view revenue data.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="finance-page-pin">Access code</Label>
            <Input
              id="finance-page-pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={5}
              autoComplete="off"
              placeholder="•••••"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 5))}
              className="text-center text-lg tracking-[0.4em]"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading || pin.length !== 5}>
            {loading ? 'Verifying...' : 'Unlock Finance'}
          </Button>
        </form>
      </div>
    </div>
  )
}
