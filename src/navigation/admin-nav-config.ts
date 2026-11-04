import type { LucideIcon } from 'lucide-react'
import {
  Settings,
  LayoutDashboard,
  Users,
  UserCog,
  ShieldCheck,
  TextQuote,
  Coins,
  Banknote,
  FileBadge2,
  FolderCog,
  Plane,
  ShieldAlert,
  BarChart3,
} from 'lucide-react'
import { MODULES, QUOTATION_MOTOR_MODULES } from '@/auth/module-keys'
import { EPREFIX, EROUTES } from '@/utils/enums'

export type NavSubItem = {
  title: string
  /** Leaf links require a url; group nodes may omit it and use the first child url */
  url?: string
  /**
   * Extra path prefixes that keep this item active/open
   * (e.g. travel-rates / travel-benefits outside /travel/).
   */
  matchPrefixes?: string[]
  /** Case 2: sub-item visible only when user has this module */
  module?: string
  /** Case 2 (any): sub-item visible when user has any of these modules */
  modules?: string[]
  /** Extra permission (e.g. finance-control.mine) - hidden when user lacks it */
  permission?: string
  /**
   * Org location product line required for this item (Motor, Travel, Marine).
   * Prefer this over inferring from modules when modules mix lines or are missing.
   */
  productLine?: string
  /**
   * Only the platform super_admin role may see this item.
   * is_general does not count — that flag bypasses can()/hasModule() elsewhere.
   */
  requireSuperAdmin?: boolean
  /** Nested sub-menu items (level 3+) */
  items?: NavSubItem[]
}

export type NavItem = {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  /**
   * Extra path prefixes that keep this item active/open
   * (e.g. travel-rates / travel-benefits outside /travel/).
   */
  matchPrefixes?: string[]
  /** Case 1 (single): parent visible when user has this module */
  module?: string
  /** Case 1 (any): parent visible when user has any of these modules */
  modules?: string[]
  /** Extra permission - hidden when user lacks it */
  permission?: string
  /**
   * Org location product line required for this item (Motor, Travel, Marine).
   * Prefer this over inferring from modules when modules mix lines or are missing.
   */
  productLine?: string
  /**
   * Only the platform super_admin role may see this item.
   * is_general does not count — that flag bypasses can()/hasModule() elsewhere.
   */
  requireSuperAdmin?: boolean
  items?: NavSubItem[]
}

