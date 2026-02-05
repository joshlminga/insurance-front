import { CustomerVerificationDetails } from "@/app/motor/steppers/capture-details";
import OTPVerificationPage from "@/app/motor/steppers/otp-verification";
import { QuotationsPage } from "@/app/motor/steppers/quotations";
import { MotorCommercialPage } from "@/app/motor/steppers/tabs/motor-commercial";
import { MotorPrivatePage } from "@/app/motor/steppers/tabs/motor-private";
import { MotorPsvPage } from "@/app/motor/steppers/tabs/motor-psv";
import { VehicleDetailsPage } from "@/app/motor/steppers/vehicle-details";
import { Car, Truck, Van } from "lucide-react";

export const ELOGO = {
  NAVBARLOGO: '/logo/logo1.png'
}

export const CURRENTUSER = {
  name: "Admin",
  email: "admin@accensure.com",
  avatar: "",
}

export const EPREFIX = {
  ADMIN: "admin",
  AGENT: "agent",
  CUSTOMER: "customer",
} as const

export const EROUTES = {
  // Public
  LANDING: '/',
  MOTOR: '/motor',
  TRAVEL: '/travel',
  MARINE: '/marine',
  LIFE: '/life',

  // Admin / Dashboard
  DASHBOARD: "/dashboard",

  // Members
  MEMBERS: "/members",
  MEMBERS_NEW: "/members/new",
  MEMBERS_DETAIL: "/members/:id",

  // Savings
  SAVINGS: "/savings",
  SAVINGS_PRODUCTS: "/savings/products",
  SAVINGS_DETAIL: "/savings/:id",

  // Loans
  LOANS: "/loans",
  LOANS_APPLY: "/loans/apply",
  LOANS_PRODUCTS: "/loans/products",
  LOANS_DETAIL: "/loans/:id",

  // Transactions
  TRANSACTIONS: "/transactions",

  // Reports
  REPORTS: "/reports",

  // Staff
  STAFF: "/staff",
  STAFF_DETAIL: "/staff/:id",

  // Settings
  SETTINGS: "/settings",
} as const;

export const ESTEPS = [
  {
    title: "",
    content: CustomerVerificationDetails,
  },
  {
    title: "",
    content: OTPVerificationPage,
  },
  {
    title: "",
    content: VehicleDetailsPage,
  },
  {
    title: "",
    content: QuotationsPage,
  },
]

export const EMOTORTABS = [
  {
    value: "private",
    label: "Private",
    icon: Car,
    iconSize: 18,
    component: MotorPrivatePage,
  },
  {
    value: "commercial",
    label: "Commercial",
    icon: Truck,
    iconSize: 20,
    component: MotorCommercialPage,
  },
  {
    value: "psv",
    label: "PSV",
    icon: Van,
    iconSize: 16,
    component: MotorPsvPage,
  },
]

export const QUOTATIONCHECKBOX = [
  { id: 'excess', label: 'Excess Protector' },
  { id: 'pvt', label: 'Political Violence & Terrorism' },
  { id: 'pa', label: 'Personal Accident' },
]

// sample-data.ts
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
]
