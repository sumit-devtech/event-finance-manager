
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.OrganizationScalarFieldEnum = {
  id: 'id',
  name: 'name',
  industry: 'industry',
  logoUrl: 'logoUrl',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  fullName: 'fullName',
  email: 'email',
  role: 'role',
  passwordHash: 'passwordHash',
  isActive: 'isActive',
  emailVerified: 'emailVerified',
  emailVerificationToken: 'emailVerificationToken',
  emailVerificationExpires: 'emailVerificationExpires',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SubscriptionScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  planName: 'planName',
  billingCycle: 'billingCycle',
  status: 'status',
  currentPeriodStart: 'currentPeriodStart',
  currentPeriodEnd: 'currentPeriodEnd',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SubscriptionHistoryScalarFieldEnum = {
  id: 'id',
  subscriptionId: 'subscriptionId',
  action: 'action',
  oldValue: 'oldValue',
  newValue: 'newValue',
  changedBy: 'changedBy',
  changedAt: 'changedAt'
};

exports.Prisma.EventScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  name: 'name',
  location: 'location',
  venue: 'venue',
  startDate: 'startDate',
  endDate: 'endDate',
  eventType: 'eventType',
  type: 'type',
  description: 'description',
  status: 'status',
  attendees: 'attendees',
  budget: 'budget',
  organizer: 'organizer',
  client: 'client',
  createdBy: 'createdBy',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EventAssignmentScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  eventId: 'eventId',
  role: 'role',
  assignedAt: 'assignedAt'
};