/** Full admin sidebar config - module keys match API rbac-modules catalog */
export const adminNavConfig: NavItem[] = [
  {
    title: 'Dashboard',
    url: EROUTES.DASHBOARD,
    icon: LayoutDashboard,
    isActive: true,
  },
  // {
  //   title: 'Policyholders',
  //   url: EROUTES.MEMBERS,
  //   icon: Users,
  //   module: MODULES.POLICY,
  //   items: [
  //     { title: 'All Policyholders', url: EROUTES.MEMBERS, module: MODULES.POLICY },
  //     { title: 'New Policyholder', url: EROUTES.MEMBERS_NEW, module: MODULES.POLICY },
  //   ],
  // },
  // {
  //   title: 'Premiums & Claims',
  //   url: EROUTES.SAVINGS,
  //   icon: Wallet,
  //   module: MODULES.ACCOUNT,
  //   items: [
  //     { title: 'Accounts', url: EROUTES.SAVINGS, module: MODULES.ACCOUNT },
  //     { title: 'Insurance Products', url: EROUTES.SAVINGS_PRODUCTS, module: MODULES.ACCOUNT },
  //   ],
  // },
  // {
  //   title: 'Policies',
  //   url: EROUTES.LOANS,
  //   icon: ShieldCheck,
  //   modules: [...PURCHASE_MOTOR_MODULES],
  //   items: [
  //     { title: 'All Policies', url: EROUTES.LOANS, modules: [...PURCHASE_MOTOR_MODULES] },
  //     { title: 'New Application', url: EROUTES.LOANS_APPLY, modules: [...PURCHASE_MOTOR_MODULES] },
  //     { title: 'Policy Products', url: EROUTES.LOANS_PRODUCTS, modules: [...PURCHASE_MOTOR_MODULES] },
  //   ],
  // },
  // {
  //   title: 'Payments',
  //   url: EROUTES.TRANSACTIONS,
  //   icon: ArrowLeftRight,
  //   module: MODULES.ACCOUNT,
  // },
  {
    title: 'Quotations',
    url: EROUTES.MOTORQUOTATIONS,
    icon: TextQuote,
    modules: [
      ...QUOTATION_MOTOR_MODULES,
      MODULES.QUOTATION_TRAVEL,
      MODULES.REPORT_MOTOR_QUOTATION,
    ],
    items: [
      {
        title: 'Motor',
        url: EROUTES.MOTORQUOTATIONS,
        modules: [...QUOTATION_MOTOR_MODULES, MODULES.REPORT_MOTOR_QUOTATION],
        items: [
          {
            title: 'New',
            url: EROUTES.MOTORQUOTATIONS,
            module: MODULES.QUOTATION_MOTOR,
            permission: 'quotation-motor.advance',
          },
          {
            title: 'Double',
            url: EROUTES.MOTOR_QUOTATION_DOUBLE,
            module: MODULES.QUOTATION_MOTOR_ALTERNATIVE,
            permission: 'quotation-motor-alternative.advance',
          },
          {
            title: 'Find',
            url: EROUTES.MOTOR_QUOTATION_FETCH,
            module: MODULES.QUOTATION_MOTOR,
            permission: 'quotation-motor.read',
          },
          {
            title: 'Listed',
            url: EROUTES.REPORT_QUOTATIONS_MOTOR,
            module: MODULES.REPORT_MOTOR_QUOTATION,
            permission: 'report-motor-quotation.menu',
          },
          {
            title: 'Reminders',
            url: EROUTES.MOTOR_QUOTATION_REMINDERS,
            module: MODULES.QUOTATION_MOTOR,
            permission: 'quotation-motor.read',
          },
        ],
      },
      {
        title: 'Travel',
        url: EROUTES.TRAVELQUOTATIONS,
        modules: [MODULES.QUOTATION_TRAVEL, MODULES.REPORT_MOTOR_QUOTATION],
        // Mixed modules would skip product inference — keep Travel line explicit.
        productLine: 'Travel',
        items: [
          {
            title: 'New',
            url: EROUTES.TRAVELQUOTATIONS,
            module: MODULES.QUOTATION_TRAVEL,
          },
          {
            title: 'Find',
            url: EROUTES.TRAVEL_QUOTATION_FETCH,
            module: MODULES.QUOTATION_TRAVEL,
          },
          {
            title: 'Listed',
            url: EROUTES.REPORT_QUOTATIONS_TRAVEL,
            modules: [MODULES.QUOTATION_TRAVEL, MODULES.REPORT_MOTOR_QUOTATION],
            productLine: 'Travel',
          },
        ],
      },
    ],
  },
  {
    title: 'Certificates',
    url: EROUTES.MOTOR_CERTIFICATES,
    icon: FileBadge2,
    module: MODULES.DMVIC_CERTIFICATE,
    permission: 'dmvic-certificate.menu',
    items: [
      {
        title: 'Motor',
        url: EROUTES.MOTOR_CERTIFICATES,
        module: MODULES.DMVIC_CERTIFICATE,
        permission: 'dmvic-certificate.menu',
      },
    ],
  },
  {
    title: 'Motor',
    // Use /products/motor — NOT /products — so Travel routes do not open Motor.
    url: EROUTES.PRODUCTS,
    icon: LayoutDashboard,
    modules: [
      MODULES.PRODUCT_MOTOR,
      MODULES.MOTOR_COVER_TYPE,
      MODULES.MOTOR_COVER_COVERING,
      MODULES.MOTOR_VEHICLE_CLASS,
      MODULES.MOTOR_VEHICLE_USE,
      MODULES.MOTOR_ADDON_BENEFIT,
      MODULES.MOTOR_DETAIL_BENEFIT,
    ],
    matchPrefixes: [
      `/${EPREFIX.DASHBOARD}/${EPREFIX.PRODUCTS}/motor-rates`,
      `/${EPREFIX.DASHBOARD}/${EPREFIX.PRODUCTS}/motor-rate-benefits`,
    ],
    items: [
      {
        title: 'Motor Products',
        url: EROUTES.PRODUCTS,
        module: MODULES.PRODUCT_MOTOR,
        permission: 'product-motor.menu',
      },
      {
        title: 'Cover Types',
        url: `/${EPREFIX.DASHBOARD}/${EPREFIX.PRODUCTS}/motor/cover-types`,
        module: MODULES.MOTOR_COVER_TYPE,
        permission: 'motor-cover-type.menu',
      },
      {
        title: 'Motor Covering',
        url: `/${EPREFIX.DASHBOARD}/${EPREFIX.PRODUCTS}/motor/covering`,
        module: MODULES.MOTOR_COVER_COVERING,
        permission: 'motor-cover-covering.menu',
      },
      {
        title: 'Vehicle Classes',
        url: `/${EPREFIX.DASHBOARD}/${EPREFIX.PRODUCTS}/motor/vehicle-classes`,
        module: MODULES.MOTOR_VEHICLE_CLASS,
        permission: 'motor-vehicle-class.menu',
      },
      {
        title: 'Vehicle Use',
        url: `/${EPREFIX.DASHBOARD}/${EPREFIX.PRODUCTS}/motor/vehicle-use`,
        module: MODULES.MOTOR_VEHICLE_USE,
        permission: 'motor-vehicle-use.menu',
      },
      {
        title: 'Addon Benefits',
        url: `/${EPREFIX.DASHBOARD}/${EPREFIX.PRODUCTS}/motor/add-on-benefits`,
        module: MODULES.MOTOR_ADDON_BENEFIT,
        permission: 'motor-addon-benefit.menu',
      },
      {
        title: 'Detailed Benefits',
        url: `/${EPREFIX.DASHBOARD}/${EPREFIX.PRODUCTS}/motor/detailed-benefits`,
        module: MODULES.MOTOR_DETAIL_BENEFIT,
        permission: 'motor-detail-benefit.menu',
      },
    ],
  },
  {
    title: 'Travel',
    url: EROUTES.TRAVEL_PRODUCTS,
    icon: Plane,
    // No module keys on this catalog — gate by org location product line.
    productLine: 'Travel',
    // Rates/benefits live at travel-rates / travel-benefits (not under /travel/).
    matchPrefixes: [
      `/${EPREFIX.DASHBOARD}/${EPREFIX.PRODUCTS}/travel-rates`,
      `/${EPREFIX.DASHBOARD}/${EPREFIX.PRODUCTS}/travel-benefits`,
    ],
    items: [
      {
        title: 'Products',
        url: EROUTES.TRAVEL_PRODUCTS,
      },
      {
        title: 'Coverage',
        url: EROUTES.TRAVEL_COVERAGE,
      },
      {
        title: 'Section',
        url: EROUTES.TRAVEL_BENEFIT_SECTION,
      },
      {
        title: 'Common',
        url: EROUTES.TRAVEL_BENEFIT_COMMON,
      },
      {
        title: 'Reason',
        url: EROUTES.TRAVEL_REASON,
      },
    ],
  },
  {
    title: 'Reports',
    url: EROUTES.REPORT_CUSTOMERS,
    icon: BarChart3,
    modules: [
      MODULES.REPORT_CUSTOMER,
      MODULES.REPORT_ORG_MOTOR_VEHICLE,
      MODULES.REPORT_ORG_MOTOR_QUOTATION,
      MODULES.REPORT_ORG_MOTOR_CERTIFICATE,
      MODULES.REPORT_ORG_TRAVEL_QUOTATION,
    ],
    items: [
      {
        title: 'Customers',
        url: EROUTES.REPORT_CUSTOMERS,
        module: MODULES.REPORT_CUSTOMER,
        permission: 'report-customer.menu',
      },
      {
        title: 'Motor',
        url: EROUTES.REPORT_ORG_MOTOR_VEHICLES,
        modules: [
          MODULES.REPORT_ORG_MOTOR_VEHICLE,
          MODULES.REPORT_ORG_MOTOR_QUOTATION,
          MODULES.REPORT_ORG_MOTOR_CERTIFICATE,
        ],
        items: [
          {
            title: 'Vehicles',
            url: EROUTES.REPORT_ORG_MOTOR_VEHICLES,
            module: MODULES.REPORT_ORG_MOTOR_VEHICLE,
            permission: 'report-org-motor-vehicle.menu',
          },
          {
            title: 'Quotations',
            url: EROUTES.REPORT_ORG_MOTOR_QUOTATIONS,
            module: MODULES.REPORT_ORG_MOTOR_QUOTATION,
            permission: 'report-org-motor-quotation.menu',
          },
          {
            title: 'Policies / Certificates',
            url: EROUTES.REPORT_ORG_MOTOR_CERTIFICATES,
            module: MODULES.REPORT_ORG_MOTOR_CERTIFICATE,
            permission: 'report-org-motor-certificate.menu',
          },
        ],
      },
      {
        title: 'Travel',
        url: EROUTES.REPORT_ORG_TRAVEL_QUOTATIONS,
        module: MODULES.REPORT_ORG_TRAVEL_QUOTATION,
        items: [
          {
            title: 'Quotations',
            url: EROUTES.REPORT_ORG_TRAVEL_QUOTATIONS,
            module: MODULES.REPORT_ORG_TRAVEL_QUOTATION,
            permission: 'report-org-travel-quotation.menu',
          },
        ],
      },
    ],
  },
  {
    title: 'Finance',
    url: EROUTES.FINANCE_PARAMETERS,
    icon: Banknote,
    modules: [
      MODULES.FINANCE_PARAMETER,
      MODULES.INVOICE,
      MODULES.REPORT_MOTOR_INVOICE,
      MODULES.REPORT_MOTOR_RECEIPT,
    ],
    items: [
      {
        title: 'Parameters',
        url: EROUTES.FINANCE_PARAMETERS,
        module: MODULES.FINANCE_PARAMETER,
        permission: 'finance-parameter.menu',
      },
      {
        title: 'Invoices',
        url: EROUTES.FINANCE_INVOICES,
        modules: [MODULES.INVOICE, MODULES.REPORT_MOTOR_INVOICE],
        permission: 'invoice.menu',
      },
      {
        title: 'Receipts',
        url: EROUTES.FINANCE_RECEIPTS,
        module: MODULES.REPORT_MOTOR_RECEIPT,
        permission: 'report-motor-receipt.menu',
      },
      {
        title: 'Transactions',
        url: EROUTES.FINANCE_TRANSACTIONS,
        module: MODULES.INVOICE,
        permission: 'invoice.transactions',
      },
      {
        title: 'Payments',
        url: EROUTES.PAYMENTS,
        module: MODULES.INVOICE,
        permission: 'invoice.payments',
      },
    ],
  },
  {
    title: 'Claims',
    url: EROUTES.CLAIMS,
    icon: ShieldAlert,
    module: MODULES.CLAIMS,
    permission: 'claims.menu',
    items: [
      {
        title: 'Motor',
        url: EROUTES.CLAIMS,
        module: MODULES.CLAIMS,
        permission: 'claims.list',
      },
      {
        title: 'Settings',
        url: EROUTES.CLAIMS_SETTINGS,
        module: MODULES.CLAIMS,
        permission: 'claims.settings',
      },
    ],
  },
  {
    title: 'Organization Setup',
    url: EROUTES.ORGANIZATION,
    icon: UserCog,
    modules: [MODULES.ORGANIZATION, MODULES.ORGANIZATION_LOCATION],
    requireSuperAdmin: true,
    items: [
      {
        title: 'Manage',
        url: EROUTES.ORGANIZATION,
        module: MODULES.ORGANIZATION,
        requireSuperAdmin: true,
      },
      {
        title: 'Location',
        url: EROUTES.ORGANIZATION_LOCATION,
        module: MODULES.ORGANIZATION_LOCATION,
        requireSuperAdmin: true,
      },
    ],
  },
  {
    title: 'Organization Members',
    url: EROUTES.ORGANIZATION_MEMBERS,
    icon: Users,
    module: MODULES.ORGANIZATION_LOCATION_USER,
    permission: 'organization-location-user.menu',
  },
  {
    title: 'Organization Credit',
    url: EROUTES.CREDIT_WALLET,
    icon: Coins,
    module: MODULES.FINANCE_CONTROL,
    permission: 'finance-control.menu',
    items: [
      {
        title: 'My Wallet',
        url: EROUTES.CREDIT_WALLET,
        module: MODULES.FINANCE_CONTROL,
        permission: 'finance-control.mine',
      },
      {
        title: 'Transactions',
        url: EROUTES.CREDIT_TRANSACTIONS,
        module: MODULES.FINANCE_CONTROL,
        permission: 'finance-control.transactions',
      },
      {
        title: 'Recharge Credit',
        url: EROUTES.CREDIT_TRANSACTIONS,
        module: MODULES.FINANCE_CONTROL,
        permission: 'finance-control.action',
      },
      {
        title: 'Credit Approval Pending',
        url: EROUTES.CREDIT_PENDING,
        module: MODULES.FINANCE_CONTROL,
        permission: 'finance-control.mine',
      },
      {
        title: 'Pending Approvals',
        url: EROUTES.CREDIT_APPROVALS,
        module: MODULES.FINANCE_CONTROL,
        permission: 'finance-control.approve',
      },
      {
        title: 'Pool Settings',
        url: EROUTES.CREDIT_SETUP_POOL,
        module: MODULES.FINANCE_CONTROL,
        permission: 'finance-control.update',
      },
      {
        title: 'User Allocations',
        url: EROUTES.CREDIT_SETUP_USERS,
        module: MODULES.FINANCE_CONTROL,
        permission: 'finance-control.list',
      },
      {
        title: 'Adjustments',
        url: EROUTES.CREDIT_ADJUSTMENTS,
        module: MODULES.FINANCE_CONTROL,
        permission: 'finance-control.adjust',
      },
    ],
  },
  {
    title: 'Organization Roles',
    url: EROUTES.ORGANIZATION_ROLES,
    icon: ShieldCheck,
    module: MODULES.ROLE,
    permission: 'role.menu',
  },
  {
    title: 'System Roles',
    url: EROUTES.GLOBAL_ROLES,
    icon: ShieldCheck,
    modules: [MODULES.RBAC],
    requireSuperAdmin: true,
    items: [
      { title: 'General', url: EROUTES.GLOBAL_ROLES, module: MODULES.RBAC, requireSuperAdmin: true },
      { title: 'System', url: EROUTES.SYSTEM_ROLES, module: MODULES.RBAC, requireSuperAdmin: true },
    ],
  },
  {
    title: 'DMVIC Stock',
    url: EROUTES.DMVIC_STOCK,
    icon: FolderCog,
    module: MODULES.DMVIC_STOCK,
    permission: 'dmvic-stock.menu',
    items: [
      {
        title: 'Stock list',
        url: EROUTES.DMVIC_STOCK,
        module: MODULES.DMVIC_STOCK,
        permission: 'dmvic-stock.list',
      },
      {
        title: 'Policies',
        url: EROUTES.DMVIC_STOCK_POLICY_NUMBERS,
        module: MODULES.DMVIC_STOCK,
        permission: 'dmvic-stock.policies',
      },
      {
        title: 'Settings',
        url: EROUTES.DMVIC_STOCK_SETTINGS,
        module: MODULES.DMVIC_STOCK,
        permission: 'dmvic-stock.settings',
      },
    ],
  },
  {
    title: 'Currencies',
    url: EROUTES.CURRENCIES_AVAILABLE,
    icon: Coins,
    // Entire ATU Currencies group is platform super_admin only.
    requireSuperAdmin: true,
    modules: [
      MODULES.ATU_MULTICURRENCY_CURRENCY,
      MODULES.ATU_MULTICURRENCY_LOG,
      MODULES.ATU_MULTICURRENCY_SETTINGS,
    ],
    items: [
      {
        title: 'Available',
        url: EROUTES.CURRENCIES_AVAILABLE,
        module: MODULES.ATU_MULTICURRENCY_CURRENCY,
        requireSuperAdmin: true,
      },
      {
        title: 'Activity Logs',
        url: EROUTES.CURRENCIES_ACTIVITY_LOGS,
        module: MODULES.ATU_MULTICURRENCY_LOG,
        requireSuperAdmin: true,
      },
      {
        title: 'Configuration',
        url: EROUTES.CURRENCIES_CONFIGURATION,
        module: MODULES.ATU_MULTICURRENCY_SETTINGS,
        requireSuperAdmin: true,
      },
    ],
  },
  {
    title: 'Settings',
    url: EROUTES.SETTINGS,
    icon: Settings,
    // settings-rbac only. rbac.menu must not open Settings.
    modules: [MODULES.SETTINGS_RBAC],
    requireSuperAdmin: true,
  },
  {
    title: 'Users',
    url: EROUTES.USERS,
    icon: Users,
    module: MODULES.USER,
    requireSuperAdmin: true,
  },
]
