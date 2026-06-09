export const FINANCE_ACCESS_COOKIE = 'finance_access'
export const FINANCE_UNLOCK_STORAGE_KEY = 'finance_unlocked'

export const FINANCE_PIN_LENGTH = 5

export function isValidFinancePinFormat(pin: string): boolean {
  return /^\d{5}$/.test(pin)
}
