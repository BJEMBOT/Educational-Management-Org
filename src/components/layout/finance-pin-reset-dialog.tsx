'use client'

import { useState } from 'react'
import { KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import { resetFinancePin } from '@/app/actions/finance-access'
import { FINANCE_UNLOCK_STORAGE_KEY } from '@/lib/finance-access'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTriggerButton,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function PinInput({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={5}
        autoComplete="off"
        placeholder="•••••"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 5))}
        className="text-center tracking-[0.4em]"
      />
    </div>
  )
}

export function FinancePinResetDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')

  function resetForm() {
    setCurrentPin('')
    setNewPin('')
    setConfirmPin('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (currentPin.length !== 5 || newPin.length !== 5 || confirmPin.length !== 5) {
      toast.error('All codes must be 5 digits.')
      return
    }
    if (newPin !== confirmPin) {
      toast.error('New codes do not match.')
      return
    }

    setLoading(true)
    const result = await resetFinancePin(currentPin, newPin)
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    sessionStorage.removeItem(FINANCE_UNLOCK_STORAGE_KEY)
    toast.success('Access code updated. Re-enter the new code to unlock Finance.')
    resetForm()
    setOpen(false)
    window.location.reload()
  }

  function handleOpenChange(next: boolean) {
    if (!next) resetForm()
    setOpen(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTriggerButton size="sm" variant="outline">
        <KeyRound className="mr-2 h-4 w-4" />
        Reset Access Code
      </DialogTriggerButton>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Reset Finance Access Code</DialogTitle>
          <DialogDescription>
            Developer only. Enter the current code and choose a new 5-digit code.
            All users will need the new code to unlock Finance.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <PinInput
            id="current-pin"
            label="Current code"
            value={currentPin}
            onChange={setCurrentPin}
          />
          <PinInput
            id="new-pin"
            label="New code"
            value={newPin}
            onChange={setNewPin}
          />
          <PinInput
            id="confirm-pin"
            label="Confirm new code"
            value={confirmPin}
            onChange={setConfirmPin}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={
              loading ||
              currentPin.length !== 5 ||
              newPin.length !== 5 ||
              confirmPin.length !== 5
            }
          >
            {loading ? 'Saving...' : 'Update Access Code'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
