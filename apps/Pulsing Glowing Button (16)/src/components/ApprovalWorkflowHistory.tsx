import React from 'react';
import { CheckCircle, XCircle, Clock, MessageSquare, User } from 'lucide-react';

interface WorkflowAction {
  id: string;
  expenseId: string;
  approverId: string;
  approverName: string;
  action: 'approved' | 'rejected' | 'pending';
  comments: string;
  actionAt: string;
}

interface ApprovalWorkflowHistoryProps {
  expenseId: string;
  expenseName: string;
  amount: number;
}

export const ApprovalWorkflowHistory: React.FC<ApprovalWorkflowHistoryProps> = ({ expenseId, expenseName, amount }) => {
  const workflowHistory: WorkflowAction[] = [
    {
      id: '1',
      expenseId,
      approverId: 'user1',
      approverName: 'Sarah Johnson',
      action: 'approved',
      comments: 'Budget allocation confirmed. Vendor invoice verified.',
      actionAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: '2',
      expenseId,
      approverId: 'user2',
      approverName: 'Michael Chen',
      action: 'approved',
      comments: 'Finance team approved. All documentation is in order.',
      actionAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
  ];

  const currentStatus = workflowHistory.length > 0 ? workflowHistory[workflowHistory.length - 1].action : 'pending';

  const getStatusIcon = (action: string) => {
    switch (action) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (action: string) => {
    switch (action) {
      case 'approved':
        return 'bg-green-50 border-green-200';
      case 'rejected':
        return 'bg-red-50 border-red-200';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200';
    }
  };

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Approval Workflow</h3>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
              currentStatus === 'approved'
                ? 'bg-green-100 text-green-800'
                : currentStatus === 'rejected'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {currentStatus}
          </span>
        </div>
        <p className="text-sm text-gray-600">{expenseName}</p>
        <p className="text-lg font-semibold text-gray-900 mt-1">${amount.toLocaleString()}</p>
      </div>

      {/* Workflow Timeline */}
      <div className="space-y-4">
        {workflowHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No approval actions yet</p>
            <p className="text-sm mt-1">Waiting for approval...</p>
          </div>
        ) : (
          <>
            {/* Initial Submission */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div className="w-0.5 h-full bg-gray-200 my-2" />
              </div>
              <div className="flex-1 pb-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900">Expense Submitted</p>
                    <span className="text-sm text-gray-500">
                      {getTimeAgo(new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString())}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Expense submitted for approval</p>
                </div>
              </div>
            </div>

            {/* Approval Actions */}
            {workflowHistory.map((action, index) => (
              <div key={action.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(action.action)}`}>
                    {getStatusIcon(action.action)}
                  </div>
                  {index < workflowHistory.length - 1 && <div className="w-0.5 h-full bg-gray-200 my-2" />}
                </div>
                <div className="flex-1 pb-4">
                  <div className={`border rounded-lg p-4 ${getStatusColor(action.action)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{action.approverName}</p>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${
                            action.action === 'approved'
                              ? 'bg-green-200 text-green-800'
                              : action.action === 'rejected'
                              ? 'bg-red-200 text-red-800'
                              : 'bg-yellow-200 text-yellow-800'
                          }`}
                        >
                          {action.action}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">{getTimeAgo(action.actionAt)}</span>
                    </div>

                    {action.comments && (
                      <div className="flex items-start gap-2 mt-3">
                        <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700">{action.comments}</p>
                      </div>
                    )}

                    <div className="mt-3 text-xs text-gray-500">
                      {new Date(action.actionAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Summary Stats */}
      {workflowHistory.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">Total Actions</p>
              <p className="text-2xl font-semibold text-gray-900">{workflowHistory.length + 1}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Approvals</p>
              <p className="text-2xl font-semibold text-green-600">
                {workflowHistory.filter((a) => a.action === 'approved').length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Processing Time</p>
              <p className="text-2xl font-semibold text-blue-600">
                {Math.floor(
                  (new Date(workflowHistory[workflowHistory.length - 1].actionAt).getTime() -
                    new Date(Date.now() - 1000 * 60 * 60 * 3).getTime()) /
                    (1000 * 60 * 60)
                )}
                h
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
