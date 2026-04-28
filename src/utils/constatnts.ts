/* eslint-disable @typescript-eslint/no-explicit-any */
import type { BenefitType, TActionType, TFilterOptions } from "@/types/types";
import { EPREFIX, EROUTES, SORT_ORDER } from "./enums";
import { ShieldCheck, BarChart3, Settings, LogOut } from "lucide-react";

// export 

export const EMETHODS = {
  GET: "get",
  POST: "post",
  PUT: "put",
  PATCH: "patch",
  DELETE: "delete",
} as const

export const ORGANIZATIONTYPES = [
  { label: "Agent", value: "Agent" },
  { label: "Insurer", value: "Insurer" },
  { label: "Partner", value: "Partner" },
  { label: "Company", value: "Company" },
  { label: "Organization", value: "Organization" },
]

export const MOTORDETAILEDBENEFITSGROUPTYPES = [
  { label: "All", value: "All" },
  { label: "Single", value: "Single" },
  { label: "Comparison", value: "Comparison" }
]

export const MOTORDETAILEDBENEFITSREFERENCETYPES = [
  { label: "Benefit", value: "Benefit" },
  { label: "Excess", value: "Excess" },
  { label: "Both", value: "Both" }
]

export const EORGANIZATIONTYPES = {
  AGENT: "Agent",
  INSURER: "Insurer",
  PARTNER: "Partner",
  COMPANY: "Company",
  ORGANIZATION: "Organization",
} as const;

export type EORGANIZATIONTYPES = typeof EORGANIZATIONTYPES[keyof typeof EORGANIZATIONTYPES];

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]

export const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];

export type EMETHODS = typeof EMETHODS[keyof typeof EMETHODS]

export const baseFactoryReducer = <S>(state: S, action: TActionType<S>): S => ({
  ...state,
  ...action.payload,
});

export function ReusableReducer<T = TFilterOptions>(
  state: T,
  action: TActionType<T>
): T {
  return { ...state, ...action.payload };
}

export const FILTERS_DEFAULTS: TFilterOptions & Record<string, any> = {
  order: { direction: SORT_ORDER.Ascending, orderField: '' },
  date: [],
  term: '',
};

export const FILTEROPTIONS: TFilterOptions & Record<string, any> = {
  order: { direction: SORT_ORDER.Ascending, orderField: '' },
  date: [],
  term: '',
};

export const PAYMENTPLANS = [
  { label: "Full Payment", value: "Full" },
  { label: "Two Payment Installments", value: "Two_Installment" },
  { label: "Three Payment Installments", value: "Three_Installment" },
]

export const MOTORADDONSBENEFITS = [
  { label: "Excess", value: "Excess" },
  { label: "Political", value: "Political" },
  { label: "Courtesy", value: "Courtesy" },
  { label: "Rescue", value: "Rescue" },
  { label: "Accident", value: "Accident" },
]

export const BOOLEANOPTIONS = [
  { label: "Yes", value: true },
  { label: "No", value: false },
]

export const ACCESSLEVELSOPTIONS = [
  { label: "All", value: 'All' },
  { label: "Personal Owned", value: 'Personal Owned' },
  { label: "Company Owned", value: 'Company Owned' },
]

export const OWNERSHIPOPTIONS = [
  { label: "Personal Owned", value: 'Personal Owned' },
  { label: "Company Owned", value: 'Company Owned' },
]

export const BENEFITTYPESOPTIONS = [
  { label: "Optional", value: 'Optional' },
  { label: "Inclusive", value: 'Inclusive' },
  { label: "Compulsory", value: 'Compulsory' },
]

export const DETAILEDTYPESOPTIONS = [
  { label: "Benefit", value: 'Benefit' },
  { label: "Excess", value: 'Excess' },
  { label: "Both", value: 'Both' },
]

export const HIGHLIGHTOPTIONS = [
  { label: "True", value: 'true' },
  { label: "False", value: 'false' },
]

export const TARGET_AUDIENCE_OPTIONS = [
  { label: "Yes", value: "true" },
  { label: "No", value: "false" },
]

export const TAUDIENCE_OPTIONS = [
  { label: "Any (available for any)", value: "Any" },
  { label: "Existing Customer Only", value: "Existing" },
  { label: "Co-oprate Customers Only", value: "Corporate" },
]

export const CAUDIENCE_OPTIONS = [
  { label: "Any (All Genders)", value: "Any" },
  { label: "Ladies (only ladies)", value: "Ladies Only" },
  { label: "Men (only for men)", value: "Men Only" },
]

