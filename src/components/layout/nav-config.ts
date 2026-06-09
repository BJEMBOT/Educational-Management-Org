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
} from 'lucide-react'
import type { UserRole } from '@/lib/database.types'

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  roles: UserRole[]
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
        roles: ['admin', 'regional_manager', 'staff', 'board_member', 'developer'],
      },
      {
        href: '/workspace',
        label: 'My Workspace',
        icon: LayoutDashboard,
        roles: ['teacher', 'coach', 'consultant', 'parent'],
      },
      {
        href: '/partners',
        label: 'My Organization',
        icon: Handshake,
        roles: ['partner'],
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
        roles: ['admin', 'regional_manager', 'staff', 'developer'],
      },
      {
        href: '/goals',
        label: 'Goals',
        icon: Target,
        roles: ['admin', 'regional_manager', 'staff', 'board_member', 'developer'],
      },
      {
        href: '/interventions',
        label: 'Interventions',
        icon: AlertTriangle,
        roles: ['admin', 'regional_manager', 'staff', 'board_member', 'developer'],
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
        roles: ['admin', 'regional_manager', 'teacher', 'coach', 'consultant', 'developer'],
      },
      {
        href: '/coaching',
        label: 'Coaching',
        icon: Users,
        roles: ['admin', 'regional_manager', 'coach', 'consultant', 'teacher', 'developer'],
      },
      {
        href: '/pd',
        label: 'PD Catalog',
        icon: BookOpen,
        roles: [
          'admin',
          'regional_manager',
          'staff',
          'teacher',
          'coach',
          'consultant',
          'developer',
          'partner',
        ],
      },
      {
        href: '/certifications',
        label: 'Certifications',
        icon: Award,
        roles: [
          'admin',
          'regional_manager',
          'teacher',
          'coach',
          'consultant',
          'staff',
          'developer',
        ],
      },
    ],
  },
  {
    title: 'Partners',
    items: [
      {
        href: '/partners',
        label: 'Partners',
        icon: Handshake,
        roles: [
          'admin',
          'regional_manager',
          'staff',
          'board_member',
          'developer',
          'partner',
        ],
      },
      {
        href: '/partners/employees',
        label: 'Employees',
        icon: Handshake,
        roles: ['admin', 'developer', 'partner'],
      },
      {
        href: '/partners/administrators',
        label: 'Administrators',
        icon: Handshake,
        roles: ['admin', 'developer', 'partner'],
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
        roles: [
          'admin',
          'regional_manager',
          'staff',
          'teacher',
          'coach',
          'consultant',
          'developer',
          'partner',
        ],
      },
      {
        href: '/messages',
        label: 'Messages',
        icon: MessageSquare,
        roles: [
          'admin',
          'regional_manager',
          'staff',
          'teacher',
          'coach',
          'consultant',
          'developer',
          'partner',
        ],
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
        roles: ['developer'],
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
        roles: [
          'admin',
          'regional_manager',
          'staff',
          'teacher',
          'coach',
          'consultant',
          'developer',
        ],
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
        roles: ['admin', 'regional_manager', 'developer'],
        badge: 'Soon',
        disabled: true,
      },
      {
        href: '#',
        label: 'Analytics',
        icon: BarChart3,
        roles: ['admin', 'regional_manager', 'developer'],
        badge: 'Soon',
        disabled: true,
      },
      {
        href: '#',
        label: 'Community',
        icon: Globe,
        roles: ['admin', 'developer'],
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

export function getNavForRole(role: UserRole): NavSection[] {
  return navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.roles.includes(role)),
    }))
    .filter((section) => section.items.length > 0)
}
