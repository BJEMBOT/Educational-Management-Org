'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { isPreviewAppView, type PreviewAppView } from '@/lib/app-views'
import { getCurrentProfile } from '@/lib/queries/profile'
import {
  DEVELOPER_VIEW_COOKIE,
  isDeveloperPreviewView,
} from '@/lib/developer-view'

export async function setDeveloperView(view: PreviewAppView | 'developer') {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'developer') {
    return { error: 'Only developers can switch preview views.' as const }
  }

  const cookieStore = await cookies()

  if (view === 'developer') {
    cookieStore.delete(DEVELOPER_VIEW_COOKIE)
  } else if (isDeveloperPreviewView(view)) {
    cookieStore.set(DEVELOPER_VIEW_COOKIE, view, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    })
  } else {
    return { error: 'Invalid preview view.' as const }
  }

  revalidatePath('/', 'layout')
  return { success: true as const }
}

/** @deprecated use setDeveloperView */
export async function setDeveloperViewRole(view: PreviewAppView | 'developer') {
  if (view === 'developer' || isPreviewAppView(view)) {
    return setDeveloperView(view)
  }
  return { error: 'Invalid preview view.' as const }
}
