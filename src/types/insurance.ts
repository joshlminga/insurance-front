// ============================================
// Accensure Management System - Type Definitions
// ============================================

// Enums
export type PolicyholderStatus = 'pending' | 'approved' | 'active' | 'suspended' | 'inactive';
export type PolicyStatus = 'submitted' | 'under_review' | 'approved' | 'disbursed' | 'repaying' | 'completed' | 'defaulted' | 'rejected';
export type TransactionType = 'deposit' | 'withdrawal' | 'loan_disbursement' | 'loan_repayment' | 'interest' | 'fee' | 'penalty' | 'premium_payment' | 'claim_payout';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'reversed';
export type UserRole = 'admin' | 'manager' | 'underwriter' | 'accountant' | 'agent' | 'client';
export type NotificationType = 'info' | 'warning' | 'success' | 'error';
export type AccountType = 'premium_account' | 'investment_account' | 'savings_account' | 'shares';

// Base interfaces
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Policyholder/User
export interface Policyholder extends BaseEntity {
  memberId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idNumber: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  city: string;
  status: PolicyholderStatus;
  avatar?: string;
  kycVerified: boolean;
  kycDocuments?: KYCDocument[];
  joinDate: string;
  totalShares: number;
  totalSavings: number;
  activeLoans: number;
  branch?: string;
}

export interface KYCDocument {
  id: string;
  type: 'national_id' | 'passport' | 'driving_license' | 'utility_bill';
  documentNumber: string;
  documentUrl: string;
  verified: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
}

// Staff/Agent
export interface Staff extends BaseEntity {
  staffId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  department: string;
  branch: string;
  isActive: boolean;
  avatar?: string;
  permissions: string[];
  lastLogin?: string;
}

// Premium Account
export interface PremiumAccount extends BaseEntity {
  accountNumber: string;
  memberId: string;
  memberName: string;
  accountType: AccountType;
  balance: number;
  availableBalance: number;
  interestRate: number;
  interestEarned: number;
  minimumBalance: number;
  isActive: boolean;
  lastTransactionDate?: string;
}

// Insurance Product
export interface InsuranceProduct extends BaseEntity {
  name: string;
  code: string;
  description: string;
  accountType: AccountType;
  interestRate: number;
  minimumBalance: number;
  minimumDeposit: number;
  withdrawalLimit?: number;
  withdrawalFee?: number;
  isActive: boolean;
}

// Policy Product (Plan)
export interface PolicyProduct extends BaseEntity {
  name: string;
  code: string;
  description: string;
  interestRate: number;
  interestType: 'flat' | 'reducing_balance';
  minAmount: number;
  maxAmount: number;
  minTenure: number; // months
  maxTenure: number; // months
  processingFee: number;
  penaltyRate: number;
  gracePeriod: number; // days
  requiresGuarantor: boolean;
  maxGuarantors: number;
  eligibilityRules: string[];
  isActive: boolean;
}

// Policy Application
export interface PolicyApplication extends BaseEntity {
  loanId: string;
  memberId: string;
  memberName: string;
  memberAvatar?: string;
  productId: string;
  productName: string;
  amount: number;
  tenure: number; // months
  interestRate: number;
  purpose: string;
  status: PolicyStatus;
  applicationDate: string;
  approvalDate?: string;
  disbursementDate?: string;
  expectedCompletionDate?: string;
  approvedBy?: string;
  disbursedAmount?: number;
  totalRepayable: number;
  totalRepaid: number;
  outstandingBalance: number;
  nextPaymentDate?: string;
  nextPaymentAmount?: number;
  guarantors?: Guarantor[];
  documents?: PolicyDocument[];
  repaymentSchedule?: PaymentSchedule[];
}

export interface Guarantor {
  id: string;
  memberId: string;
  memberName: string;
  phone: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
}

export interface PolicyDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
}

export interface PaymentSchedule {
  id: string;
  dueDate: string;
  principal: number;
  interest: number;
  totalAmount: number;
  paidAmount: number;
  status: 'pending' | 'paid' | 'partial' | 'overdue';
  paidDate?: string;
}

// Transaction
export interface Transaction extends BaseEntity {
  transactionId: string;
  memberId: string;
  memberName: string;
  accountId?: string;
  accountNumber?: string;
  loanId?: string;
  type: TransactionType;
  amount: number;
  fee?: number;
  balanceBefore: number;
  balanceAfter: number;
  status: TransactionStatus;
  description: string;
  reference: string;
  paymentMethod: 'mpesa' | 'bank' | 'cash' | 'system' | 'card';
  mpesaReference?: string;
  processedBy?: string;
  processedAt?: string;
}

// Notification
export interface Notification extends BaseEntity {
  title: string;
  message: string;
  type: NotificationType;
  recipientId?: string;
  recipientType: 'member' | 'staff' | 'all';
  isRead: boolean;
  readAt?: string;
  channel: 'in_app' | 'sms' | 'email' | 'all';
  sentAt?: string;
}

// Branch/Office
export interface Office extends BaseEntity {
  name: string;
  code: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  manager?: string;
  isActive: boolean;
  memberCount: number;
  totalDeposits: number;
  totalLoans: number;
}

// Dashboard Stats
export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  pendingApplications: number;
  totalSavings: number;
  totalLoans: number;
  activeLoans: number;
  loansDisbursedThisMonth: number;
  depositsThisMonth: number;
  withdrawalsThisMonth: number;
  defaultRate: number;
  memberGrowth: number;
  savingsGrowth: number;
}

// Chart Data
export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

// Table Column Definition
export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
  className?: string;
}

// Pagination
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// Filter/Search
export interface FilterState {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  [key: string]: string | undefined;
}

// API Response
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationState;
  success: boolean;
}

// Settings
export interface AccensureSettings {
  name: string;
  logo?: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
  fiscalYearStart: string;
  mpesaEnabled: boolean;
  smsEnabled: boolean;
  emailEnabled: boolean;
  interestComputationDay: number;
  interestPostingDay: number;
}

// Audit Log
export interface AuditLog extends BaseEntity {
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
}

// Report
export interface Report {
  id: string;
  name: string;
  description: string;
  category: 'members' | 'loans' | 'savings' | 'transactions' | 'financial';
  generatedAt?: string;
  parameters?: Record<string, unknown>;
}
