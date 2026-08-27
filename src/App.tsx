/* eslint-disable react-refresh/only-export-components */
// routes.tsx
import { lazy, Suspense } from "react"
import { createBrowserRouter, Navigate } from "react-router-dom"
import { EPREFIX, EROUTES } from "./utils/enums"
import { ProtectedRoute, PublicRoute, CustomerPublicRoute } from "./hooks/hooks"
import { AdminModulePage } from "./auth/AdminModulePage"
import { MODULES, PURCHASE_MOTOR_MODULES, QUOTATION_MOTOR_MODULES } from "./auth/module-keys"
import Layout from "./Layout"
import SubdomainGuestGate from "./auth/subdomain-guest-gate"

const Loader = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <div className="h-12 w-12 animate-spin rounded-full border-dotted border-4 border-[#C20C0C] border-t-[#C20C0C] animation-duration-[4s]" />
  </div>
)


function S({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Loader />}>{children}</Suspense>
}

// customer-facing pages
const Landingpage = lazy(() => import("./app/landing/page").then(m => ({ default: m.Landingpage })))
const ContactUsPage = lazy(() => import("./app/landing/contact-us/page").then(m => ({ default: m.ContactUsPage })))
const ProductsListPage = lazy(() => import("./app/landing/products/page").then(m => ({ default: m.ProductsListPage })))

const MotorLandingPage = lazy(() => import("./app/customer/motor/page").then(m => ({ default: m.MotorLandingPage })))
const StepPage = lazy(() => import("./app/customer/motor/steppers/steppage").then(m => ({ default: m.StepPage })))
const MarineLandingPage = lazy(() => import("./app/customer/marine/page").then(m => ({ default: m.MarineLandingPage })))
const MarineStepPage = lazy(() => import("./app/customer/marine/steppers/steppage").then(m => ({ default: m.MarineStepPage })))
const PesapalReturnPage = lazy(() => import("./app/customer/payment/pesapal/return/page").then(m => ({ default: m.PesapalReturnPage })))
const PaymentLayout = lazy(() => import("./app/payment/layout").then(m => ({ default: m.PaymentLayout })))
const MpesaReturnPage = lazy(() => import("./app/payment/mpesa/return/page").then(m => ({ default: m.MpesaReturnPage })))
const MpesaSuccessPage = lazy(() => import("./app/payment/mpesa/success/page").then(m => ({ default: m.MpesaSuccessPage })))
const MpesaFailedPage = lazy(() => import("./app/payment/mpesa/failed/page").then(m => ({ default: m.MpesaFailedPage })))
const CreditReturnPage = lazy(() => import("./app/payment/credit/return/page").then(m => ({ default: m.CreditReturnPage })))
const CreditSuccessPage = lazy(() => import("./app/payment/credit/success/page").then(m => ({ default: m.CreditSuccessPage })))
const PaymentCreditPendingPage = lazy(() => import("./app/payment/credit/pending/page").then(m => ({ default: m.CreditPendingPage })))
const CreditFailedPage = lazy(() => import("./app/payment/credit/failed/page").then(m => ({ default: m.CreditFailedPage })))
const PaystackReturnPage = lazy(() => import("./app/payment/paystack/return/page").then(m => ({ default: m.PaystackReturnPage })))
const PaystackSuccessPage = lazy(() => import("./app/payment/paystack/success/page").then(m => ({ default: m.PaystackSuccessPage })))
const PaystackFailedPage = lazy(() => import("./app/payment/paystack/failed/page").then(m => ({ default: m.PaystackFailedPage })))
const CustomerProfileLayout = lazy(() => import("./app/customer/profile-settings/layout").then(m => ({ default: m.CustomerProfileLayout })))
const AccountSettingsPage = lazy(() => import("./app/customer/profile-settings/settings").then(m => ({ default: m.AccountSettingsPage })))
const CustomerClaimsPage = lazy(() => import("./app/customer/profile-settings/claims").then(m => ({ default: m.CustomerClaimsPage })))
const CustomerCoversPage = lazy(() => import("./app/customer/profile-settings/covers").then(m => ({ default: m.CustomerCoversPage })))
const CustomerPaymentHistoryPage = lazy(() => import("./app/customer/profile-settings/payment-history").then(m => ({ default: m.PaymentHistoryPage })))
const CustomerSingleCustomerCoversPage = lazy(() => import("./app/customer/profile-settings/[id]/cover[id]").then(m => ({ default: m.SingleCoverPage })))


