// AppRoutes.tsx
import { Routes, Route, Navigate, Outlet } from "react-router-dom"
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

export function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path={EROUTES.LANDING} element={<Landingpage />} />

      <Route path={EPREFIX.CUSTOMER} element={<MotorLandingPage />}>
        <Route path={EROUTES.MOTOR.slice(1)} element={<StepPage />} />
      </Route>

      <Route path={EPREFIX.AUTH} element={<Outlet />}>
        {/* <Route index element={<Navigate to="login" replace />} /> */}
        <Route 
          path={EROUTES.SIGNIN.slice(1)} 
          element={
            <AuthLayoutPage 
              title="Please sign in or register" 
              description="to purchase your cover"
            >
              <LoginForm />
            </AuthLayoutPage>
          } 
        />
        <Route 
          path={EROUTES.SIGNUP.slice(1)} 
          element={
            <AuthLayoutPage 
              title="Please sign in or register" 
              description="to purchase your cover"
            >
              <SignupForm />
            </AuthLayoutPage>
          } 
        />
        {/* <Route path="forgot-password" element={<ForgotPasswordPage />} /> */}
      </Route>

      {/* Admin */}
      <Route
        path={EROUTES.DASHBOARD}
        element={<Layout><DashboardPage /></Layout>}
      />

      {/* Members */}
      <Route
        path={EROUTES.MEMBERS}
        element={<Layout><MembersPage /></Layout>}
      />
      <Route
        path={EROUTES.MEMBERS_NEW}
        element={<Layout><MemberNewPage /></Layout>}
      />
      <Route
        path={EROUTES.MEMBERS_DETAIL}
        element={<Layout><MemberDetailPage /></Layout>}
      />

      {/* Savings */}
      <Route
        path={EROUTES.SAVINGS}
        element={<Layout><SavingsPage /></Layout>}
      />
      <Route
        path={EROUTES.SAVINGS_PRODUCTS}
        element={<Layout><SavingsProductsPage /></Layout>}
      />
      <Route
        path={EROUTES.SAVINGS_DETAIL}
        element={<Layout><SavingAccensureuntDetailPage /></Layout>}
      />

      {/* Loans */}
      <Route
        path={EROUTES.LOANS}
        element={<Layout><LoansPage /></Layout>}
      />
      <Route
        path={EROUTES.LOANS_APPLY}
        element={<Layout><LoanApplicationPage /></Layout>}
      />
      <Route
        path={EROUTES.LOANS_PRODUCTS}
        element={<Layout><LoanProductsPage /></Layout>}
      />
      <Route
        path={EROUTES.LOANS_DETAIL}
        element={<Layout><LoanDetailPage /></Layout>}
      />

      {/* Transactions */}
      <Route
        path={EROUTES.TRANSACTIONS}
        element={<Layout><TransactionsPage /></Layout>}
      />

      {/* Reports */}
      <Route
        path={EROUTES.REPORTS}
        element={<Layout><ReportsPage /></Layout>}
      />

      {/* Staff */}
      <Route
        path={EROUTES.STAFF}
        element={<Layout><StaffPage /></Layout>}
      />
      <Route
        path={EROUTES.STAFF_DETAIL}
        element={<Layout><StaffDetailPage /></Layout>}
      />

      {/* Settings */}
      <Route
        path={EROUTES.SETTINGS}
        element={<Layout><SettingsPage /></Layout>}
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to={EROUTES.LANDING} replace />} />
    </Routes>
  )
}
