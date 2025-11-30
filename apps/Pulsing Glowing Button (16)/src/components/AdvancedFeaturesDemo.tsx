import React, { useState } from 'react';
import { FileUploadManager } from './FileUploadManager';
import { NotificationCenter } from './NotificationCenter';
import { ActivityLog } from './ActivityLog';
import { ROIAnalytics } from './ROIAnalytics';
import { MultiUserAssignment } from './MultiUserAssignment';
import { StakeholderManagement } from './StakeholderManagement';
import { ApprovalWorkflowHistory } from './ApprovalWorkflowHistory';
import { AIBudgetSuggestions } from './AIBudgetSuggestions';
import { ReportGenerator } from './ReportGenerator';
import { RoleSelector, ProtectedAction, useRBAC } from './RoleBasedAccess';
import {
  LayoutDashboard,
  Users,
  FileText,
  TrendingUp,
  Sparkles,
  Activity,
  Upload,
  CheckSquare,
  UserCog,
  Crown,
  Lock,
} from 'lucide-react';

type DemoSection =
  | 'overview'
  | 'rbac'
  | 'files'
  | 'notifications'
  | 'activity'
  | 'roi'
  | 'assignments'
  | 'stakeholders'
  | 'workflow'
  | 'ai'
  | 'reports';

type UserRole = 'Admin' | 'EventManager' | 'Finance' | 'Viewer';
type SubscriptionTier = 'free' | 'pro' | 'enterprise' | 'demo';

interface AdvancedFeaturesDemoProps {
  user?: any;
  organization?: any;
  isDemo?: boolean;
  onUpgrade?: () => void;
}

// Upgrade Prompt Component
const UpgradePrompt: React.FC<{ 
  featureName: string; 
  tier: 'Pro' | 'Enterprise';
  onUpgrade?: () => void;
}> = ({ featureName, tier, onUpgrade }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-8">
    <div className="max-w-2xl mx-auto text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <Lock className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">{featureName}</h2>
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
        <Crown className="w-4 h-4" />
        {tier} Feature
      </div>
      <p className="text-gray-600 mb-6">
        This feature is available on our {tier} plan. Upgrade to unlock {featureName.toLowerCase()} and many other advanced capabilities.
      </p>
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">What you'll get with {tier}:</h3>
        <ul className="text-left space-y-2 text-gray-700">
          {tier === 'Pro' ? (
            <>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Unlimited events and budgets</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>File uploads for receipts and invoices</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Advanced approval workflows</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Activity logging and audit trails</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Report generation (PDF, Excel, CSV)</span>
              </li>
            </>
          ) : (
            <>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Everything in Pro, plus:</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>AI-powered budget suggestions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Stakeholder management tools</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Priority support and dedicated account manager</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Custom integrations and API access</span>
              </li>
            </>
          )}
        </ul>
      </div>
      {onUpgrade && (
        <button
          onClick={onUpgrade}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium"
        >
          Upgrade to {tier} Plan
        </button>
      )}
    </div>
  </div>
);

