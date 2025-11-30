import React, { useState } from 'react';
import { Activity, User, Calendar, Eye, Filter, Download } from 'lucide-react';

interface ActivityLogEntry {
  id: string;
  userId: string;
  userName: string;
  eventId?: string;
  eventName?: string;
  action: string;
  details: any;
  createdAt: string;
}

export const ActivityLog: React.FC<{ eventId?: string }> = ({ eventId }) => {
  const [filter, setFilter] = useState<'all' | 'created' | 'updated' | 'deleted'>('all');
  const [activities] = useState<ActivityLogEntry[]>([
    {
      id: '1',
      userId: 'user1',
      userName: 'John Smith',
      eventId: 'evt1',
      eventName: 'Annual Tech Summit 2024',
      action: 'created',
      details: { entity: 'event', changes: { name: 'Annual Tech Summit 2024', budget: 50000 } },
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Sarah Johnson',
      eventId: 'evt1',
      eventName: 'Annual Tech Summit 2024',
      action: 'updated',
      details: { entity: 'budget', changes: { category: 'Catering', allocated: 5000 } },
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
    {
      id: '3',
      userId: 'user1',
      userName: 'John Smith',
      eventId: 'evt1',
      eventName: 'Annual Tech Summit 2024',
      action: 'created',
      details: { entity: 'expense', changes: { vendor: 'Elite Catering', amount: 2500 } },
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: '4',
      userId: 'user3',
      userName: 'Michael Chen',
      eventId: 'evt1',
      eventName: 'Annual Tech Summit 2024',
      action: 'approved',
      details: { entity: 'expense', expenseId: 'exp123', amount: 2500 },
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
    {
      id: '5',
      userId: 'user2',
      userName: 'Sarah Johnson',
      eventId: 'evt2',
      eventName: 'Marketing Workshop',
      action: 'deleted',
      details: { entity: 'vendor', vendorName: 'Old Vendor Inc' },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: '6',
      userId: 'user1',
      userName: 'John Smith',
      eventId: 'evt1',
      eventName: 'Annual Tech Summit 2024',
      action: 'updated',
      details: { entity: 'event', changes: { status: 'Active' } },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    },
  ]);

  const filteredActivities = filter === 'all' ? activities : activities.filter((a) => a.action === filter);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'text-green-600 bg-green-50';
      case 'updated':
        return 'text-blue-600 bg-blue-50';
      case 'deleted':
        return 'text-red-600 bg-red-50';
      case 'approved':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  const formatDetails = (activity: ActivityLogEntry) => {
    const { entity, changes, vendorName, amount } = activity.details;

    if (activity.action === 'created') {
      return `Created ${entity}: ${Object.entries(changes).map(([k, v]) => `${k}="${v}"`).join(', ')}`;
    }
    if (activity.action === 'updated') {
      return `Updated ${entity}: ${Object.entries(changes).map(([k, v]) => `${k} to "${v}"`).join(', ')}`;
    }
    if (activity.action === 'deleted') {
      return `Deleted ${entity}${vendorName ? `: ${vendorName}` : ''}`;
    }
    if (activity.action === 'approved') {
      return `Approved ${entity} for $${amount?.toLocaleString()}`;
    }
    return JSON.stringify(activity.details);
  };

  const exportLog = () => {
    const csv = [
      ['Timestamp', 'User', 'Event', 'Action', 'Details'].join(','),
      ...filteredActivities.map((a) =>
        [
          new Date(a.createdAt).toLocaleString(),
          a.userName,
          a.eventName || 'N/A',
          a.action,
          formatDetails(a).replace(/,/g, ';'),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Activity Log</h2>
        </div>
        <div className="flex items-center gap-3">
          {/* Filter */}
          <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('created')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                filter === 'created' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Created
            </button>
            <button
              onClick={() => setFilter('updated')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                filter === 'updated' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Updated
            </button>
            <button
              onClick={() => setFilter('deleted')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                filter === 'deleted' ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Deleted
            </button>
          </div>

          {/* Export Button */}
          <button
            onClick={exportLog}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="space-y-4">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No activity logs found</p>
          </div>
        ) : (
          filteredActivities.map((activity, index) => (
            <div key={activity.id} className="flex gap-4">
              {/* Timeline Line */}
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActionColor(activity.action)}`}>
                  <Activity className="w-5 h-5" />
                </div>
                {index < filteredActivities.length - 1 && <div className="w-0.5 h-full bg-gray-200 my-2" />}
              </div>

              {/* Activity Content */}
              <div className="flex-1 pb-8">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{activity.userName}</span>
                      <span className={`px-2 py-0.5 rounded text-xs capitalize ${getActionColor(activity.action)}`}>
                        {activity.action}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">{getTimeAgo(activity.createdAt)}</span>
                  </div>

                  {activity.eventName && (
                    <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{activity.eventName}</span>
                    </div>
                  )}

                  <p className="text-sm text-gray-700">{formatDetails(activity)}</p>

                  {/* Details Metadata */}
                  <details className="mt-3">
                    <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">View raw details</summary>
                    <pre className="mt-2 p-2 bg-white rounded text-xs overflow-x-auto border border-gray-200">
                      {JSON.stringify(activity.details, null, 2)}
                    </pre>
                  </details>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
