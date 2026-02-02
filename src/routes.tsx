import { Routes, Route, Navigate } from "react-router-dom"
import Layout from "./Layout"

// Dashboard
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
import { Landingpage } from "./app/landing/page"

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landingpage />} />
      <Route path="/dashboard" element={<Layout><DashboardPage /></Layout>} />

      {/* Members */}
      <Route path="/members" element={<Layout><MembersPage /></Layout>} />
      <Route path="/members/new" element={<Layout><MemberNewPage /></Layout>} />
      <Route path="/members/:id" element={<Layout><MemberDetailPage /></Layout>} />

      {/* Savings */}
      <Route path="/savings" element={<Layout><SavingsPage /></Layout>} />
      <Route path="/savings/products" element={<Layout><SavingsProductsPage /></Layout>} />
      <Route path="/savings/:id" element={<Layout><SavingAccensureuntDetailPage /></Layout>} />

      {/* Loans */}
      <Route path="/loans" element={<Layout><LoansPage /></Layout>} />
      <Route path="/loans/apply" element={<Layout><LoanApplicationPage /></Layout>} />
      <Route path="/loans/products" element={<Layout><LoanProductsPage /></Layout>} />
      <Route path="/loans/:id" element={<Layout><LoanDetailPage /></Layout>} />

      {/* Transactions */}
      <Route path="/transactions" element={<Layout><TransactionsPage /></Layout>} />

      {/* Reports */}
      <Route path="/reports" element={<Layout><ReportsPage /></Layout>} />

      {/* Staff */}
      <Route path="/staff" element={<Layout><StaffPage /></Layout>} />
      <Route path="/staff/:id" element={<Layout><StaffDetailPage /></Layout>} />

      {/* Settings */}
      <Route path="/settings" element={<Layout><SettingsPage /></Layout>} />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
