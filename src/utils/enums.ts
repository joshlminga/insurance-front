import { ClaimItem } from "@/types/types";

export const ELOGO = {
  NAVBARLOGO: '/logo/logo1.png'
}

export const EPREFIX = {
  AUTH: "auth",
  ADMIN: "admin",
  AGENT: "agent",
  CUSTOMER: "customer",
  DASHBOARD: "dashboard",
  PRODUCTS: "products",
  QUOTATIONS: "quotations",
  FINANCE: "finance",

  ERRORS: 'errors'
} as const

export const EROUTES = {
  // Public
  LANDING: '/',
  CONTACT_US: '/contact-us',
  PRODUCT_LIST: '/products',

  // Customer
  MOTOR: '/motor',
  TRAVEL: '/travel',
  MARINE: '/marine',
  PESAPAL_RETURN: '/customer/payment/pesapal/return',
  PAYSTACK_RETURN: '/customer/payment/paystack/return',
  PAYMENT_MPESA_RETURN: '/payment/mpesa/return',
  PAYMENT_MPESA_SUCCESS: '/payment/mpesa/success',
  PAYMENT_MPESA_FAILED: '/payment/mpesa/failed',
  PAYMENT_CREDIT_RETURN: '/payment/credit/return',
  PAYMENT_CREDIT_SUCCESS: '/payment/credit/success',
  PAYMENT_CREDIT_PENDING: '/payment/credit/pending',
  PAYMENT_CREDIT_FAILED: '/payment/credit/failed',
  PAYMENT_PAYSTACK_RETURN: '/payment/paystack/return',
  PAYMENT_PAYSTACK_SUCCESS: '/payment/paystack/success',
  PAYMENT_PAYSTACK_FAILED: '/payment/paystack/failed',
  LIFE: '/life',
  PROFILE: '/profile',
  ACCOUNTSETTINGS: '/profile/account-settings',
  CLAIMS: '/profile/my-claims',
  COVERS: '/profile/my-covers',
  PAYMENTHISTORY: '/profile/payment-history',
  SINGLECOVER: '/profile/my-covers',

  // Auth
  SIGNUP: '/signup',
  SIGNIN: '/signin',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',

  // dashbaord
  DASHBOARD: `/${EPREFIX.DASHBOARD}`,
  // Members
  MEMBERS: `/${EPREFIX.DASHBOARD}/members`,
  MEMBERS_NEW: `/${EPREFIX.DASHBOARD}/members/new`,
  MEMBERS_DETAIL: `/${EPREFIX.DASHBOARD}/members/:id`,

  // Savings
  SAVINGS: `/${EPREFIX.DASHBOARD}/savings`,
  SAVINGS_PRODUCTS: `/${EPREFIX.DASHBOARD}/savings/products`,
  SAVINGS_DETAIL: `/${EPREFIX.DASHBOARD}/savings/:id`,

  // Loans
  LOANS: `/${EPREFIX.DASHBOARD}/loans`,
  LOANS_APPLY: `/${EPREFIX.DASHBOARD}/loans/apply`,
  LOANS_PRODUCTS: `/${EPREFIX.DASHBOARD}/loans/products`,
  LOANS_DETAIL: `/${EPREFIX.DASHBOARD}/loans/:id`,

  // Transactions
  TRANSACTIONS: `/${EPREFIX.DASHBOARD}/transactions`,

  // Credit & Finance
  CREDIT_WALLET: `/${EPREFIX.DASHBOARD}/credit/wallet`,
  CREDIT_TRANSACTIONS: `/${EPREFIX.DASHBOARD}/credit/transactions`,
  CREDIT_APPROVALS: `/${EPREFIX.DASHBOARD}/credit/approvals`,
  CREDIT_PENDING: `/${EPREFIX.DASHBOARD}/credit/pending`,
  CREDIT_PENDING_DETAIL: `/${EPREFIX.DASHBOARD}/credit/pending/:invoiceId`,
  CREDIT_SETUP: `/${EPREFIX.DASHBOARD}/credit/setup`,
  CREDIT_SETUP_POOL: `/${EPREFIX.DASHBOARD}/credit/setup/pool`,
  CREDIT_SETUP_USERS: `/${EPREFIX.DASHBOARD}/credit/setup/users`,
  CREDIT_SETTLEMENT: `/${EPREFIX.DASHBOARD}/credit/settlements/:id`,
  CREDIT_ADJUSTMENTS: `/${EPREFIX.DASHBOARD}/credit/adjustments`,

  // Motor certificates
  MOTOR_CERTIFICATES: `/${EPREFIX.DASHBOARD}/motor-certificates`,

  // Reports
  REPORTS: `/${EPREFIX.DASHBOARD}/reports`,

  // Staff
  STAFF: `/${EPREFIX.DASHBOARD}/staff`,
  STAFF_DETAIL: `/${EPREFIX.DASHBOARD}/staff/:id`,

  // Settings
  SETTINGS: `/${EPREFIX.DASHBOARD}/settings`,
  /** Logged-in user's own profile (name, email, password, avatar) */
  ACCOUNT_PROFILE: `/${EPREFIX.DASHBOARD}/account-profile`,

  // Quotations
  QUOTATIONS: `/${EPREFIX.DASHBOARD}/${EPREFIX.QUOTATIONS}`,
  MOTORQUOTATIONS: `/${EPREFIX.DASHBOARD}/${EPREFIX.QUOTATIONS}/motor-quotations`,
  MOTOR_QUOTATION_FETCH: `/${EPREFIX.DASHBOARD}/${EPREFIX.QUOTATIONS}/motor-quotations/fetch`,
  MOTOR_QUOTATION_RESULTS: `/${EPREFIX.DASHBOARD}/${EPREFIX.QUOTATIONS}/motor-quotations/results`,
  MOTOR_QUOTATION_PURCHASE: `/${EPREFIX.DASHBOARD}/${EPREFIX.QUOTATIONS}/motor-quotations/purchase`,

  // Ops reports
  REPORT_QUOTATIONS_MOTOR: `/${EPREFIX.DASHBOARD}/reports/quotations/motor`,
  REPORT_QUOTATIONS_TRAVEL: `/${EPREFIX.DASHBOARD}/reports/quotations/travel`,
  REPORT_INVOICES_MOTOR: `/${EPREFIX.DASHBOARD}/reports/invoices/motor`,
  REPORT_RECEIPTS_MOTOR: `/${EPREFIX.DASHBOARD}/reports/receipts/motor`,
  // products
  // Motor
  PRODUCTS: `/${EPREFIX.DASHBOARD}/${EPREFIX.PRODUCTS}/motor`,
  PRODUCTSRATES: `/${EPREFIX.DASHBOARD}/${EPREFIX.PRODUCTS}/motor-rates/:slung`,
  COVERTYPES: `/${EPREFIX.DASHBOARD}/${EPREFIX.PRODUCTS}/motor/cover-types`,
  MOTORCOVERING: `/${EPREFIX.DASHBOARD}/${EPREFIX.PRODUCTS}/motor/covering`,
  VEHICLECLASSES: `/${EPREFIX.DASHBOARD}/${EPREFIX.PRODUCTS}/motor/vehicle-classes`,
  VEHICLEUSE: `/${EPREFIX.DASHBOARD}/${EPREFIX.PRODUCTS}/motor/vehicle-use`,
  MOTORADDONBENEFITS: `/${EPREFIX.DASHBOARD}/${EPREFIX.PRODUCTS}/motor/add-on-benefits`,
  MOTORDETAILEDBENEFIT: `/${EPREFIX.DASHBOARD}/${EPREFIX.PRODUCTS}/motor/detailed-benefit`,

  ORGANIZATION: `/${EPREFIX.DASHBOARD}/organization`,
  ORGANIZATION_LOCATION: `/${EPREFIX.DASHBOARD}/organization-location`,
  ORGANIZATION_ROLES: `/${EPREFIX.DASHBOARD}/organization-roles`,
  ORGANIZATION_ROLES_DETAIL: `/${EPREFIX.DASHBOARD}/organization-roles/:orgLocationId`,
  ORGANIZATION_MEMBERS: `/${EPREFIX.DASHBOARD}/organization-members`,
  ORGANIZATION_MEMBERS_DETAIL: `/${EPREFIX.DASHBOARD}/organization-members/:orgLocationId`,
  GLOBAL_ROLES: `/${EPREFIX.DASHBOARD}/global-roles`,
  SYSTEM_ROLES: `/${EPREFIX.DASHBOARD}/system-roles`,
  USERS: `/${EPREFIX.DASHBOARD}/users`,

  // finance
  FINANCE:`/${EPREFIX.DASHBOARD}/${EPREFIX.FINANCE}`,
  FINANCE_PARAMETERS: `/${EPREFIX.DASHBOARD}/${EPREFIX.FINANCE}/parameters`,
  FINANCE_CLAIMS: `/${EPREFIX.DASHBOARD}/${EPREFIX.FINANCE}/claims`,
  FINANCE_INVOICES: `/${EPREFIX.DASHBOARD}/${EPREFIX.FINANCE}/invoices`,
  PAYMENTS: `/${EPREFIX.DASHBOARD}/${EPREFIX.FINANCE}/payments`,

  ERROR404: `/${EPREFIX.ERRORS}/errors404`
} as const

