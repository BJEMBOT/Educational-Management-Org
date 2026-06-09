'use client'

import { useState } from 'react'
import { Lock } from 'lucide-react'
import { toast } from 'sonner'
import { unlockFinanceAccess } from '@/app/actions/finance-access'
import { FINANCE_UNLOCK_STORAGE_KEY } from '@/lib/finance-access'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function FinanceLockDialog({
  open,
  onOpenChange,
  onUnlocked,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUnlocked: () => void
}) {
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
    toast.success('Finance unlocked')
    setPin('')
    onOpenChange(false)
    onUnlocked()
  }

  function handleOpenChange(next: boolean) {
    if (!next) setPin('')
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Unlock Finance
          </DialogTitle>
          <DialogDescription>
            Enter the 5-digit access code to view financial data.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="finance-pin">Access code</Label>
            <Input
              id="finance-pin"
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
            {loading ? 'Verifying...' : 'Unlock'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