exports.Prisma.EventStakeholderScalarFieldEnum = {
  id: 'id',
  eventId: 'eventId',
  name: 'name',
  role: 'role',
  email: 'email',
  phone: 'phone',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.VendorScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  name: 'name',
  serviceType: 'serviceType',
  contactPerson: 'contactPerson',
  email: 'email',
  phone: 'phone',
  gstNumber: 'gstNumber',
  rating: 'rating',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.VendorEventScalarFieldEnum = {
  id: 'id',
  vendorId: 'vendorId',
  eventId: 'eventId',
  assignedAt: 'assignedAt'
};

exports.Prisma.StrategicGoalScalarFieldEnum = {
  id: 'id',
  eventId: 'eventId',
  title: 'title',
  description: 'description',
  targetValue: 'targetValue',
  currentValue: 'currentValue',
  unit: 'unit',
  deadline: 'deadline',
  status: 'status',
  priority: 'priority',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BudgetItemScalarFieldEnum = {
  id: 'id',
  eventId: 'eventId',
  category: 'category',
  subcategory: 'subcategory',
  description: 'description',
  vendor: 'vendor',
  vendorId: 'vendorId',
  estimatedCost: 'estimatedCost',
  actualCost: 'actualCost',
  status: 'status',
  notes: 'notes',
  assignedUserId: 'assignedUserId',
  strategicGoalId: 'strategicGoalId',
  lastEditedBy: 'lastEditedBy',
  lastEditedAt: 'lastEditedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ExpenseScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  eventId: 'eventId',
  category: 'category',
  budgetItemId: 'budgetItemId',
  vendor: 'vendor',
  vendorId: 'vendorId',
  title: 'title',
  amount: 'amount',
  description: 'description',
  status: 'status',
  createdBy: 'createdBy',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ApprovalWorkflowScalarFieldEnum = {
  id: 'id',
  expenseId: 'expenseId',
  approverId: 'approverId',
  action: 'action',
  comments: 'comments',
  actionAt: 'actionAt'
};

exports.Prisma.InsightScalarFieldEnum = {
  id: 'id',
  eventId: 'eventId',
  insightType: 'insightType',
  data: 'data',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ROIMetricsScalarFieldEnum = {
  id: 'id',
  eventId: 'eventId',
  totalBudget: 'totalBudget',
  actualSpend: 'actualSpend',
  leadsGenerated: 'leadsGenerated',
  conversions: 'conversions',
  revenueGenerated: 'revenueGenerated',
  roiPercent: 'roiPercent',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CRMSyncScalarFieldEnum = {
  id: 'id',
  eventId: 'eventId',
  crmSystem: 'crmSystem',
  syncStatus: 'syncStatus',
  lastSyncedAt: 'lastSyncedAt',
  data: 'data',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ReportScalarFieldEnum = {
  id: 'id',
  eventId: 'eventId',
  reportType: 'reportType',
  createdBy: 'createdBy',
  createdAt: 'createdAt'
};

exports.Prisma.FileScalarFieldEnum = {
  id: 'id',
  eventId: 'eventId',
  budgetItemId: 'budgetItemId',
  expenseId: 'expenseId',
  reportId: 'reportId',
  filename: 'filename',
  path: 'path',
  mimeType: 'mimeType',
  size: 'size',
  uploadedAt: 'uploadedAt',
  uploadedBy: 'uploadedBy'
};

exports.Prisma.NoteScalarFieldEnum = {
  id: 'id',
  eventId: 'eventId',
  content: 'content',
  tags: 'tags',
  createdBy: 'createdBy',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  userId: 'userId',
  type: 'type',
  title: 'title',
  message: 'message',
  read: 'read',
  metadata: 'metadata',
  createdAt: 'createdAt',
  readAt: 'readAt'
};

exports.Prisma.ActivityLogScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  userId: 'userId',
  eventId: 'eventId',
  action: 'action',
  details: 'details',
  createdAt: 'createdAt'
};

exports.Prisma.AiBudgetSuggestionScalarFieldEnum = {
  id: 'id',
  eventId: 'eventId',
  category: 'category',
  description: 'description',
  suggestedCost: 'suggestedCost',
  reasoning: 'reasoning',
  confidence: 'confidence',
  accepted: 'accepted',
  createdAt: 'createdAt'
};

exports.Prisma.DashboardMetricsScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  totalBudget: 'totalBudget',
  totalExpenses: 'totalExpenses',
  pendingApprovals: 'pendingApprovals',
  overBudgetEvents: 'overBudgetEvents',
  upcomingEvents: 'upcomingEvents',
  recentEvents: 'recentEvents',
  chartsJson: 'chartsJson',
  statsJson: 'statsJson',
  lastComputedAt: 'lastComputedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EventMetricsScalarFieldEnum = {
  id: 'id',
  eventId: 'eventId',
  organizationId: 'organizationId',
  totalBudget: 'totalBudget',
  totalSpent: 'totalSpent',
  totalEstimated: 'totalEstimated',
  totalActual: 'totalActual',
  variance: 'variance',
  variancePercentage: 'variancePercentage',
  isOverBudget: 'isOverBudget',
  totalsByCategory: 'totalsByCategory',
  pendingExpensesCount: 'pendingExpensesCount',
  approvedExpensesCount: 'approvedExpensesCount',
  rejectedExpensesCount: 'rejectedExpensesCount',
  budgetItemsCount: 'budgetItemsCount',
  lastComputedAt: 'lastComputedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.VendorMetricsScalarFieldEnum = {
  id: 'id',
  vendorId: 'vendorId',
  organizationId: 'organizationId',
  totalContracts: 'totalContracts',
  totalSpent: 'totalSpent',
  eventsCount: 'eventsCount',
  lastContractDate: 'lastContractDate',
  lastComputedAt: 'lastComputedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.UserRole = exports.$Enums.UserRole = {
  Admin: 'Admin',
  EventManager: 'EventManager',
  Finance: 'Finance',
  Viewer: 'Viewer'
};

exports.BillingCycle = exports.$Enums.BillingCycle = {
  Monthly: 'Monthly',
  Yearly: 'Yearly'
};

exports.SubscriptionStatus = exports.$Enums.SubscriptionStatus = {
  Active: 'Active',
  Cancelled: 'Cancelled',
  Expired: 'Expired'
};

exports.EventStatus = exports.$Enums.EventStatus = {
  Planning: 'Planning',
  Active: 'Active',
  Completed: 'Completed',
  Cancelled: 'Cancelled'
};

exports.BudgetItemCategory = exports.$Enums.BudgetItemCategory = {
  Venue: 'Venue',
  Catering: 'Catering',
  Marketing: 'Marketing',
  Logistics: 'Logistics',
  Entertainment: 'Entertainment',
  StaffTravel: 'StaffTravel',
  Technology: 'Technology',
  Miscellaneous: 'Miscellaneous'
};

exports.BudgetItemStatus = exports.$Enums.BudgetItemStatus = {
  Pending: 'Pending',
  Approved: 'Approved',
  Closed: 'Closed'
};

exports.ExpenseStatus = exports.$Enums.ExpenseStatus = {
  Pending: 'Pending',
  Approved: 'Approved',
  Rejected: 'Rejected'
};

exports.NotificationType = exports.$Enums.NotificationType = {
  Info: 'Info',
  Warning: 'Warning',
  Error: 'Error',
  Success: 'Success'
};

exports.Prisma.ModelName = {
  Organization: 'Organization',
  User: 'User',
  Subscription: 'Subscription',
  SubscriptionHistory: 'SubscriptionHistory',
  Event: 'Event',
  EventAssignment: 'EventAssignment',
  EventStakeholder: 'EventStakeholder',
  Vendor: 'Vendor',
  VendorEvent: 'VendorEvent',
  StrategicGoal: 'StrategicGoal',
  BudgetItem: 'BudgetItem',
  Expense: 'Expense',
  ApprovalWorkflow: 'ApprovalWorkflow',
  Insight: 'Insight',
  ROIMetrics: 'ROIMetrics',
  CRMSync: 'CRMSync',
  Report: 'Report',
  File: 'File',
  Note: 'Note',
  Notification: 'Notification',
  ActivityLog: 'ActivityLog',
  AiBudgetSuggestion: 'AiBudgetSuggestion',
  DashboardMetrics: 'DashboardMetrics',
  EventMetrics: 'EventMetrics',
  VendorMetrics: 'VendorMetrics'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