// Auth pages
const AuthLayoutPage = lazy(() => import("./auth/layout"))
const SignInPage = lazy(() => import("./auth/components/signin-page"))
const SignupForm = lazy(() => import("./auth/components/signup-form").then(m => ({ default: m.SignupForm })))
const ForgotPasswordForm = lazy(() => import("./auth/components/forgot-password-form"))
const ResetPasswordForm = lazy(() => import("./auth/components/rest-password-form").then(m => ({ default: m.ResetPasswordForm })))
const OtpVerificationAuthForm = lazy(() => import("./auth/components/otp-verification-form").then(m => ({ default: m.OtpVerificationAuthForm })))



// Admin / Dashboard pages
const DashboardPage = lazy(() => import("./app/dashboard"))
const MembersPage = lazy(() => import("./app/members/page"))
const MemberDetailPage = lazy(() => import("./app/members/[id]/page"))
const MemberNewPage = lazy(() => import("./app/members/new/page"))
const SavingsPage = lazy(() => import("./app/savings/page"))
const SavingAccensureuntDetailPage = lazy(() => import("./app/savings/[id]/page"))
const SavingsProductsPage = lazy(() => import("./app/savings/products/page"))
const LoansPage = lazy(() => import("./app/loans/page"))
const LoanDetailPage = lazy(() => import("./app/loans/[id]/page"))
const LoanApplicationPage = lazy(() => import("./app/loans/apply/page"))
const LoanProductsPage = lazy(() => import("./app/loans/products/page"))
const TransactionsPage = lazy(() => import("./app/transactions/page"))
const ReportsPage = lazy(() => import("./app/reports/page"))
const StaffPage = lazy(() => import("./app/staff/page"))
const StaffDetailPage = lazy(() => import("./app/staff/[id]/page"))
const SettingsPage = lazy(() => import("./app/settings/page"))
const AccountProfilePage = lazy(() => import("./app/admin/account-profile/page").then(m => ({ default: m.AccountProfilePage })))
const OrganizationsPage = lazy(() => import("./app/admin/organizations/page"))
const OrganizationLocationsPage = lazy(() => import("./app/admin/organization-location/page"))
const OrganizationRolesPage = lazy(() => import("./app/admin/organization-roles/page"))
const OrganizationRolesDetailPage = lazy(() => import("./app/admin/organization-roles/[orgLocationId]/page"))
const OrganizationMembersPage = lazy(() => import("./app/admin/organization-members/page"))
const OrganizationMembersDetailPage = lazy(() => import("./app/admin/organization-members/[orgLocationId]/page"))
const GlobalRolesPage = lazy(() => import("./app/admin/system-roles/global/page"))
const SystemRolesPage = lazy(() => import("./app/admin/system-roles/system/page"))
const UsersPage = lazy(() => import("./app/admin/users/page").then(m => ({ default: m.UsersPage })))
const CreditWalletPage = lazy(() => import("./app/admin/credit/wallet/page").then(m => ({ default: m.CreditWalletPage })))
const CreditTransactionsPage = lazy(() => import("./app/admin/credit/transactions/page").then(m => ({ default: m.CreditTransactionsPage })))
const MotorCertificatesPage = lazy(() => import("./app/admin/motor-certificates/page").then(m => ({ default: m.MotorCertificatesPage })))
const CreditApprovalsPage = lazy(() => import("./app/admin/credit/approvals/page").then(m => ({ default: m.CreditApprovalsPage })))
const CreditPendingPage = lazy(() => import("./app/admin/credit/pending/page").then(m => ({ default: m.CreditPendingPage })))
const CreditPendingDetailPage = lazy(() => import("./app/admin/credit/pending/[invoiceId]/page").then(m => ({ default: m.CreditPendingDetailPage })))
const CreditSetupPoolPage = lazy(() => import("./app/admin/credit/setup/pool/page").then(m => ({ default: m.CreditSetupPoolPage })))
const CreditSetupUsersPage = lazy(() => import("./app/admin/credit/setup/users/page").then(m => ({ default: m.CreditSetupUsersPage })))
const CreditSettlementDetailPage = lazy(() => import("./app/admin/credit/settlements/[id]/page").then(m => ({ default: m.CreditSettlementDetailPage })))
const CreditAdjustmentsPage = lazy(() => import("./app/admin/credit/adjustments/page").then(m => ({ default: m.CreditAdjustmentsPage })))
const MotorProductPage = lazy(() => import("./app/admin/product/motor/motor-product/page").then(m => ({ default: m.MotorProductPage })))
const MotorCoverTypePage = lazy(() => import("./app/admin/product/motor/cover_types/page").then(m => ({ default: m.MotorCoverTypePage })))
const MotorCoveringPage = lazy(() => import("./app/admin/product/motor/motor-coving/page").then(m => ({ default: m.MotorCoveringPage })))
const VehicleClassesPage = lazy(() => import("./app/admin/product/motor/vehicle-clases/page").then(m => ({ default: m.VehicleClassesPage })))
const VehicleUsePage = lazy(() => import("./app/admin/product/motor/vehicle-use/page").then(m => ({ default: m.VehicleUsePage })))
const MotorAddonBenefitsPage = lazy(() => import("./app/admin/product/motor/motor-addon-benefits/page").then(m => ({ default: m.MotorAddonBenefitsPage })))
const MotorDetailedBenefitPage = lazy(() => import("./app/admin/product/motor/motor-detailed-benefit/page").then(m => ({ default: m.MotorDetailedBenefitPage })))
const MotorTonangePage = lazy(() => import("./app/admin/product/motor/motor-tonage/page").then(m => ({ default: m.MotorTonangePage })))
const MotorProductRatesPage = lazy(() => import("./app/admin/product/motor/motor-rates/page").then(m => ({ default: m.MotorProductRatesPage })))
const MotorQuotationPage = lazy(() => import("./app/admin/quotations/motor/page").then(m => ({ default: m.MotorQuotationPage })))
const AdminMotorQuotationResultsPage = lazy(() =>
  import("./app/admin/quotations/motor/results/page").then(m => ({
    default: m.AdminMotorQuotationResultsPage,
  }))
)
const AdminMotorQuotationPurchasePage = lazy(() =>
  import("./app/admin/quotations/motor/purchase/page").then(m => ({
    default: m.AdminMotorQuotationPurchasePage,
  }))
)
const AdminMotorQuotationFetchPage = lazy(() =>
  import("./app/admin/quotations/motor/fetch/page").then(m => ({
    default: m.AdminMotorQuotationFetchPage,
  }))
)
const QuotationReportsMotorPage = lazy(() =>
  import("./app/admin/reports/quotations/motor/page").then(m => ({
    default: m.QuotationReportsMotorPage,
  }))
)
const QuotationReportsTravelPage = lazy(() =>
  import("./app/admin/reports/quotations/travel/page").then(m => ({
    default: m.QuotationReportsTravelPage,
  }))
)
const InvoiceReportsMotorPage = lazy(() =>
  import("./app/admin/reports/invoices/motor/page").then(m => ({
    default: m.InvoiceReportsMotorPage,
  }))
)
const ReceiptReportsMotorPage = lazy(() =>
  import("./app/admin/reports/receipts/motor/page").then(m => ({
    default: m.ReceiptReportsMotorPage,
  }))
)
const FinanceParametersIndexPage = lazy(() => import("./app/admin/finance/parameters"))
const FinanceClaimsPage = lazy(() => import("./app/admin/finance/claims"))
const FinanceInvoicesPage = lazy(() => import("./app/admin/finance/invoices"))
const FinancePaymentsPage = lazy(() => import("./app/admin/finance/payments"))

