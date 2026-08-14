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
  Coins,
} from 'lucide-react'
import { MODULES, PURCHASE_MOTOR_MODULES, QUOTATION_MOTOR_MODULES } from '@/auth/module-keys'
import { EPREFIX, EROUTES } from '@/utils/enums'

export type NavSubItem = {
  title: string
  url: string
  /** Case 2: sub-item visible only when user has this module */
  module?: string
  /** Case 2 (any): sub-item visible when user has any of these modules */
  modules?: string[]
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
    module: MODULES.POLICY,
    items: [
      { title: 'All Policyholders', url: EROUTES.MEMBERS, module: MODULES.POLICY },
      { title: 'New Policyholder', url: EROUTES.MEMBERS_NEW, module: MODULES.POLICY },
    ],
  },
  {
    title: 'Premiums & Claims',
    url: EROUTES.SAVINGS,
    icon: Wallet,
    module: MODULES.ACCOUNT,
    items: [
      { title: 'Accounts', url: EROUTES.SAVINGS, module: MODULES.ACCOUNT },
      { title: 'Insurance Products', url: EROUTES.SAVINGS_PRODUCTS, module: MODULES.ACCOUNT },
    ],
  },
  {
    title: 'Policies',
    url: EROUTES.LOANS,
    icon: ShieldCheck,
    modules: [...PURCHASE_MOTOR_MODULES],
    items: [
      { title: 'All Policies', url: EROUTES.LOANS, modules: [...PURCHASE_MOTOR_MODULES] },
      { title: 'New Application', url: EROUTES.LOANS_APPLY, modules: [...PURCHASE_MOTOR_MODULES] },
      { title: 'Policy Products', url: EROUTES.LOANS_PRODUCTS, modules: [...PURCHASE_MOTOR_MODULES] },
    ],
  },
  {
    title: 'Payments',
    url: EROUTES.TRANSACTIONS,
    icon: ArrowLeftRight,
    module: MODULES.ACCOUNT,
  },
  {
    title: 'Insights',
    url: EROUTES.REPORTS,
    icon: BarChart3,
    module: MODULES.RBAC,
  },
  {
    title: 'Quotations',
    url: EROUTES.QUOTATIONS,
    icon: TextQuote,
    modules: [
      ...QUOTATION_MOTOR_MODULES,
      MODULES.QUOTATION_MARINE,
      MODULES.QUOTATION_TRAVEL,
    ],
    items: [
      {
        title: 'Motor Quotation',
        url: EROUTES.MOTORQUOTATIONS,
        modules: [...QUOTATION_MOTOR_MODULES],
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
    module: MODULES.ROLE,
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
    title: 'Credit & Finance',
    url: EROUTES.CREDIT_WALLET,
    icon: Coins,
    module: MODULES.FINANCE_CONTROL,
    items: [
      { title: 'My Wallet', url: EROUTES.CREDIT_WALLET, module: MODULES.FINANCE_CONTROL },
      { title: 'Transactions', url: EROUTES.CREDIT_TRANSACTIONS, module: MODULES.FINANCE_CONTROL },
      { title: 'Credit Approval Pending', url: EROUTES.CREDIT_PENDING, module: MODULES.FINANCE_CONTROL },
      { title: 'Pending Approvals', url: EROUTES.CREDIT_APPROVALS, module: MODULES.FINANCE_CONTROL },
      { title: 'Pool Settings', url: EROUTES.CREDIT_SETUP_POOL, module: MODULES.FINANCE_CONTROL },
      { title: 'User Allocations', url: EROUTES.CREDIT_SETUP_USERS, module: MODULES.FINANCE_CONTROL },
      { title: 'Adjustments', url: EROUTES.CREDIT_ADJUSTMENTS, module: MODULES.FINANCE_CONTROL },
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
    title: 'Organization Members',
    url: EROUTES.ORGANIZATION_MEMBERS,
    icon: Users,
    module: MODULES.ORGANIZATION_LOCATION_USER,
  },
  {
    title: 'Organization Roles',
    url: EROUTES.ORGANIZATION_ROLES,
    icon: ShieldCheck,
    module: MODULES.ROLE,
  },
  {
    title: 'System Roles',
    url: EROUTES.GLOBAL_ROLES,
    icon: ShieldCheck,
    modules: [MODULES.RBAC],
    items: [
      { title: 'General', url: EROUTES.GLOBAL_ROLES, module: MODULES.RBAC },
      { title: 'System', url: EROUTES.SYSTEM_ROLES, module: MODULES.RBAC },
    ],
  },
  {
    title: 'Settings',
    url: EROUTES.SETTINGS,
    icon: Settings,
    modules: [MODULES.SETTINGS_RBAC, MODULES.RBAC],
  },
]