export const SORT_ORDER = {
  Descending: 'DESC',
  Ascending: 'ASC',
} as const;

export type SORT_ORDER = typeof SORT_ORDER[keyof typeof SORT_ORDER];
export const PREMIUM_KEYS = new Set(["Basic Premium", "Gross Premium", "Levies"])

export const QUOTATIONCHECKBOX = [
  { id: 'excess', label: 'Excess Protector' },
  { id: 'pvt', label: 'Political Violence & Terrorism' },
  { id: 'pa', label: 'Personal Accident' },
]

export const PROFFESIONALVALUATIONCHECKBOX = [
  { 
    id: 'true', 
    name: 'Vehicle has been valued by a professional valuer in the last 18 months?' 
  },
]

export const EQUOTATIONSAMPLEDATA = [
  {
    id: 1,
    header: { type: 'image', src: '/britam.png' },
    content: [
      { label: 'Basic Premium', value: 'Kes. 1,200,000' },
      { label: 'Total Premium', value: 'Kes. 1,205,440' },
    ],
    footer: [
      {
        label: 'Get Quote',
        className: 'rounded-md border border-[#D9D9D9] bg-[#C20C0C] hover:bg-[#C20C0C]/90 font-medium text-white px-6',
      },
      {
        label: 'Purchase Cover',
        className: 'rounded-md border border-[#D9D9D9] bg-[#0CC258] hover:bg-[#0CC258]/90 font-medium text-white px-6',
      },
    ],
  },
  {
    id: 2,
    header: { type: 'image', src: '/cic.png' },
    content: [
      { label: 'Basic Premium', value: 'Kes. 900,000' },
      { label: 'Total Premium', value: 'Kes. 950,000' },
    ],
    footer: [
      {
        label: 'Get Quote',
        className: 'rounded-md border border-[#D9D9D9] bg-[#C20C0C] hover:bg-[#C20C0C]/90 font-medium text-white px-6',
      },
      {
        label: 'Purchase Cover',
        className: 'rounded-md border border-[#D9D9D9] bg-[#0CC258] hover:bg-[#0CC258]/90 font-medium text-white px-6',
      },
    ],
  },
  {
    id: 3,
    header: { type: 'image', src: '/sanlam.png' },
    content: [
      { label: 'Basic Premium', value: 'Kes. 1,550,000' },
      { label: 'Total Premium', value: 'Kes. 1,505,000' },
    ],
    footer: [
      {
        label: 'Get Quote',
        className: 'rounded-md border border-[#D9D9D9] bg-[#C20C0C] hover:bg-[#C20C0C]/90 font-medium text-white px-6',
      },
      {
        label: 'Purchase Cover',
        className: 'rounded-md border border-[#D9D9D9] bg-[#0CC258] hover:bg-[#0CC258]/90 font-medium text-white px-6',
      },
    ],
  },
  {
    id: 4,
    header: { type: 'image', src: '/madison.png' },
    content: [
      { label: 'Basic Premium', value: 'Kes. 1,500,000' },
      { label: 'Total Premium', value: 'Kes. 1,505,000' },
    ],
    footer: [
      {
        label: 'Get Quote',
        className: 'rounded-md border border-[#D9D9D9] bg-[#C20C0C] hover:bg-[#C20C0C]/90 font-medium text-white px-6',
      },
      {
        label: 'Purchase Cover',
        className: 'rounded-md border border-[#D9D9D9] bg-[#0CC258] hover:bg-[#0CC258]/90 font-medium text-white px-6',
      },
    ],
  },
  {
    id: 5,
    header: { type: 'image', src: '/britam.png' },
    content: [
      { label: 'Basic Premium', value: 'Kes. 1,200,000' },
      { label: 'Total Premium', value: 'Kes. 1,205,440' },
    ],
    footer: [
      {
        label: 'Get Quote',
        className: 'rounded-md border border-[#D9D9D9] bg-[#C20C0C] hover:bg-[#C20C0C]/90 font-medium text-white px-6',
      },
      {
        label: 'Purchase Cover',
        className: 'rounded-md border border-[#D9D9D9] bg-[#0CC258] hover:bg-[#0CC258]/90 font-medium text-white px-6',
      },
    ],
  },
  {
    id: 6,
    header: { type: 'image', src: '/cic.png' },
    content: [
      { label: 'Basic Premium', value: 'Kes. 900,000' },
      { label: 'Total Premium', value: 'Kes. 950,000' },
    ],
    footer: [
      {
        label: 'Get Quote',
        className: 'rounded-md border border-[#D9D9D9] bg-[#C20C0C] hover:bg-[#C20C0C]/90 font-medium text-white px-6',
      },
      {
        label: 'Purchase Cover',
        className: 'rounded-md border border-[#D9D9D9] bg-[#0CC258] hover:bg-[#0CC258]/90 font-medium text-white px-6',
      },
    ],
  },
  {
    id: 7,
    header: { type: 'image', src: '/sanlam.png' },
    content: [
      { label: 'Basic Premium', value: 'Kes. 1,550,000' },
      { label: 'Total Premium', value: 'Kes. 1,505,000' },
    ],
    footer: [
      {
        label: 'Get Quote',
        className: 'rounded-md border border-[#D9D9D9] bg-[#C20C0C] hover:bg-[#C20C0C]/90 font-medium text-white px-6',
      },
      {
        label: 'Purchase Cover',
        className: 'rounded-md border border-[#D9D9D9] bg-[#0CC258] hover:bg-[#0CC258]/90 font-medium text-white px-6',
      },
    ],
  },
  {
    id: 8,
    header: { type: 'image', src: '/madison.png' },
    content: [
      { label: 'Basic Premium', value: 'Kes. 1,500,000' },
      { label: 'Total Premium', value: 'Kes. 1,505,000' },
    ],
    footer: [
      {
        label: 'Get Quote',
        className: 'rounded-md border border-[#D9D9D9] bg-[#C20C0C] hover:bg-[#C20C0C]/90 font-medium text-white px-6',
      },
      {
        label: 'Purchase Cover',
        className: 'rounded-md border border-[#D9D9D9] bg-[#0CC258] hover:bg-[#0CC258]/90 font-medium text-white px-6',
      },
    ],
  },
]