export const router = createBrowserRouter([
  {
    element: <SubdomainGuestGate />,
    children: [

  // Public
  {
    path: EROUTES.LANDING,
    element: (
      <PublicRoute>
        <S><Landingpage /></S>
      </PublicRoute>
    ),
  },
  {
    path: EROUTES.CONTACT_US,
    element:
      <S>
        <ContactUsPage />
      </S>,
  },
  {
    path: EROUTES.PRODUCT_LIST,
    element:
      <S>
        <ProductsListPage />
      </S>,
  },

  // START-USERGENERAL = TRUE
  // Motor / Customer
  {
    path: EPREFIX.CUSTOMER,
    element: (
      <CustomerPublicRoute>
        <S><MotorLandingPage /></S>
      </CustomerPublicRoute>
    ),
    children: [
      {
        path: EROUTES.MOTOR.slice(1),
        element: <S><StepPage /></S>,
      },
    ],
  },


  // My Covers / Customer Account — protected (authenticated only)
  {
    path: `${EPREFIX.CUSTOMER}${EROUTES.PROFILE}`,
    element: (
      <ProtectedRoute>
        <S><CustomerProfileLayout /></S>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        path: "my-covers",
        element: <S><CustomerCoversPage /></S>,
      },
      {
        path: "my-covers/:id",
        element: <S><CustomerSingleCustomerCoversPage /></S>,
      },
      {
        path: "payment-history",
        element: <S><CustomerPaymentHistoryPage /></S>,
      },
      {
        path: "my-claims",
        element: <S><CustomerClaimsPage /></S>,
      },
      {
        path: "account-settings",
        element: <S><AccountSettingsPage /></S>,
      },
    ],
  },

  // marine
  {
    path: EPREFIX.CUSTOMER,
    element: (
      <CustomerPublicRoute>
        <S><MarineLandingPage /></S>
      </CustomerPublicRoute>
    ),
    children: [
      {
        path: EROUTES.MARINE.slice(1),
        element: <S><MarineStepPage /></S>,
      },
    ],
  },

  {
    path: EROUTES.PESAPAL_RETURN,
    element: (
      <CustomerPublicRoute>
        <S><PesapalReturnPage /></S>
      </CustomerPublicRoute>
    ),
  },

  {
    path: EROUTES.PAYSTACK_RETURN,
    element: (
      <CustomerPublicRoute>
        <S><PaystackReturnPage /></S>
      </CustomerPublicRoute>
    ),
  },

  {
    path: "payment",
    element: (
      <CustomerPublicRoute>
        <S><PaymentLayout /></S>
      </CustomerPublicRoute>
    ),
    children: [
      { path: "mpesa/return", element: <S><MpesaReturnPage /></S> },
      { path: "mpesa/success", element: <S><MpesaSuccessPage /></S> },
      { path: "mpesa/failed", element: <S><MpesaFailedPage /></S> },
      { path: "credit/return", element: <S><CreditReturnPage /></S> },
      { path: "credit/success", element: <S><CreditSuccessPage /></S> },
      { path: "credit/pending", element: <S><PaymentCreditPendingPage /></S> },
      { path: "credit/failed", element: <S><CreditFailedPage /></S> },
      { path: "paystack/return", element: <S><PaystackReturnPage /></S> },
      { path: "paystack/success", element: <S><PaystackSuccessPage /></S> },
      { path: "paystack/failed", element: <S><PaystackFailedPage /></S> },
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
            <S>
              <SignInPage />
            </S>
          </PublicRoute>
        ),
      },
      {
        path: EROUTES.SIGNUP.slice(1),
        element: (
          <PublicRoute>
            <S>
              <AuthLayoutPage
                title="Please sign up"
                description="to purchase your cover">
                <SignupForm />
              </AuthLayoutPage>
            </S>
          </PublicRoute>
        ),
      },
      {
        path: EROUTES.FORGOT_PASSWORD.slice(1),
        element: (
          <PublicRoute>
            <S>
              <AuthLayoutPage
                title="Forgot Password"
                description="">
                <ForgotPasswordForm />
              </AuthLayoutPage>
            </S>
          </PublicRoute>
        ),
      },
      {
        path: EROUTES.RESET_PASSWORD.slice(1),
        element: (
          <PublicRoute>
            <S>
              <AuthLayoutPage
                title="Reset Password"
                description="Enter your new password below.">
                <ResetPasswordForm />
              </AuthLayoutPage>
            </S>
          </PublicRoute>
        ),
      },
      {
        path: EROUTES.VERIFY_EMAIL.slice(1),
        element: (
          <PublicRoute>
            <S>
              <AuthLayoutPage
                title="Verify Your Account"
                description="Verification code has been sent to your email. Please enter the code below to verify your account.">
                <OtpVerificationAuthForm />
              </AuthLayoutPage>
            </S>
          </PublicRoute>
        ),
      }
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
        element: <S><DashboardPage /></S>,
      },
      // Members / Policyholders
      {
        path: "members",
        element: (
          <S>
            <AdminModulePage module={MODULES.POLICY}>
              <MembersPage />
            </AdminModulePage>
          </S>
        ),
      },
      {
        path: "members/new",
        element: (
          <S>
            <AdminModulePage module={MODULES.POLICY}>
              <MemberNewPage />
            </AdminModulePage>
          </S>
        ),
      },
      {
        path: "members/:id",
        element: (
          <S>
            <AdminModulePage module={MODULES.POLICY}>
              <MemberDetailPage />
            </AdminModulePage>
          </S>
        ),
      },
      // Savings / Premiums & Claims
      {
        path: "savings",
        element: (
          <S>
            <AdminModulePage module={MODULES.ACCOUNT}>
              <SavingsPage />
            </AdminModulePage>
          </S>
        ),
      },
      {
        path: "savings/products",
        element: (
          <S>
            <AdminModulePage module={MODULES.ACCOUNT}>
              <SavingsProductsPage />
            </AdminModulePage>
          </S>
        ),
      },
      {
        path: "savings/:id",
        element: (
          <S>
            <AdminModulePage module={MODULES.ACCOUNT}>
              <SavingAccensureuntDetailPage />
            </AdminModulePage>
          </S>
        ),
      },
      // Loans / Policies
      {
        path: "loans",
        element: (
          <S>
            <AdminModulePage modules={[...PURCHASE_MOTOR_MODULES]}>
              <LoansPage />
            </AdminModulePage>
          </S>
        ),
      },
      {
        path: "loans/apply",
        element: (
          <S>
            <AdminModulePage modules={[...PURCHASE_MOTOR_MODULES]}>
              <LoanApplicationPage />
            </AdminModulePage>
          </S>
        ),
      },
      {
        path: "loans/products",
        element: (
          <S>
            <AdminModulePage modules={[...PURCHASE_MOTOR_MODULES]}>
              <LoanProductsPage />
            </AdminModulePage>
          </S>
        ),
      },
      {
        path: "loans/:id",
        element: (
          <S>
            <AdminModulePage modules={[...PURCHASE_MOTOR_MODULES]}>
              <LoanDetailPage />
            </AdminModulePage>
          </S>
        ),
      },
      // Transactions / Payments
      {
        path: "transactions",
        element: (
          <S>
            <AdminModulePage module={MODULES.ACCOUNT}>
              <TransactionsPage />
            </AdminModulePage>
          </S>
        ),
      },
      // Reports / Insights
      {
        path: "reports",
        element: (
          <S>
            <AdminModulePage module={MODULES.RBAC}>
              <ReportsPage />
            </AdminModulePage>
          </S>
        ),
      },
      // Staff / Agents
      {
        path: "staff",
        element: (
          <S>
            <AdminModulePage module={MODULES.ROLE}>
              <StaffPage />
            </AdminModulePage>
          </S>
        ),
      },
      {
        path: "staff/:id",
        element: (
          <S>
            <AdminModulePage module={MODULES.ROLE}>
              <StaffDetailPage />
            </AdminModulePage>
          </S>
        ),
      },

      // quotations — motor
      {
        path: "quotations/motor-quotations",
        element: (
          <S>
            <AdminModulePage modules={[...QUOTATION_MOTOR_MODULES]}>
              <MotorQuotationPage />
            </AdminModulePage>
          </S>
        ),
      },
      {
        path: "quotations/motor-quotations/results",
        element: (
          <S>
            <AdminModulePage modules={[...QUOTATION_MOTOR_MODULES]}>
              <AdminMotorQuotationResultsPage />
            </AdminModulePage>
          </S>
        ),
      },
      {
        path: "quotations/motor-quotations/purchase",
        element: (
          <S>
            <AdminModulePage modules={[...QUOTATION_MOTOR_MODULES]}>
              <AdminMotorQuotationPurchasePage />
            </AdminModulePage>
          </S>
        ),
      },
      {
        path: "quotations/motor-quotations/fetch",
        element: (
          <S>
            <AdminModulePage modules={[...QUOTATION_MOTOR_MODULES]}>
              <AdminMotorQuotationFetchPage />
            </AdminModulePage>
          </S>
        ),
      },
      {
        path: "reports/quotations/motor",
        element: (
          <S>
            <AdminModulePage module={MODULES.REPORT_MOTOR_QUOTATION}>
              <QuotationReportsMotorPage />
            </AdminModulePage>
          </S>
        ),
      },
      {
        path: "reports/quotations/travel",
        element: (
          <S>
            <AdminModulePage
              modules={[MODULES.QUOTATION_TRAVEL, MODULES.REPORT_MOTOR_QUOTATION]}
            >
              <QuotationReportsTravelPage />
            </AdminModulePage>
          </S>
        ),
      },
      {
        path: "reports/invoices/motor",
        element: (
          <S>
            <AdminModulePage module={MODULES.REPORT_MOTOR_INVOICE}>
              <InvoiceReportsMotorPage />
            </AdminModulePage>
          </S>
        ),
      },
      {
        path: "reports/receipts/motor",
        element: (
          <S>
            <AdminModulePage module={MODULES.REPORT_MOTOR_RECEIPT}>
              <ReceiptReportsMotorPage />
            </AdminModulePage>
          </S>
        ),
      },
      // products — motor
      {
        path: "products/motor",
        element: (
          <S>
            <AdminModulePage module={MODULES.PRODUCT_MOTOR}>
              <MotorProductPage />
            </AdminModulePage>
          </S>
        ),
      },
      {
        path: "products/motor-rates/:slung",
        element: (
          <S>
            <AdminModulePage module={MODULES.PRODUCT_MOTOR}>
              <MotorProductRatesPage />
            </AdminModulePage>
          </S>
        ),
      },
      {
        path: "products/motor/cover-types",
        element: (
          <S>
            <AdminModulePage module={MODULES.PRODUCT_MOTOR}>
              <MotorCoverTypePage />
            </AdminModulePage>
          </S>
        ),
      },
      {
        path: "products/motor/covering",
        element: (
          <S>
            <AdminModulePage module={MODULES.PRODUCT_MOTOR}>
              <MotorCoveringPage />
            </AdminModulePage>
          </S>
        ),
      },
      {
        path: "products/motor/vehicle-classes",
        element: (
          <S>
            <AdminModulePage module={MODULES.PRODUCT_MOTOR}>
              <VehicleClassesPage />
            </AdminModulePage>
          </S>
        ),
      },
      {
        path: "products/motor/vehicle-use",
        element: (
          <S>
            <AdminModulePage module={MODULES.PRODUCT_MOTOR}>
              <VehicleUsePage />
            </AdminModulePage>
          </S>
        ),
      },
      {
        path: "products/motor/add-on-benefits",
        element: (
          <S>
            <AdminModulePage module={MODULES.PRODUCT_MOTOR}>
              <MotorAddonBenefitsPage />
            </AdminModulePage>
          </S>
        ),
      },
      {
        path: "products/motor/detailed-benefits",
        element: (
          <S>
            <AdminModulePage module={MODULES.PRODUCT_MOTOR}>
              <MotorDetailedBenefitPage />
            </AdminModulePage>
          </S>
        ),
      },
      {
        path: "products/motor/tonage",
        element: (
          <S>
            <AdminModulePage module={MODULES.PRODUCT_MOTOR}>
              <MotorTonangePage />
            </AdminModulePage>
          </S>
        ),
      },

      // Finance
      {
        path: "finance",
        element: <Navigate to={EROUTES.FINANCE_PARAMETERS} replace />,
      },
      {
        path: "finance/parameters",
        element: (
          <S>
            <AdminModulePage module={MODULES.FINANCE}>
              <FinanceParametersIndexPage />
            </AdminModulePage>
          </S>
        ),
      },
      {
        path: "finance/claims",
        element: (
          <S>
            <AdminModulePage module={MODULES.FINANCE}>
              <FinanceClaimsPage />
            </AdminModulePage>
          </S>
        ),
      },
      {
        path: "finance/invoices",
        element: (
          <S>
            <AdminModulePage module={MODULES.FINANCE}>
              <FinanceInvoicesPage />
            </AdminModulePage>
          </S>
        ),
      },
       {
        path: "finance/payments",
        element: (
          <S>
            <AdminModulePage module={MODULES.FINANCE}>
              <FinancePaymentsPage />
            </AdminModulePage>
          </S>
        ),
      },

      // Organizations
      {
        path: "organization",
        element: (
          <S>
            <AdminModulePage module={MODULES.ORGANIZATION}>
              <OrganizationsPage />
            </AdminModulePage>
          </S>
        ),
      },
      {
        path: "organization-location",
        element: (
          <S>
            <AdminModulePage module={MODULES.ORGANIZATION_LOCATION}>
              <OrganizationLocationsPage />
            </AdminModulePage>
          </S>
        ),
      },
      // Organization Roles
      {
        path: "organization-roles",
        element: (
          <S>
            <AdminModulePage module={MODULES.ROLE}>
              <OrganizationRolesPage />
            </AdminModulePage>
          </S>
        ),
      },
      {
        path: "organization-roles/:orgLocationId",
        element: (
          <S>
            <AdminModulePage module={MODULES.ROLE}>
              <OrganizationRolesDetailPage />
            </AdminModulePage>
          </S>
        ),
      },
      // Organization Members (location staff users)
      {
        path: "organization-members",
        element: (
          <S>
            <AdminModulePage module={MODULES.ORGANIZATION_LOCATION_USER}>
              <OrganizationMembersPage />
            </AdminModulePage>
          </S>
        ),
      },
      {
        path: "organization-members/:orgLocationId",
        element: (
          <S>
            <AdminModulePage module={MODULES.ORGANIZATION_LOCATION_USER}>
              <OrganizationMembersDetailPage />
            </AdminModulePage>
          </S>
        ),
      },
      // Global / System roles (RBAC admin)
      {
        path: "global-roles",
        element: (
          <S>
            <AdminModulePage module={MODULES.RBAC}>
              <GlobalRolesPage />
            </AdminModulePage>
          </S>
        ),
      },
      {
        path: "system-roles",
        element: (
          <S>
            <AdminModulePage module={MODULES.RBAC}>
              <SystemRolesPage />
            </AdminModulePage>
          </S>
        ),
      },
      // Users
      {
        path: "users",
        element: (
          <S>
            <AdminModulePage module={MODULES.USER}>
              <UsersPage />
            </AdminModulePage>
          </S>
        ),
      },
      // Settings
      {
        path: "settings",
        element: (
          <S>
            <AdminModulePage modules={[MODULES.SETTINGS_RBAC, MODULES.RBAC]}>
              <SettingsPage />
            </AdminModulePage>
          </S>
        ),
      },
      // Account Profile — any logged-in admin (no module guard)
      {
        path: "account-profile",
        element: (
          <S>
            <AccountProfilePage />
          </S>
        ),
      },
      // Credit & Finance
      {
        path: "credit/wallet",
        element: (
          <S>
            <AdminModulePage module={MODULES.FINANCE_CONTROL} permission="finance-control.mine">
              <CreditWalletPage />
            </AdminModulePage>
          </S>
        ),
      },
      {
        path: "credit/transactions",
        element: (
          <S>
            <AdminModulePage module={MODULES.FINANCE_CONTROL}>
              <CreditTransactionsPage />
            </AdminModulePage>
          </S>
        ),
      },
      {
        path: "motor-certificates",
        element: (
          <S>
            <AdminModulePage module={MODULES.DMVIC_CERTIFICATE}>
              <MotorCertificatesPage />
            </AdminModulePage>
          </S>
        ),
      },
      {
        path: "credit/approvals",
        element: (
          <S>
            <AdminModulePage module={MODULES.FINANCE_CONTROL} permission="finance-control.approve">
              <CreditApprovalsPage />
            </AdminModulePage>
          </S>
        ),
      },
      {
        path: "credit/pending",
        element: (
          <S>
            <AdminModulePage module={MODULES.FINANCE_CONTROL} permission="finance-control.mine">
              <CreditPendingPage />
            </AdminModulePage>
          </S>
        ),
      },
      {
        path: "credit/pending/:invoiceId",
        element: (
          <S>
            <AdminModulePage module={MODULES.FINANCE_CONTROL} permission="finance-control.mine">
              <CreditPendingDetailPage />
            </AdminModulePage>
          </S>
        ),
      },
      {
        path: "credit/setup",
        element: <Navigate to={EROUTES.CREDIT_SETUP_POOL} replace />,
      },
      {
        path: "credit/setup/pool",
        element: (
          <S>
            <AdminModulePage module={MODULES.FINANCE_CONTROL} permission="finance-control.update">
              <CreditSetupPoolPage />
            </AdminModulePage>
          </S>
        ),
      },
      {
        path: "credit/setup/users",
        element: (
          <S>
            <AdminModulePage module={MODULES.FINANCE_CONTROL} permission="finance-control.list">
              <CreditSetupUsersPage />
            </AdminModulePage>
          </S>
        ),
      },
      {
        path: "credit/settlements/:id",
        element: (
          <S>
            <AdminModulePage module={MODULES.FINANCE_CONTROL} permission="finance-control.read">
              <CreditSettlementDetailPage />
            </AdminModulePage>
          </S>
        ),
      },
      {
        path: "credit/adjustments",
        element: (
          <S>
            <AdminModulePage module={MODULES.FINANCE_CONTROL} permission="finance-control.adjust">
              <CreditAdjustmentsPage />
            </AdminModulePage>
          </S>
        ),
      },
    ],
  },
  // END-USERGENERAL = FALSE

  // Fallback
  {
    path: "*",
    element: <Navigate to={EROUTES.LANDING} replace />,
  },
    ],
  },
])
