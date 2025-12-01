import { useState, useEffect } from 'react';
import { Users, Plus, X, CheckCircle } from 'lucide-react';
import type { User as AuthUser } from "~/lib/auth";
import { Dropdown } from './shared';

interface TeamMember {
  id: string;
  userId: string;
  role: string;
  assignedBy: string;
  user?: {
    name: string;
    email: string;
  };
}

interface OrganizationMember {
  id: string;
  name: string | null;
  email: string;
  role?: string;
}

interface TeamAssignmentsProps {
  eventId: string;
  organizationMembers: OrganizationMember[];
  onAssign: (userId: string, role: string) => Promise<void>;
  onRemove: (assignmentId: string) => Promise<void>;
  user: AuthUser | null;
  isDemo?: boolean;
}

export function TeamAssignments({
  eventId,
  organizationMembers,
  onAssign,
  onRemove,
  user,
  isDemo = false,
}: TeamAssignmentsProps) {
  const [assignments, setAssignments] = useState<TeamMember[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [assignmentRole, setAssignmentRole] = useState('');
  const [loading, setLoading] = useState(false);

  // Role-based access control - Only Admin can assign team members
  const isAdmin = user?.role === 'Admin' || user?.role === 'admin';
  const canAssignTeam = isAdmin || isDemo;

  // Mock data for demo
  useEffect(() => {
    if (isDemo) {
      setAssignments([
        {
          id: '1',
          userId: 'user-1',
          role: 'Lead Coordinator',
          assignedBy: 'admin',
          user: {
            name: 'Sarah Johnson',
            email: 'sarah@company.com',
          },
        },
        {
          id: '2',
          userId: 'user-2',
          role: 'Assistant Coordinator',
          assignedBy: 'admin',
          user: {
            name: 'Mike Davis',
            email: 'mike@company.com',
          },
        },
      ]);
    }
  }, [eventId, isDemo]);

  const handleAssign = async () => {
    if (!selectedUserId || !assignmentRole) return;

    setLoading(true);
    try {
      if (isDemo) {
        const member = organizationMembers.find(m => m.id === selectedUserId || m.userId === selectedUserId);
        setAssignments([...assignments, {
          id: Date.now().toString(),
          userId: selectedUserId,
          role: assignmentRole,
          assignedBy: user?.id || 'admin',
          user: {
            name: member?.name || member?.user?.name || 'Team Member',
            email: member?.email || member?.user?.email || 'member@example.com',
          },
        }]);
        setShowAddForm(false);
        setSelectedUserId('');
        setAssignmentRole('');
      } else {
        await onAssign(selectedUserId, assignmentRole);
        setShowAddForm(false);
        setSelectedUserId('');
        setAssignmentRole('');
      }
    } catch (error) {
      console.error('Error assigning team member:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (assignmentId: string) => {
    if (isDemo) {
      setAssignments(assignments.filter(a => a.id !== assignmentId));
    } else {
      await onRemove(assignmentId);
    }
  };

  const availableMembers = organizationMembers.filter(
    member => !assignments.some(a => a.userId === (member.id || member.userId))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users size={24} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Event Team</h3>
            <p className="text-gray-600 text-sm mt-1">
              Assign team members to this event
            </p>
            {isDemo && (
              <p className="text-yellow-700 text-sm mt-1">Demo Mode: Changes are not saved</p>
            )}
          </div>
        </div>
        {canAssignTeam && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            <span>Assign Member</span>
          </button>
        )}
      </div>

      {/* Add Form */}
      {showAddForm && canAssignTeam && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="mb-4 font-semibold text-gray-900">Assign Team Member</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Team Member</label>
              <Dropdown
                value={selectedUserId}
                onChange={setSelectedUserId}
                options={[
                  { value: '', label: 'Select a member' },
                  ...availableMembers.map((member) => ({
                    value: member.id || member.userId || '',
                    label: member.user?.name || member.name || member.user?.email || member.email || 'Unknown',
                  })),
                ]}
                placeholder="Select a member"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Role</label>
              <input
                type="text"
                value={assignmentRole}
                onChange={(e) => setAssignmentRole(e.target.value)}
                placeholder="e.g., Lead Coordinator"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleAssign}
              disabled={!selectedUserId || !assignmentRole || loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Assigning...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  <span>Assign to Event</span>
                </>
              )}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setSelectedUserId('');
                setAssignmentRole('');
              }}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Team List */}
      {assignments.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <h4 className="mb-2 font-semibold text-lg">No Team Members Assigned</h4>
          <p className="text-gray-600 mb-6">
            Assign team members to collaborate on this event
          </p>
          {canAssignTeam && (
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Assign First Member
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                    {assignment.user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium">{assignment.user?.name || 'Unknown User'}</p>
                    <p className="text-gray-600 text-sm">{assignment.user?.email}</p>
                  </div>
                </div>
                {canAssignTeam && (
                  <button
                    onClick={() => handleRemove(assignment.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove from event"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
              <div className="bg-blue-50 px-3 py-2 rounded-lg">
                <p className="text-blue-600 text-sm font-medium">Role</p>
                <p className="text-blue-900 font-semibold">{assignment.role}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      {assignments.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-900 text-sm">
            <strong>{assignments.length}</strong> team member(s) assigned to this event. 
            They will be notified and can collaborate on budget planning and expense tracking.
          </p>
        </div>
      )}
    </div>
  );
}