export const ECOMPARISONSAMPLEDATA = [
  {
    id: 1,
    header: { type: 'image', src: '/britam.png' },
    content: [
      { label: 'Britam Insurance' },
      { label: 'Kes. 1,200,000' },
    ],
  },
  {
    id: 2,
    header: { type: 'image', src: '/cic.png' },
    content: [
      { label: 'CIC GROUP Insurance' },
      { label: 'Kes. 1,200,000' },
    ],
  },
  {
    id: 3,
    header: { type: 'image', src: '/sanlam.png' },
    content: [
      { label: 'Sanlam Insurance' },
      { label: 'Kes. 1,200,000' },
    ],
  },
  {
    id: 4,
    header: { type: 'image', src: '/madison.png' },
    content: [
      { label: 'Madison Insurance' },
      { label: 'Kes. 1,200,000' },
    ],
  },
  {
    id: 5,
    header: { type: 'image', src: '/britam.png' },
    content: [
      { label: 'Britam Insurance' },
      { label: 'Kes. 1,200,000' },
    ],
  },
  {
    id: 6,
    header: { type: 'image', src: '/cic.png' },
    content: [
      { label: 'CIC GROUP Insurance' },
      { label: 'Kes. 1,200,000' },
    ],
  },
  {
    id: 7,
    header: { type: 'image', src: '/sanlam.png' },
    content: [
      { label: 'Sanlam Insurance' },
      { label: 'Kes. 1,200,000' },
    ],
  },
  {
    id: 8,
    header: { type: 'image', src: '/madison.png' },
    content: [
      { label: 'Madison Insurance' },
      { label: 'Kes. 1,200,000' },
    ],
  },
]

