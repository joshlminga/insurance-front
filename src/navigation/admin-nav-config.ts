import type { LucideIcon } from 'lucide-react'
import {
  Settings,
  LayoutDashboard,
  Users,
  Wallet,
  ArrowLeftRight,
  BarChart3,
  UserCog,
  ShieldCheck,
  TextQuote,
} from 'lucide-react'
import { MODULES } from '@/auth/module-keys'
import { EPREFIX, EROUTES } from '@/utils/enums'

export type NavSubItem = {
  title: string
  url: string
  /** Case 2: sub-item visible only when user has this module */
  module?: string
}

export type NavItem = {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  /** Case 1 (single): parent visible when user has this module */
  module?: string
  /** Case 1 (any): parent visible when user has any of these modules */
  modules?: string[]
  items?: NavSubItem[]
}

/** Full admin sidebar config — module keys match API rbac-modules catalog */
export const adminNavConfig: NavItem[] = [
  {
    title: 'Dashboard',
    url: EROUTES.DASHBOARD,
    icon: LayoutDashboard,
    isActive: true,
  },
  {
    title: 'Policyholders',
    url: EROUTES.MEMBERS,
    icon: Users,
    items: [
      { title: 'All Policyholders', url: EROUTES.MEMBERS },
      { title: 'New Policyholder', url: EROUTES.MEMBERS_NEW },
    ],
  },
  {
    title: 'Premiums & Claims',
    url: EROUTES.SAVINGS,
    icon: Wallet,
    items: [
      { title: 'Accounts', url: EROUTES.SAVINGS },
      { title: 'Insurance Products', url: EROUTES.SAVINGS_PRODUCTS },
    ],
  },
  {
    title: 'Policies',
    url: EROUTES.LOANS,
    icon: ShieldCheck,
    items: [
      { title: 'All Policies', url: EROUTES.LOANS },
      { title: 'New Application', url: EROUTES.LOANS_APPLY },
      { title: 'Policy Products', url: EROUTES.LOANS_PRODUCTS },
    ],
  },
  {
    title: 'Payments',
    url: EROUTES.TRANSACTIONS,
    icon: ArrowLeftRight,
  },
  {
    title: 'Insights',
    url: EROUTES.REPORTS,
    icon: BarChart3,
  },
  {
    title: 'Quotations',
    url: EROUTES.QUOTATIONS,
    icon: TextQuote,
    modules: [
      MODULES.QUOTATION_MOTOR,
      MODULES.QUOTATION_MARINE,
      MODULES.QUOTATION_TRAVEL,
    ],
    items: [
      {
        title: 'Motor Quotation',
        url: EROUTES.MOTORQUOTATIONS,
        module: MODULES.QUOTATION_MOTOR,
      },
      {
        title: 'Marine Quotation',
        url: '',
        module: MODULES.QUOTATION_MARINE,
      },
      {
        title: 'Travel Quotation',
        url: '',
        module: MODULES.QUOTATION_TRAVEL,
      },
    ],
  },
  {
    title: 'Agents',
    url: EROUTES.STAFF,
    icon: UserCog,
  },
  {
    title: 'Motor',
    url: `${EROUTES.DASHBOARD}/${EPREFIX.PRODUCTS}`,
    icon: LayoutDashboard,
    module: MODULES.PRODUCT_MOTOR,
    items: [
      {
        title: 'Motor Products',
        url: `${EROUTES.DASHBOARD}/${EPREFIX.PRODUCTS}/motor`,
        module: MODULES.PRODUCT_MOTOR,
      },
      {
        title: 'Cover Types',
        url: `/${EPREFIX.DASHBOARD}/${EPREFIX.PRODUCTS}/motor/cover-types`,
        module: MODULES.PRODUCT_MOTOR,
      },
      {
        title: 'Motor Covering',
        url: `/${EPREFIX.DASHBOARD}/${EPREFIX.PRODUCTS}/motor/covering`,
        module: MODULES.PRODUCT_MOTOR,
      },
      {
        title: 'Vehicle Classes',
        url: `/${EPREFIX.DASHBOARD}/${EPREFIX.PRODUCTS}/motor/vehicle-classes`,
        module: MODULES.PRODUCT_MOTOR,
      },
      {
        title: 'Vehicle Use',
        url: `/${EPREFIX.DASHBOARD}/${EPREFIX.PRODUCTS}/motor/vehicle-use`,
        module: MODULES.PRODUCT_MOTOR,
      },
      {
        title: 'Addon Benefits',
        url: `/${EPREFIX.DASHBOARD}/${EPREFIX.PRODUCTS}/motor/add-on-benefits`,
        module: MODULES.PRODUCT_MOTOR,
      },
      {
        title: 'Detailed Benefits',
        url: `/${EPREFIX.DASHBOARD}/${EPREFIX.PRODUCTS}/motor/detailed-benefits`,
        module: MODULES.PRODUCT_MOTOR,
      },
      {
        title: 'Motor Tonage',
        url: `/${EPREFIX.DASHBOARD}/${EPREFIX.PRODUCTS}/motor/tonage`,
        module: MODULES.PRODUCT_MOTOR,
      },
    ],
  },
  {
    title: 'Organization',
    url: EROUTES.ORGANIZATION,
    icon: UserCog,
    modules: [MODULES.ORGANIZATION, MODULES.ORGANIZATION_LOCATION],
    items: [
      {
        title: 'Manage',
        url: EROUTES.ORGANIZATION,
        module: MODULES.ORGANIZATION,
      },
      {
        title: 'Location',
        url: EROUTES.ORGANIZATION_LOCATION,
        module: MODULES.ORGANIZATION_LOCATION,
      },
    ],
  },
  {
    title: 'Users',
    url: EROUTES.USERS,
    icon: Users,
    module: MODULES.USER,
  },
  {
    title: 'Settings',
    url: EROUTES.SETTINGS,
    icon: Settings,
  },
]
