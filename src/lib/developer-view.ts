import {
  PREVIEW_APP_VIEWS,
  isPreviewAppView,
  type PreviewAppView,
} from '@/lib/app-views'

export const DEVELOPER_VIEW_COOKIE = 'developer_view_role'

/** Views a developer can preview (the four app personas only) */
export const DEVELOPER_PREVIEW_VIEWS: PreviewAppView[] = PREVIEW_APP_VIEWS

export function isDeveloperPreviewView(value: string): value is PreviewAppView {
  return isPreviewAppView(value)
}
