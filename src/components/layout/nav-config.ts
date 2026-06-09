import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  Building2,
  Target,
  AlertTriangle,
  Sprout,
  Users,
  BookOpen,
  Award,
  GraduationCap,
  BarChart3,
  Heart,
  Globe,
  Handshake,
  DollarSign,
  Calendar,
  MessageSquare,
  ClipboardCheck,
} from 'lucide-react'
import { isNavVisibleForView, type AppView } from '@/lib/app-views'

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  views: AppView[]
  badge?: string
  disabled?: boolean
  external?: boolean
}

export interface NavSection {
  title: string
  items: NavItem[]
  locked?: boolean
}

export const navSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      {
        href: '/',
        label: 'Dashboard',
        icon: LayoutDashboard,
        views: ['admin', 'staff'],
      },
      {
        href: '/workspace',
        label: 'My Workspace',
        icon: LayoutDashboard,
        views: ['teacher'],
      },
      {
        href: '/partners',
        label: 'My Organization',
        icon: Handshake,
        views: ['partner'],
      },
    ],
  },
  {
    title: 'Operations',
    items: [
      {
        href: '/schools',
        label: 'School Portfolio',
        icon: Building2,
        views: ['admin', 'staff'],
      },
      {
        href: '/goals',
        label: 'Goals',
        icon: Target,
        views: ['admin', 'staff'],
      },
      {
        href: '/interventions',
        label: 'Interventions',
        icon: AlertTriangle,
        views: ['admin', 'staff'],
      },
    ],
  },
  {
    title: 'Professional Development',
    items: [
      {
        href: '/growth-plans',
        label: 'Growth Plans',
        icon: Sprout,
        views: ['admin', 'staff', 'teacher'],
      },
      {
        href: '/coaching',
        label: 'Coaching',
        icon: Users,
        views: ['admin', 'staff', 'teacher'],
      },
      {
        href: '/evaluations',
        label: 'Evaluations',
        icon: ClipboardCheck,
        views: ['admin', 'staff'],
      },
      {
        href: '/pd',
        label: 'PD Catalog',
        icon: BookOpen,
        views: ['admin', 'staff', 'teacher', 'partner'],
      },
      {
        href: '/certifications',
        label: 'Certifications',
        icon: Award,
        views: ['admin', 'staff', 'teacher'],
      },
    ],
  },
  {
    title: 'Network',
    items: [
      {
        href: '/partners',
        label: 'Partners',
        icon: Handshake,
        views: ['admin', 'staff', 'partner'],
      },
      {
        href: '/partners/employees',
        label: 'Employees',
        icon: Handshake,
        views: ['admin', 'partner'],
      },
      {
        href: '/partners/administrators',
        label: 'Administrators',
        icon: Handshake,
        views: ['admin', 'partner'],
      },
    ],
  },
  {
    title: 'Collaboration',
    items: [
      {
        href: '/calendar',
        label: 'Calendar',
        icon: Calendar,
        views: ['admin', 'staff', 'teacher', 'partner'],
      },
      {
        href: '/messages',
        label: 'Messages',
        icon: MessageSquare,
        views: ['admin', 'staff', 'teacher', 'partner'],
      },
    ],
  },
  {
    title: 'Finance',
    locked: true,
    items: [
      {
        href: '/revenue',
        label: 'Revenue',
        icon: DollarSign,
        views: ['admin'],
      },
    ],
  },
  {
    title: 'Learning',
    items: [
      {
        href: '/curriculum',
        label: 'Curriculum',
        icon: GraduationCap,
        external: true,
        views: ['admin', 'staff', 'teacher'],
      },
    ],
  },
  {
    title: 'Coming Soon',
    items: [
      {
        href: '#',
        label: 'MTSS & IEP',
        icon: Heart,
        views: ['admin'],
        badge: 'Soon',
        disabled: true,
      },
      {
        href: '#',
        label: 'Analytics',
        icon: BarChart3,
        views: ['admin'],
        badge: 'Soon',
        disabled: true,
      },
      {
        href: '#',
        label: 'Community',
        icon: Globe,
        views: ['admin'],
        badge: 'Soon',
        disabled: true,
      },
    ],
  },
]

export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === '#') return false
  if (href === '/') return pathname === '/'
  if (href === '/partners') return pathname === '/partners'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function getNavForView(view: AppView): NavSection[] {
  return navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => isNavVisibleForView(item.views, view)),
    }))
    .filter((section) => section.items.length > 0)
}
