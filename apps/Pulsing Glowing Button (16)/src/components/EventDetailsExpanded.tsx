import { useState } from 'react';
import { 
  Calendar, MapPin, Users, DollarSign, CheckCircle, Clock, 
  TrendingUp, AlertCircle, FileText, X 
} from './Icons';
import BudgetManager from './BudgetManager';
import ExpenseTracker from './ExpenseTracker';
import TeamAssignments from './TeamAssignments';
import StakeholderManager from './StakeholderManager';
import { AIBudgetSuggestions } from './AIBudgetSuggestions';
import ROIDashboard from './ROIDashboard';
import InsightsPanel from './InsightsPanel';

interface EventDetailsExpandedProps {
  event: any;
  organization: any;
  onClose: () => void;
  onUpdate: (data: any) => Promise<void>;
}

export default function EventDetailsExpanded({
  event,
  organization,
  onClose,
  onUpdate,
}: EventDetailsExpandedProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'budget', label: 'Budget', icon: DollarSign },
    { id: 'expenses', label: 'Expenses', icon: CheckCircle },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'stakeholders', label: 'Stakeholders', icon: Users },
    { id: 'ai-suggestions', label: 'AI Suggestions', icon: TrendingUp },
    { id: 'roi', label: 'ROI Metrics', icon: TrendingUp },
    { id: 'insights', label: 'Insights', icon: AlertCircle },
  ];

  const statusColors: any = {
    planning: 'bg-blue-100 text-blue-700',
    active: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const handleStatusChange = async (newStatus: string) => {
    await onUpdate({ status: newStatus });
  };

  const budgetUtilization = event.budget > 0 ? (event.spent / event.budget) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl max-w-7xl w-full my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="mb-2">{event.name}</h2>
              <p className="text-blue-100">{event.type} Event</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all border-2 border-blue-400">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={20} className="text-white" />
                <p className="text-white text-xs uppercase tracking-wide opacity-90">Total Budget</p>
              </div>
              <p className="text-white text-3xl mt-1" style={{ fontWeight: '700' }}>${event.budget?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all border-2 border-purple-400">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={20} className="text-white" />
                <p className="text-white text-xs uppercase tracking-wide opacity-90">Total Spent</p>
              </div>
              <p className="text-white text-3xl mt-1" style={{ fontWeight: '700' }}>${event.spent?.toLocaleString() || 0}</p>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 bg-white bg-opacity-30 rounded-full h-2">
                  <div 
                    className="bg-white rounded-full h-2 transition-all shadow-sm"
                    style={{ width: `${Math.min((event.spent / event.budget) * 100, 100)}%` }}
                  ></div>
                </div>
                <span className="text-xs text-white" style={{ fontWeight: '600' }}>
                  {((event.spent / event.budget) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all border-2 border-indigo-400">
              <div className="flex items-center gap-2 mb-2">
                <Users size={20} className="text-white" />
                <p className="text-white text-xs uppercase tracking-wide opacity-90">Attendees</p>
              </div>
              <p className="text-white text-3xl mt-1" style={{ fontWeight: '700' }}>{event.attendees?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all border-2 border-pink-400">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={20} className="text-white" />
                <p className="text-white text-xs uppercase tracking-wide opacity-90">Status</p>
              </div>
              <select
                value={event.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="bg-white text-gray-900 px-4 py-2 rounded-lg mt-1 w-full cursor-pointer hover:bg-gray-50 transition-colors shadow-md"
                style={{ fontWeight: '600' }}
              >
                <option value="planning">📋 Planning</option>
                <option value="active">✅ Active</option>
                <option value="completed">🎉 Completed</option>
                <option value="cancelled">❌ Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="relative">
            {/* Scroll indicator */}
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none z-10"></div>
            
            <div className="flex items-center gap-2 overflow-x-auto px-6 pb-1" style={{ scrollbarWidth: 'thin' }}>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </div>
            
            {/* Scroll hint text */}
            <div className="text-xs text-gray-400 text-center pb-1 md:hidden">
              ← Scroll for more tabs →
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[600px] overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Event Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="mb-4">Event Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-gray-700">
                      <Calendar size={20} className="text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Date</p>
                        <p>{new Date(event.date).toLocaleDateString()}</p>
                        {event.endDate && ` - ${new Date(event.endDate).toLocaleDateString()}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <MapPin size={20} className="text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p>{event.location}</p>
                        {event.venue && <p className="text-sm text-gray-600">{event.venue}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Users size={20} className="text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Expected Attendees</p>
                        <p>{event.attendees}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4">Budget Overview</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Budget</span>
                      <span className="text-xl">${event.budget?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Spent</span>
                      <span className="text-xl">${event.spent?.toLocaleString() || 0}</span>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600">Utilization</span>
                        <span className="text-sm">{budgetUtilization.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            budgetUtilization > 90
                              ? 'bg-red-500'
                              : budgetUtilization > 75
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {event.description && (
                <div>
                  <h3 className="mb-2">Description</h3>
                  <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{event.description}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'budget' && (
            <BudgetManager event={event} organization={organization} />
          )}

          {activeTab === 'expenses' && (
            <ExpenseTracker event={event} organization={organization} />
          )}

          {activeTab === 'team' && (
            <TeamAssignments
              eventId={event.id}
              organizationMembers={organization?.members || []}
              onAssign={async (userId, role) => {
                console.log('Assign user:', userId, role);
              }}
              onRemove={async (assignmentId) => {
                console.log('Remove assignment:', assignmentId);
              }}
            />
          )}

          {activeTab === 'stakeholders' && (
            <StakeholderManager
              eventId={event.id}
              onAdd={async (data) => {
                console.log('Add stakeholder:', data);
              }}
              onUpdate={async (id, data) => {
                console.log('Update stakeholder:', id, data);
              }}
              onDelete={async (id) => {
                console.log('Delete stakeholder:', id);
              }}
            />
          )}

          {activeTab === 'ai-suggestions' && (
            <AIBudgetSuggestions
              eventType={event.type}
              attendees={event.attendees}
              location={event.location}
              eventId={event.id}
              budgetId="current-budget-id"
              onAccept={(suggestion) => {
                console.log('Accept suggestion:', suggestion);
              }}
              onReject={(suggestionId) => {
                console.log('Reject suggestion:', suggestionId);
              }}
            />
          )}

          {activeTab === 'roi' && (
            <ROIDashboard
              event={event}
              onUpdateROIData={async (data) => {
                await onUpdate(data);
              }}
            />
          )}

          {activeTab === 'insights' && (
            <InsightsPanel
              eventId={event.id}
              onDismiss={(insightId) => {
                console.log('Dismiss insight:', insightId);
              }}
            />
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 p-6 rounded-b-lg flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Last updated: {new Date(event.updatedAt || event.createdAt).toLocaleString()}
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