export const POST_COMPARISON_DATA = [
  {
    id: 1,
    logo: "/britam.png",
    premiums: {
      basic: "Kes 130,000",
      duties: "Kes 625",
      total: "Kes 130,625",
    },
    coverages: [
      { label: "Excess Protector", status: "Optional", color: "#209BFF" },
      { label: "Political Violence & Terrorism", status: "Inclusive", color: "#0CC258" },
      { label: "Personal Accident (Insured)", status: "Covered", color: "#0CC258" },
      { label: "Courtesy Car (10 days)", status: "Covered", color: "#0CC258" },
      { label: "Road Rescue – AA", status: "Covered", color: "#0CC258" },
    ],
  },
  {
    id: 2,
    logo: "/britam.png",
    premiums: {
      basic: "Kes 128,500",
      duties: "Kes 600",
      total: "Kes 129,100",
    },
    coverages: [
      { label: "Excess Protector", status: "Optional", color: "#209BFF" },
      { label: "Political Violence & Terrorism", status: "Inclusive", color: "#0CC258" },
      { label: "Personal Accident (Insured)", status: "Covered", color: "#0CC258" },
      { label: "Courtesy Car (7 days)", status: "Covered", color: "#0CC258" },
      { label: "Road Rescue – AA", status: "Covered", color: "#0CC258" },
    ],
  },
  {
    id: 3,
    logo: "/britam.png",
    premiums: {
      basic: "Kes 135,000",
      duties: "Kes 650",
      total: "Kes 135,650",
    },
    coverages: [
      { label: "Excess Protector", status: "Inclusive", color: "#0CC258" },
      { label: "Political Violence & Terrorism", status: "Inclusive", color: "#0CC258" },
      { label: "Personal Accident (Insured)", status: "Covered", color: "#0CC258" },
      { label: "Courtesy Car (14 days)", status: "Covered", color: "#0CC258" },
      { label: "Road Rescue – AA", status: "Covered", color: "#0CC258" },
    ],
  },
];


export const claims: ClaimItem[] = [
  {
    id: 'CLM-1001',
    coverTitle: 'PSV Car Insurance Cover',
    policyNumber: 'POL-366782717',
    incidentDate: '2026-01-28',
    submittedDate: '2026-01-29',
    amount: 78000,
    status: 'pending',
  },
  {
    id: 'CLM-1002',
    coverTitle: 'All in One Cover',
    policyNumber: 'POL-311675987',
    incidentDate: '2025-12-19',
    submittedDate: '2025-12-20',
    amount: 45000,
    status: 'approved',
  },
]

