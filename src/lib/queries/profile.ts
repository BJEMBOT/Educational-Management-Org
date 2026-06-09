import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import {
  getDeveloperPreviewView,
  getEffectiveRole,
  getEffectiveView,
} from '@/lib/developer-view-server'
import type { AppView } from '@/lib/app-views'
import type { Profile, UserRole } from '@/lib/database.types'

export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return data
})

export const getProfileViewContext = cache(async () => {
  const profile = await getCurrentProfile()
  if (!profile) {
    return {
      profile: null,
      effectiveView: 'staff' as AppView,
      effectiveRole: 'staff' as UserRole,
      isDeveloperPreview: false,
    }
  }

  const effectiveView = await getEffectiveView(profile.role)
  const effectiveRole = await getEffectiveRole(profile.role)
  const previewView =
    profile.role === 'developer' ? await getDeveloperPreviewView() : null

  return {
    profile,
    effectiveView,
    effectiveRole,
    isDeveloperPreview: profile.role === 'developer' && previewView !== null,
  }
})
