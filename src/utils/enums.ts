
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
