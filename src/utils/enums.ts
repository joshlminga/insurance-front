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
} as const

export const EROUTES = {
  // Public
  LANDING: '/',
  MOTOR: '/motor',
  TRAVEL: '/travel',
  MARINE: '/marine',
  LIFE: '/life',
  MY_COVERS: '/my-covers',

  // Auth
  SIGNUP: '/signup',
  SIGNIN: '/signin',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

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

  // Reports
  REPORTS: `/${EPREFIX.DASHBOARD}/reports`,

  // Staff
  STAFF: `/${EPREFIX.DASHBOARD}/staff`,
  STAFF_DETAIL: `/${EPREFIX.DASHBOARD}/staff/:id`,

  // Settings
  SETTINGS: `/${EPREFIX.DASHBOARD}/settings`,

  // Quotations
  QUOTATIONS: `/${EPREFIX.DASHBOARD}/${EPREFIX.QUOTATIONS}`,
  MOTORQUOTATIONS: `/${EPREFIX.DASHBOARD}/${EPREFIX.QUOTATIONS}/motor-quotations`,
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
  USERS: `/${EPREFIX.DASHBOARD}/users`,
} as const

export const SORT_ORDER = {
  Descending: 'DESC',
  Ascending: 'ASC',
} as const;

export type SORT_ORDER = typeof SORT_ORDER[keyof typeof SORT_ORDER];

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

export const myCoversTestData = [
  {
    Cover: "KCW 123S",
    Renewal: "2026-11-15",
    value: "KES 45,000",
    claims: "0",
    is_active: true,
  },
  {
    Cover: "KCA 054Y",
    Renewal: "2026-05-20",
    value: "KES 350,000",
    claims: "KES100,000",
    is_active: true,
  },
  {
    Cover: "KDN 154A",
    Renewal: "2026-01-10",
    value: "KES 1,000,000",
    claims: "0",
    is_active: false,
  },
];