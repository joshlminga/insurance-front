/* eslint-disable @typescript-eslint/no-explicit-any */
import type { BenefitType, NavItem, TActionType, TFilterOptions, TNotifs } from "@/types/types";
import { EPREFIX, EROUTES, SORT_ORDER } from "./enums";
import { Car, Ship, Bus, User, FileText, BookOpen, LifeBuoy, PhoneCall } from "lucide-react";
import { Search } from "@/components/search";

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

export const PRODUCT_TYPES = [
  { label: "Motor", value: "Motor" },
  { label: "Medical", value: "Medical" },
  { label: "Travel", value: "Travel" },
  { label: "Life", value: "Life" },
  { label: "Home", value: "Home" },
  { label: "Marine", value: "Marine" },
] as const

/** API payload uses PRODUCT_TYPES `value` (e.g. "Motor"), not the display label. */
export const PRODUCT_TYPE_VALUES = PRODUCT_TYPES.map((item) => item.value)

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

/** Flip to true when backend credit-summary endpoint is ready */
export const CREDIT_SUMMARY_API_ENABLED = true
export const CREDIT_SUMMARY_URL = "credit/wallet"

/** Flip to true when backend bank-payment-details endpoint is ready */
export const BANK_PAYMENT_DETAILS_API_ENABLED = false
export const BANK_PAYMENT_DETAILS_URL = "purchase/motor/bank-payment-details"
export const VEHICLE_DETAILS_SESSION_STORAGE_KEY = "vehicle_info_session"
export const VEHICLE_OWNERSHIP_SESSION_STORAGE_KEY = "vehicle_ownership_session"
export const ADMIN_MOTOR_CUSTOMER_EMAIL_KEY = "admin_motor_customer_email"
export const ADMIN_MOTOR_CUSTOMER_NAME_KEY = "admin_motor_customer_name"
export const ADMIN_MOTOR_CUSTOMER_PHONE_KEY = "admin_motor_customer_phone"
export const INVOICE_ID_KEY = "invoice_id"

export const BENEFIT_TYPE_CONFIG = {
    selected: { label: "Selected", color: "text-red-700", bg: "bg-red-100" },
    inclusive: { label: "Inclusive", color: "text-green-700", bg: "bg-green-100" },
    compulsory: { label: "Compulsory", color: "text-blue-700", bg:"bg-blue-100" },
    optional: { label: "Optional", color: "text-gray-600", bg: "bg-gray-100" },
} as const;


export const BENEFIT_SECTIONS: { type: BenefitType; key: "compulsory" | "inclusive" | "selected" }[] = [
    { type: "compulsory", key: "compulsory" },
    { type: "inclusive", key: "inclusive" },
    { type: "selected", key: "selected" },

    // { type: "optional", key: "optional" },
];

export const MAX_COMPARISONS = 3
export const CONFIRMATION_DIALOG_CONFIRM_CLASSES = "rounded-full bg-[#C20C0C]/80 text-white shadow-none hover:bg-[#C20C0C] hover:text-white"
export const CONFIRMATION_DIALOG_CANCEL_CLASSES = "rounded-full border border-[#C20C0C] bg-transparent text-[#C20C0C] shadow-none hover:bg-[#C20C0C]/10 hover:text-[#C20C0C]"

export const INSTALLMENT_FIELDS_VISIBLE: Record<string, number> = {
    Full: 1,
    Two_Installment: 2,
    Three_Installment: 3,
}
export const BENEFIT_SELECT_NONE = '__none__'

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Insurance',
    dropdown: [
      { icon: Car, label: 'Motor Insurance', description: 'Cover for cars, trucks & motorcycles', href: `/${EPREFIX.CUSTOMER}${EROUTES.MOTOR}` },
      { icon: Ship, label: 'Marine Insurance', description: 'Protection for cargo & shipping', href: `/${EPREFIX.CUSTOMER}${EROUTES.MARINE}` },
      { icon: Bus, label: 'Travel Insurance', description: 'Worldwide travel peace of mind', href: `/${EPREFIX.CUSTOMER}${EROUTES.TRAVEL}` },
      { icon: User, label: 'Life Insurance', description: "Secure your family's future", href: `/${EPREFIX.CUSTOMER}${EROUTES.LIFE}` },
    ],
  },
  {
    label: 'Claims',
    dropdown: [
      { icon: FileText, label: 'File a Claim', description: 'Submit a new insurance claim', href: '#' },
      { icon: Search, label: 'Track a Claim', description: 'Check status of existing claims', href: '#' },
    ],
  },
  {
    label: 'Resources',
    dropdown: [
      { icon: BookOpen, label: 'Blog & Guides', description: 'Insurance tips and articles', href: '#' },
      { icon: LifeBuoy, label: 'Help Centre', description: 'FAQs and support articles', href: '#' },
    ],
  },
  {
    label: 'Contact',
    dropdown: [
      { icon: PhoneCall, label: 'Talk to Us', description: 'Reach our support team', href: EROUTES.CONTACT_US },
      { icon: User, label: 'Find an Agent', description: 'Connect with a local advisor', href: '#' },
    ],
  },
]

export const LANG_NAMES: Record<string, string> = {
  eng: 'English', swa: 'Swahili', fra: 'French', kin: 'Kinyarwanda', tsn: 'Tswana',
}

export const COVER_STATUS_DISPLAY: Record<string, any> = {
    waiting_payment: {
        label: "Payment Pending",
        className:
            "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50",
    },
    pending: {
        label: "AKI Pending Issuing",
        className:
            "border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50",
    },
    issued: {
        label: "Issued",
        className:
            "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
    },
    failed: {
        label: "Failed",
        className:
            "border border-red-200 bg-red-50 text-red-700 hover:bg-red-50",
    },
};

export const SAMPLE_NOTIFS: TNotifs[] = [
  {
  	type: 'message',
  	avatar:
  		'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  	message:
  		'New message from Jese Leos: "Hey, what\'s up? All set for the presentation?"',
  	time: 'a few moments ago',
  	unread: true,
  	color: 'bg-blue-600',
  },
  {
  	type: 'follow',
  	avatar:
  		'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  	message: 'Joseph Mcfall and 5 others started following you.',
  	time: '10 minutes ago',
  	unread: true,
  	color: 'bg-gray-900',
  },
  {
  	type: 'like',
  	avatar:
  		'https://images.unsplash.com/photo-1494790108755-2616b332c363?w=150&h=150&fit=crop&crop=face',
  	message:
  		'Bonnie Green and 141 others love your story. See it and view more stories.',
  	time: '44 minutes ago',
  	unread: false,
  	color: 'bg-red-600',
  },
  {
  	type: 'mention',
  	avatar:
  		'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
  	message:
  		'Leslie Livingston mentioned you in a comment: @bonnie.green what do you say?',
  	time: '1 hour ago',
  	unread: false,
  	color: 'bg-green-400',
  },
  {
  	type: 'video',
  	avatar:
  		'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
  	message:
  		'Robert Brown posted a new video: Glassmorphism - learn how to implement the new design trend.',
  	time: '3 hours ago',
  	unread: false,
  	color: 'bg-purple-500',
  },
].map((notif: TNotifs, id) => ({ ...notif, id: `${id}` }));