export const AdvancedFeaturesDemo: React.FC<AdvancedFeaturesDemoProps> = ({ 
  user, 
  organization, 
  isDemo = false,
  onUpgrade 
}) => {
  const [activeSection, setActiveSection] = useState<DemoSection>('overview');
  const { userRole } = useRBAC();

  // Determine subscription tier
  const subscriptionTier: SubscriptionTier = isDemo 
    ? 'demo' 
    : (user?.subscription || 'free') as SubscriptionTier;
  
  const isPremiumUser = subscriptionTier === 'pro' || subscriptionTier === 'enterprise';
  const isFreeUser = subscriptionTier === 'free';

  // Define which roles can access each feature
  const allSections = [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: LayoutDashboard,
      roles: ['Admin', 'EventManager', 'Finance', 'Viewer'] as UserRole[],
      tier: 'free' as const,
      description: 'Overview of all advanced features'
    },
    { 
      id: 'rbac', 
      label: 'Role-Based Access', 
      icon: UserCog,
      roles: ['Admin'] as UserRole[],
      tier: 'pro' as const,
      description: 'Admin-only: Manage user roles and permissions'
    },
    { 
      id: 'files', 
      label: 'File Management', 
      icon: Upload,
      roles: ['Admin', 'EventManager', 'Finance'] as UserRole[],
      tier: 'pro' as const,
      description: 'Upload and manage receipts, invoices, contracts'
    },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: Activity,
      roles: ['Admin', 'EventManager', 'Finance', 'Viewer'] as UserRole[],
      tier: 'free' as const,
      description: 'Real-time alerts and updates'
    },
    { 
      id: 'activity', 
      label: 'Activity Log', 
      icon: Activity,
      roles: ['Admin', 'EventManager', 'Finance'] as UserRole[],
      tier: 'pro' as const,
      description: 'Complete audit trail of all actions'
    },
    { 
      id: 'roi', 
      label: 'ROI Analytics', 
      icon: TrendingUp,
      roles: ['Admin', 'EventManager', 'Finance', 'Viewer'] as UserRole[],
      tier: 'free' as const,
      description: 'View ROI metrics and insights'
    },
    { 
      id: 'assignments', 
      label: 'Multi-User Assignment', 
      icon: Users,
      roles: ['Admin', 'EventManager'] as UserRole[],
      tier: 'pro' as const,
      description: 'Assign team members to events'
    },
    { 
      id: 'stakeholders', 
      label: 'Stakeholders', 
      icon: Users,
      roles: ['Admin', 'EventManager'] as UserRole[],
      tier: 'enterprise' as const,
      description: 'Manage external participants and contacts'
    },
    { 
      id: 'workflow', 
      label: 'Approval Workflow', 
      icon: CheckSquare,
      roles: ['Admin', 'EventManager', 'Finance'] as UserRole[],
      tier: 'pro' as const,
      description: 'Track multi-stage approval processes'
    },
    { 
      id: 'ai', 
      label: 'AI Suggestions', 
      icon: Sparkles,
      roles: ['Admin', 'EventManager'] as UserRole[],
      tier: 'enterprise' as const,
      description: 'AI-powered budget recommendations'
    },
    { 
      id: 'reports', 
      label: 'Report Generator', 
      icon: FileText,
      roles: ['Admin', 'EventManager', 'Finance'] as UserRole[],
      tier: 'pro' as const,
      description: 'Generate comprehensive reports'
    },
  ] as const;

  // Filter sections by role
  const sections = allSections.filter(section => 
    section.roles.includes(userRole)
  );

  // Check if user can access a feature based on subscription
  const canAccessFeature = (tier: 'free' | 'pro' | 'enterprise') => {
    if (isDemo) return true; // Demo users can see everything
    if (tier === 'free') return true;
    if (tier === 'pro') return isPremiumUser;
    if (tier === 'enterprise') return subscriptionTier === 'enterprise';
    return false;
  };

  // Get tier badge
  const getTierBadge = (tier: 'free' | 'pro' | 'enterprise') => {
    if (tier === 'free') return null;
    if (tier === 'pro') return (
      <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">PRO</span>
    );
    return (
      <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">ENTERPRISE</span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Subscription Tier Banner */}
      {!isDemo && isFreeUser && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown size={20} />
              <p>
                <strong>Free Tier:</strong> Some advanced features require Pro or Enterprise subscription
              </p>
            </div>
            {onUpgrade && (
              <button
                onClick={onUpgrade}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Upgrade Now
              </button>
            )}
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Advanced Features</h1>
              <p className="text-sm text-gray-600 mt-1">
                {isDemo && 'Demo Mode: Explore all premium features'}
                {!isDemo && isPremiumUser && `${subscriptionTier.toUpperCase()} Plan - Full access to advanced features`}
                {!isDemo && isFreeUser && 'Free Tier - Limited access (upgrade for full features)'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <RoleSelector />
              <NotificationCenter />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-24">
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-1">Features</h3>
                <p className="text-xs text-gray-500">
                  Showing {sections.length} of {allSections.length} features
                </p>
              </div>
              <nav className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const canAccess = canAccessFeature(section.tier);
                  const isLocked = !canAccess && !isDemo;
                  
                  return (
                    <button
                      key={section.id}
                      onClick={() => !isLocked && setActiveSection(section.id as DemoSection)}
                      disabled={isLocked}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeSection === section.id
                          ? 'bg-blue-50 text-blue-700'
                          : isLocked
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium flex-1">{section.label}</span>
                      {isLocked && <Lock className="w-4 h-4" />}
                      {!isLocked && getTierBadge(section.tier)}
                    </button>
                  );
                })}
              </nav>

              {/* Role Restrictions Info */}
              {allSections.length > sections.length && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    <strong>Role Restriction:</strong> {allSections.length - sections.length} feature(s) hidden due to your role ({userRole})
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeSection === 'overview' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
                  <h2 className="text-3xl font-bold mb-2">🎉 Advanced Features Showcase</h2>
                  <p className="text-blue-100 text-lg">
                    Explore the complete feature set based on your comprehensive Prisma schema
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sections.slice(1).map((section) => {
                    const Icon = section.icon;
                    const canAccess = canAccessFeature(section.tier);
                    const isLocked = !canAccess && !isDemo;
                    
                    return (
                      <button
                        key={section.id}
                        onClick={() => !isLocked && setActiveSection(section.id as DemoSection)}
                        disabled={isLocked}
                        className={`bg-white border border-gray-200 rounded-lg p-6 text-left transition-all ${
                          isLocked 
                            ? 'opacity-60 cursor-not-allowed' 
                            : 'hover:shadow-lg hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <Icon className={`w-8 h-8 ${isLocked ? 'text-gray-400' : 'text-blue-600'}`} />
                          {isLocked ? (
                            <Lock className="w-5 h-5 text-gray-400" />
                          ) : (
                            getTierBadge(section.tier)
                          )}
                        </div>
                        <h3 className={`font-semibold mb-2 ${isLocked ? 'text-gray-500' : 'text-gray-900'}`}>
                          {section.label}
                        </h3>
                        <p className={`text-sm ${isLocked ? 'text-gray-400' : 'text-gray-600'}`}>
                          {section.description}
                        </p>
                        {isLocked && (
                          <div className="mt-3 text-xs text-blue-600 font-medium">
                            🔒 Requires {section.tier === 'pro' ? 'Pro' : 'Enterprise'} plan
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Access Control Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-900 mb-2">🔐 Access Control System</h3>
                  <p className="text-blue-800 mb-4">
                    This application implements a comprehensive 4-tier access control system:
                  </p>
                  <div className="space-y-3 text-blue-800">
                    <div className="bg-white rounded p-3">
                      <strong>1. Subscription-Based Access:</strong>
                      <ul className="list-disc list-inside mt-1 ml-2 text-sm">
                        <li><strong>Free:</strong> Overview, Notifications, ROI Analytics (view-only)</li>
                        <li><strong>Pro:</strong> + Files, Activity Log, Workflows, Reports, Assignments</li>
                        <li><strong>Enterprise:</strong> + AI Suggestions, Stakeholder Management</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded p-3">
                      <strong>2. Role-Based Access (RBAC):</strong>
                      <ul className="list-disc list-inside mt-1 ml-2 text-sm">
                        <li><strong>Admin:</strong> Full access to all features</li>
                        <li><strong>EventManager:</strong> Create/edit events, manage budgets, approve expenses</li>
                        <li><strong>Finance:</strong> View + approve expenses, generate reports</li>
                        <li><strong>Viewer:</strong> Read-only access to events and analytics</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded p-3">
                      <strong>3. Organization-Level Isolation:</strong>
                      <p className="text-sm mt-1">Each organization's data is completely isolated - users can only access their own organization's events, budgets, and expenses.</p>
                    </div>
                    <div className="bg-white rounded p-3">
                      <strong>4. Feature-Level Permissions:</strong>
                      <p className="text-sm mt-1">Within each feature, specific actions (create, edit, delete, approve) are controlled by RBAC permissions.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h3 className="font-semibold text-yellow-900 mb-2">📊 Implementation Status</h3>
                  <p className="text-yellow-800 mb-4">
                    <strong>UI: 100% Complete</strong> - All components fully functional and responsive<br/>
                    <strong>Backend: ~35%</strong> - Core features work, advanced features need full database
                  </p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-yellow-900 font-medium">✅ Current (KV Store):</p>
                      <p className="text-sm text-yellow-800">Organizations, Users, Events, Budgets, Expenses, Vendors, Basic Analytics</p>
                    </div>
                    <div>
                      <p className="text-yellow-900 font-medium">⚠️ Limited:</p>
                      <p className="text-sm text-yellow-800">File attachments, Notifications, Activity logs, ROI calculations, Workflows</p>
                    </div>
                    <div>
                      <p className="text-yellow-900 font-medium">🚀 Migration Path:</p>
                      <p className="text-sm text-yellow-800">
                        • <strong>Option A:</strong> Extend KV Store (~70% coverage)<br/>
                        • <strong>Option B:</strong> PostgreSQL + Prisma (100% coverage - recommended for production)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'rbac' && (
              canAccessFeature('pro') || isDemo ? (
              <div className="space-y-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Role-Based Access Control</h2>
                  <p className="text-gray-600 mb-6">
                    Switch between different user roles to see how permissions affect what actions are available.
                  </p>

                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-3">Current Role Settings</h3>
                      <RoleSelector />
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-3">Permission Examples</h3>
                      <div className="space-y-3">
                        <ProtectedAction permission="event:create">
                          <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg">
                            ✅ Create Event (Allowed)
                          </button>
                        </ProtectedAction>
                        
                        <ProtectedAction 
                          permission="event:delete"
                          fallback={
                            <button className="w-full px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed">
                              ❌ Delete Event (Permission Denied)
                            </button>
                          }
                        >
                          <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg">
                            ✅ Delete Event (Allowed)
                          </button>
                        </ProtectedAction>

                        <ProtectedAction 
                          permission="expense:approve"
                          fallback={
                            <button className="w-full px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed">
                              ❌ Approve Expenses (Permission Denied)
                            </button>
                          }
                        >
                          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg">
                            ✅ Approve Expenses (Allowed)
                          </button>
                        </ProtectedAction>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">Role Permissions Matrix</h4>
                      <div className="text-sm text-blue-800 space-y-1">
                        <p><strong>Admin:</strong> All permissions (*)</p>
                        <p><strong>EventManager:</strong> Create, edit, delete events; manage budgets; approve expenses</p>
                        <p><strong>Finance:</strong> View events/budgets; approve expenses; generate reports</p>
                        <p><strong>Viewer:</strong> View-only access to events, budgets, and expenses</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              ) : (
                <UpgradePrompt 
                  featureName="Role-Based Access Control" 
                  tier="Pro"
                  onUpgrade={onUpgrade}
                />
              )
            )}

            {activeSection === 'files' && (
              canAccessFeature('pro') || isDemo ? (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">File Upload Manager</h2>
                  <p className="text-gray-600 mb-6">
                    Upload receipts, invoices, contracts, and other documents. Files can be linked to events, budget items, or reports.
                  </p>
                  <FileUploadManager eventId="evt-123" />
                </div>
              ) : (
                <UpgradePrompt featureName="File Upload Manager" tier="Pro" onUpgrade={onUpgrade} />
              )
            )}

            {activeSection === 'notifications' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Notification System</h2>
                <p className="text-gray-600 mb-6">
                  Click the bell icon in the top right to view the notification center. Notifications include expense approvals,
                  budget alerts, event assignments, and more.
                </p>
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <p className="text-gray-600">Click the bell icon (🔔) in the top navigation bar to open the Notification Center</p>
                </div>
              </div>
            )}

            {activeSection === 'activity' && (
              canAccessFeature('pro') || isDemo ? (
                <div>
                  <ActivityLog eventId="evt-123" />
                </div>
              ) : (
                <UpgradePrompt featureName="Activity Log" tier="Pro" onUpgrade={onUpgrade} />
              )
            )}

            {activeSection === 'roi' && (
              <div>
                <ROIAnalytics eventId="evt-123" />
              </div>
            )}

            {activeSection === 'assignments' && (
              canAccessFeature('pro') || isDemo ? (
                <div>
                  <MultiUserAssignment eventId="evt-123" eventName="Annual Tech Summit 2024" />
                </div>
              ) : (
                <UpgradePrompt featureName="Multi-User Assignment" tier="Pro" onUpgrade={onUpgrade} />
              )
            )}

            {activeSection === 'stakeholders' && (
              canAccessFeature('enterprise') || isDemo ? (
                <div>
                  <StakeholderManagement eventId="evt-123" />
                </div>
              ) : (
                <UpgradePrompt featureName="Stakeholder Management" tier="Enterprise" onUpgrade={onUpgrade} />
              )
            )}

            {activeSection === 'workflow' && (
              canAccessFeature('pro') || isDemo ? (
                <div>
                  <ApprovalWorkflowHistory
                    expenseId="exp-123"
                    expenseName="Elite Catering Services - Annual Summit"
                    amount={2500}
                  />
                </div>
              ) : (
                <UpgradePrompt featureName="Approval Workflow History" tier="Pro" onUpgrade={onUpgrade} />
              )
            )}

            {activeSection === 'ai' && (
              canAccessFeature('enterprise') || isDemo ? (
                <div>
                  <AIBudgetSuggestions eventId="evt-123" eventType="Conference" attendees={450} />
                </div>
              ) : (
                <UpgradePrompt featureName="AI Budget Suggestions" tier="Enterprise" onUpgrade={onUpgrade} />
              )
            )}

            {activeSection === 'reports' && (
              canAccessFeature('pro') || isDemo ? (
                <div>
                  <ReportGenerator />
                </div>
              ) : (
                <UpgradePrompt featureName="Report Generator" tier="Pro" onUpgrade={onUpgrade} />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