export const IDTYPES = [
  { label: "National ID", value: "NationalID" },
  { label: "Passport", value: "Passport" },
  { label: "Allien ID", value: "AllienID" },
  { label: "Millitary ID", value: "MillitaryID" },
]


export const createHeroPopoverItems = (
  logout: () => void
) => [
    {
      label: "My Covers",
      to: `/${EPREFIX.CUSTOMER}${EROUTES.MY_COVERS}`,
      icon: ShieldCheck,
    },
    {
      label: "Reports",
      to: EROUTES.REPORTS,
      icon: BarChart3,
    },
    {
      label: "Settings",
      to: EROUTES.SETTINGS,
      icon: Settings,
    },
    {
      label: "Log out",
      onClick: logout,
      icon: LogOut,
      destructive: true,
    },
  ]

export const myAccounttLinks = [
  { label: 'Account Management', to: `/${EPREFIX.CUSTOMER}${EROUTES.MY_COVERS}/account` },
  { label: 'Payment Settings', to: `/${EPREFIX.CUSTOMER}${EROUTES.MY_COVERS}/payments` },
  { label: 'Address Book', to: `/${EPREFIX.CUSTOMER}${EROUTES.MY_COVERS}/addresses` },
  // { label: 'Newsletter Preferences', to: `/${EPREFIX.CUSTOMER}${EROUTES.MY_COVERS}/newsletters` },
]

export const sidebarLinks = [
  { label: 'My Account', to: `/${EPREFIX.CUSTOMER}${EROUTES.MY_COVERS}/account` },
  { label: 'Covers', to: `/${EPREFIX.CUSTOMER}${EROUTES.MY_COVERS}` },
  // { label: 'Inbox', to: `/${EPREFIX.CUSTOMER}${EROUTES.MY_COVERS}/inbox` },
  // { label: 'Pending Reviews', to: `/${EPREFIX.CUSTOMER}${EROUTES.MY_COVERS}/reviews` },
  { label: 'Claims', to: `/${EPREFIX.CUSTOMER}${EROUTES.MY_COVERS}/claims` },
  // { label: 'Wishlist', to: `/${EPREFIX.CUSTOMER}${EROUTES.MY_COVERS}/wishlist` },
  // { label: 'Followed Sellers', to: `/${EPREFIX.CUSTOMER}${EROUTES.MY_COVERS}/followed` },
  // { label: 'Recently Viewed', to: `/${EPREFIX.CUSTOMER}${EROUTES.MY_COVERS}/recent` },
]

export const RatesSteps = [
    { title: 'Product', fields: ['coverfor_id', 'covertype_id', 'covering_id', 'usedfor_id', 'bodytype_id', 'used_tonnage_id'] },
    { title: 'Vehicle Info', fields: ['valued_from', 'valued_to', 'age_from', 'age_to', 'rate', 'minimum', 'pll'] },
    { title: 'Fleet', fields: ['is_fleet', 'min_fleet', 'max_fleet'] },
    { title: 'Targets', fields: ['target_audience', 'cover_target', 'min_age', 'max_age'] },
    { title: 'Dates', fields: ['start_date', 'expiry_date'] },
    { title: 'Offered Vehicles', fields: ['makemodel_offered', 'makemodel_notoffered'] }
]

export const POLL_INTERVAL_MS = 3000
export const POLL_TIMEOUT_MS = 90000
export const MOTOR_QUOTE_SESSION_STORAGE_KEY = "motor_quote_session_id"
export const PURCHASE_SESSION_STORAGE_KEY = "purchase_session_id"
export const INVOICE_SESSION_STORAGE_KEY = "invoice_purchase_session_id"
export const INVOICE_ID_KEY = "invoice_id"

export const BENEFIT_TYPE_CONFIG = {
    inclusive: { label: "Inclusive", color: "bg-[#0CC258]" },
    compulsory: { label: "Compulsory", color: "bg-[#C20C0C]" },
    optional: { label: "Optional", color: "bg-[#209BFF]" },
} as const;


export const BENEFIT_SECTIONS: { type: BenefitType; key: "compulsory" | "inclusive" | "optional" }[] = [
    { type: "compulsory", key: "compulsory" },
    { type: "inclusive", key: "inclusive" },
    { type: "optional", key: "optional" },
];

export const MAX_COMPARISONS = 3