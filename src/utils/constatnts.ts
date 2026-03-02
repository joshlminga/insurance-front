/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TActionType, TFilterOptions } from "@/types/types";
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
  {label: "All", value:"All"},
  {label: "Single", value:"Single"},
  {label: "Comparison", value:"Comparison"}
]

export const MOTORDETAILEDBENEFITSREFERENCETYPES = [
  {label: "Benefit", value:"Benefit"},
  {label: "Excess", value:"Excess"},
  {label: "Both", value:"Both"}
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
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
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

export const TARGET_AUDIENCE_OPTIONS = [
  { label: "Yes", value: "true" },
  { label: "No", value: "false" },
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