// routes.tsx
import { createBrowserRouter, Navigate } from "react-router-dom"
import { EPREFIX, EROUTES } from "./utils/enums"

// Pages
import DashboardPage from "./app/dashboard"

// Members
import MembersPage from "./app/members/page"
import MemberDetailPage from "./app/members/[id]/page"
import MemberNewPage from "./app/members/new/page"

// Savings
import SavingsPage from "./app/savings/page"
import SavingAccensureuntDetailPage from "./app/savings/[id]/page"
import SavingsProductsPage from "./app/savings/products/page"

// Loans
import LoansPage from "./app/loans/page"
import LoanDetailPage from "./app/loans/[id]/page"
import LoanApplicationPage from "./app/loans/apply/page"
import LoanProductsPage from "./app/loans/products/page"

// Transactions
import TransactionsPage from "./app/transactions/page"

// Reports
import ReportsPage from "./app/reports/page"

// Staff
import StaffPage from "./app/staff/page"
import StaffDetailPage from "./app/staff/[id]/page"

// Settings
import SettingsPage from "./app/settings/page"

// Landing
import { Landingpage } from "./app/landing/page"
// import { StepPage } from "./app/motor/steppers/steppage"
// import { MotorLandingPage } from "./app/motor/page"
import AuthLayoutPage from "./auth/layout"
import { SignupForm } from "./auth/components/signup-form"
import { LoginForm } from "./auth/components/login-form"
import { MarineLandingPage } from "./app/customer/marine/page"
import { MarineStepPage } from "./app/customer/marine/steppers/steppage"

import { ProtectedRoute, PublicRoute, CustomerPublicRoute } from "./hooks/hooks"
import Layout from "./Layout"
import OrganizationsPage from "./app/admin/organizations/page"
import { UsersPage } from "./app/admin/users/page"
import { MotorProductPage } from "./app/admin/product/motor/page"
import { MotorLandingPage } from "./app/customer/motor/page"
import { StepPage } from "./app/customer/motor/steppers/steppage"
import { MyCoversLayout } from "./app/customer/my-covers/layout"
import { CoversPage } from "./app/customer/my-covers/ongoing/page"
import { CancelledCoversPage } from "./app/customer/my-covers/cancelled/page"
import { MyAccountManagementPage } from "./app/customer/my-covers/my-account/page"
import { MyClaimsPage } from "./app/customer/my-covers/my-claims/page"

export const router = createBrowserRouter([

  // Public
  {
    path: EROUTES.LANDING,
    element: (
      <PublicRoute>
        <Landingpage />
      </PublicRoute>
    ),
  },

  // START-USERGENERAL = TRUE
  // Motor / Customer
  {
    path: EPREFIX.CUSTOMER,
    element: (
      <CustomerPublicRoute>
        <MotorLandingPage />
      </CustomerPublicRoute>
    ),
    children: [
      {
        path: EROUTES.MOTOR.slice(1),
        element: <StepPage />,
      },
    ],
  },

  // My Covers / Customer Account — protected (authenticated only)
  {
    path: `${EPREFIX.CUSTOMER}${EROUTES.MY_COVERS}`,
    element: (
      <ProtectedRoute>
        <MyCoversLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <CoversPage />,
      },
      {
        path: "cancelled",
        element: <CoversPage />,
        children: [
          {
            index: true,
            element: <CancelledCoversPage />,
          },
        ],
      },
      {
        path: "account",
        element: <MyAccountManagementPage />,
      },
      {
        path: "claims",
        element: <MyClaimsPage />,
      },
    ],
  },

  // marine
  {
    path: EPREFIX.CUSTOMER,
    element: (
      <CustomerPublicRoute>
        <MarineLandingPage />
      </CustomerPublicRoute>
    ),
    children: [
      {
        path: EROUTES.MARINE.slice(1),
        element: <MarineStepPage />,
      },
    ],
  },
  // END-USERGENERAL = TRUE

  // Auth
  {
    path: EPREFIX.AUTH,
    children: [
      {
        path: EROUTES.SIGNIN.slice(1),
        element: (
          <PublicRoute>
            <AuthLayoutPage
              title="Please sign in"
              description="to purchase your cover">
              <LoginForm />
            </AuthLayoutPage>
          </PublicRoute>
        ),
      },
      {
        path: EROUTES.SIGNUP.slice(1),
        element: (
          <PublicRoute>
            <AuthLayoutPage
              title="Please or register"
              description="to purchase your cover">
              <SignupForm />
            </AuthLayoutPage>
          </PublicRoute>
        ),
      },
    ],
  },

  // START-USERGENERAL = FALSE
  // Admin - Dashboard & Nested Routes
  {
    path: EROUTES.DASHBOARD,
    element: (
      <ProtectedRoute requireGeneral={false}>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      // Members
      {
        path: "members",
        element: <MembersPage />,
      },
      {
        path: "members/new",
        element: <MemberNewPage />,
      },
      {
        path: "members/:id",
        element: <MemberDetailPage />,
      },
      // Savings
      {
        path: "savings",
        element: <SavingsPage />,
      },
      {
        path: "savings/products",
        element: <SavingsProductsPage />,
      },
      {
        path: "savings/:id",
        element: <SavingAccensureuntDetailPage />,
      },
      // Loans
      {
        path: "loans",
        element: <LoansPage />,
      },
      {
        path: "loans/apply",
        element: <LoanApplicationPage />,
      },
      {
        path: "loans/products",
        element: <LoanProductsPage />,
      },
      {
        path: "loans/:id",
        element: <LoanDetailPage />,
      },
      // Transactions
      {
        path: "transactions",
        element: <TransactionsPage />,
      },
      // Reports
      {
        path: "reports",
        element: <ReportsPage />,
      },
      // Staff
      {
        path: "staff",
        element: <StaffPage />,
      },
      {
        path: "staff",
        element: <StaffPage />,
      },
      {
        path: "staff/:id",
        element: <StaffDetailPage />,
      },

      // products
      {
        path: "products/motor",
        element: <MotorProductPage />,
      },

      // Organizations
      {
        path: "organization",
        element: <OrganizationsPage />,
      },
      // Users
      {
        path: "users",
        element: <UsersPage />,
      },
      // Settings
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
  // END-USERGENERAL = FALSE

  // Fallback
  {
    path: "*",
    element: <Navigate to={EROUTES.LANDING} replace />,
  },
])
