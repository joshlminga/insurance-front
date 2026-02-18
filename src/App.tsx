// routes.tsx
import { createBrowserRouter, Navigate } from "react-router-dom"
import Layout from "./Layout"
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
import { StepPage } from "./app/motor/steppers/steppage"
import { MotorLandingPage } from "./app/motor/page"
import AuthLayoutPage from "./auth/layout"
import { SignupForm } from "./auth/components/signup-form"
import { LoginForm } from "./auth/components/login-form"
import { MarineLandingPage } from "./app/marine/page"
import { MarineStepPage } from "./app/marine/steppers/steppage"

import { ProtectedRoute, PublicRoute, CustomerPublicRoute } from "./hooks/hooks"

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
  // Admin - Dashboard
  {
    path: EROUTES.DASHBOARD,
    element: (
      <ProtectedRoute requireGeneral={false}>
        <Layout>
          <DashboardPage />
        </Layout>
      </ProtectedRoute>
    ),
  },

  // Members
  {
    path: EROUTES.MEMBERS,
    element: (
      <ProtectedRoute requireGeneral={false}>
        <Layout>
          <MembersPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: EROUTES.MEMBERS_NEW,
    element: (
      <ProtectedRoute requireGeneral={false}>
        <Layout>
          <MemberNewPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: EROUTES.MEMBERS_DETAIL,
    element: (
      <ProtectedRoute requireGeneral={false}>
        <Layout>
          <MemberDetailPage />
        </Layout>
      </ProtectedRoute>
    ),
  },

  // Savings
  {
    path: EROUTES.SAVINGS,
    element: (
      <ProtectedRoute requireGeneral={false}>
        <Layout>
          <SavingsPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: EROUTES.SAVINGS_PRODUCTS,
    element: (
      <ProtectedRoute requireGeneral={false}>
        <Layout>
          <SavingsProductsPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: EROUTES.SAVINGS_DETAIL,
    element: (
      <ProtectedRoute requireGeneral={false}>
        <Layout>
          <SavingAccensureuntDetailPage />
        </Layout>
      </ProtectedRoute>
    ),
  },

  // Loans
  {
    path: EROUTES.LOANS,
    element: (
      <ProtectedRoute requireGeneral={false}>
        <Layout>
          <LoansPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: EROUTES.LOANS_APPLY,
    element: (
      <ProtectedRoute requireGeneral={false}>
        <Layout>
          <LoanApplicationPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: EROUTES.LOANS_PRODUCTS,
    element: (
      <ProtectedRoute requireGeneral={false}>
        <Layout>
          <LoanProductsPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: EROUTES.LOANS_DETAIL,
    element: (
      <ProtectedRoute requireGeneral={false}>
        <Layout>
          <LoanDetailPage />
        </Layout>
      </ProtectedRoute>
    ),
  },

  // Transactions
  {
    path: EROUTES.TRANSACTIONS,
    element: (
      <ProtectedRoute requireGeneral={false}>
        <Layout>
          <TransactionsPage />
        </Layout>
      </ProtectedRoute>
    ),
  },

  // Reports
  {
    path: EROUTES.REPORTS,
    element: (
      <ProtectedRoute requireGeneral={false}>
        <Layout>
          <ReportsPage />
        </Layout>
      </ProtectedRoute>
    ),
  },

  // Staff
  {
    path: EROUTES.STAFF,
    element: (
      <ProtectedRoute requireGeneral={false}>
        <Layout>
          <StaffPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: EROUTES.STAFF_DETAIL,
    element: (
      <ProtectedRoute requireGeneral={false}>
        <Layout>
          <StaffDetailPage />
        </Layout>
      </ProtectedRoute>
    ),
  },

  // Settings
  {
    path: EROUTES.SETTINGS,
    element: (
      <ProtectedRoute requireGeneral={false}>
        <Layout>
          <SettingsPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  // END-USERGENERAL = FALSE

  // Fallback
  {
    path: "*",
    element: <Navigate to={EROUTES.LANDING} replace />,
  },
])
