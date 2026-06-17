/* eslint-disable react-refresh/only-export-components */
// routes.tsx
import { lazy, Suspense } from "react"
import { createBrowserRouter, Navigate } from "react-router-dom"
import { EPREFIX, EROUTES } from "./utils/enums"
import { ProtectedRoute, PublicRoute, CustomerPublicRoute } from "./hooks/hooks"
import Layout from "./Layout"

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
const CustomerProfileLayout = lazy(() => import("./app/customer/profile-settings/layout").then(m => ({ default: m.CustomerProfileLayout })))
const AccountSettingsPage = lazy(() => import("./app/customer/profile-settings/settings").then(m => ({ default: m.AccountSettingsPage })))
const CustomerClaimsPage = lazy(() => import("./app/customer/profile-settings/claims").then(m => ({ default: m.CustomerClaimsPage })))
const CustomerCoversPage = lazy(() => import("./app/customer/profile-settings/covers").then(m => ({ default: m.CustomerCoversPage })))
const CustomerPaymentHistoryPage = lazy(() => import("./app/customer/profile-settings/payment-history").then(m => ({ default: m.PaymentHistoryPage })))
const CustomerSingleCustomerCoversPage = lazy(() => import("./app/customer/profile-settings/[id]/cover[id]").then(m => ({ default: m.SingleCoverPage })))


// Auth pages
const AuthLayoutPage = lazy(() => import("./auth/layout"))
const LoginForm = lazy(() => import("./auth/components/login-form").then(m => ({ default: m.LoginForm })))
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
const OrganizationsPage = lazy(() => import("./app/admin/organizations/page"))
const OrganizationLocationsPage = lazy(() => import("./app/admin/organization-location/page"))
const UsersPage = lazy(() => import("./app/admin/users/page").then(m => ({ default: m.UsersPage })))
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

export const router = createBrowserRouter([

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
              <AuthLayoutPage
                title="Please sign in"
                description="to purchase your cover">
                <LoginForm />
              </AuthLayoutPage>
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
                title="Please or register"
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
      // Members
      {
        path: "members",
        element: <S><MembersPage /></S>,
      },
      {
        path: "members/new",
        element: <S><MemberNewPage /></S>,
      },
      {
        path: "members/:id",
        element: <S><MemberDetailPage /></S>,
      },
      // Savings
      {
        path: "savings",
        element: <S><SavingsPage /></S>,
      },
      {
        path: "savings/products",
        element: <S><SavingsProductsPage /></S>,
      },
      {
        path: "savings/:id",
        element: <S><SavingAccensureuntDetailPage /></S>,
      },
      // Loans
      {
        path: "loans",
        element: <S><LoansPage /></S>,
      },
      {
        path: "loans/apply",
        element: <S><LoanApplicationPage /></S>,
      },
      {
        path: "loans/products",
        element: <S><LoanProductsPage /></S>,
      },
      {
        path: "loans/:id",
        element: <S><LoanDetailPage /></S>,
      },
      // Transactions
      {
        path: "transactions",
        element: <S><TransactionsPage /></S>,
      },
      // Reports
      {
        path: "reports",
        element: <S><ReportsPage /></S>,
      },
      // Staff
      {
        path: "staff",
        element: <S><StaffPage /></S>,
      },
      {
        path: "staff",
        element: <S><StaffPage /></S>,
      },
      {
        path: "staff/:id",
        element: <S><StaffDetailPage /></S>,
      },

      // quotations
      // motor
      {
        path: "quotations/motor-quotations",
        element: <S><MotorQuotationPage /></S>,
      },
      {
        path: "quotations/motor-quotations/results",
        element: <S><AdminMotorQuotationResultsPage /></S>,
      },
      {
        path: "quotations/motor-quotations/purchase",
        element: <S><AdminMotorQuotationPurchasePage /></S>,
      },
      // products
      // motor
      {
        path: "products/motor",
        element: <S><MotorProductPage /></S>,
      },
      {
        path: "products/motor-rates/:slung",
        element: <S><MotorProductRatesPage /></S>,
      },
      {
        path: "products/motor/cover-types",
        element: <S><MotorCoverTypePage /></S>,
      },
      {
        path: "products/motor/covering",
        element: <S><MotorCoveringPage /></S>,
      },
      {
        path: "products/motor/vehicle-classes",
        element: <S><VehicleClassesPage /></S>,
      },
      {
        path: "products/motor/vehicle-use",
        element: <S><VehicleUsePage /></S>,
      },
      {
        path: "products/motor/add-on-benefits",
        element: <S><MotorAddonBenefitsPage /></S>,
      },
      {
        path: "products/motor/detailed-benefits",
        element: <S><MotorDetailedBenefitPage /></S>,
      },
      {
        path: "products/motor/tonage",
        element: <S><MotorTonangePage /></S>,
      },

      // Organizations
      {
        path: "organization",
        element: <S><OrganizationsPage /></S>,
      },
      {
        path: "organization-location",
        element: <S><OrganizationLocationsPage /></S>,
      },
      // Users
      {
        path: "users",
        element: <S><UsersPage /></S>,
      },
      // Settings
      {
        path: "settings",
        element: <S><SettingsPage /></S>,
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
