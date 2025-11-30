import React, { useState } from 'react';
import { UserPlus, X, Search, Mail, User as UserIcon } from 'lucide-react';
import { RoleBadge } from './RoleBasedAccess';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'Admin' | 'EventManager' | 'Finance' | 'Viewer';
  isActive: boolean;
}

interface EventAssignment {
  id: string;
  userId: string;
  eventId: string;
  role: string;
  assignedAt: string;
  user: User;
}

interface MultiUserAssignmentProps {
  eventId: string;
  eventName: string;
}

export const MultiUserAssignment: React.FC<MultiUserAssignmentProps> = ({ eventId, eventName }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('Team Member');

  // Mock available users
  const availableUsers: User[] = [
    { id: '1', fullName: 'John Smith', email: 'john.smith@company.com', role: 'Admin', isActive: true },
    { id: '2', fullName: 'Sarah Johnson', email: 'sarah.johnson@company.com', role: 'EventManager', isActive: true },
    { id: '3', fullName: 'Michael Chen', email: 'michael.chen@company.com', role: 'Finance', isActive: true },
    { id: '4', fullName: 'Emily Davis', email: 'emily.davis@company.com', role: 'EventManager', isActive: true },
    { id: '5', fullName: 'Robert Wilson', email: 'robert.wilson@company.com', role: 'Viewer', isActive: true },
  ];

  const [assignments, setAssignments] = useState<EventAssignment[]>([
    {
      id: 'a1',
      userId: '1',
      eventId,
      role: 'Event Lead',
      assignedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      user: availableUsers[0],
    },
    {
      id: 'a2',
      userId: '2',
      eventId,
      role: 'Budget Manager',
      assignedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      user: availableUsers[1],
    },
  ]);

  const assignedUserIds = new Set(assignments.map((a) => a.userId));
  const unassignedUsers = availableUsers.filter((u) => !assignedUserIds.has(u.id));

  const filteredUsers = unassignedUsers.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const assignUser = (user: User) => {
    const newAssignment: EventAssignment = {
      id: crypto.randomUUID(),
      userId: user.id,
      eventId,
      role: selectedRole,
      assignedAt: new Date().toISOString(),
      user,
    };
    setAssignments([...assignments, newAssignment]);
    setSearchQuery('');
    setSelectedRole('Team Member');
    setIsModalOpen(false);
  };

  const removeAssignment = (assignmentId: string) => {
    setAssignments(assignments.filter((a) => a.id !== assignmentId));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Team Assignments</h3>
          <p className="text-sm text-gray-500">Manage users assigned to {eventName}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Add Team Member
        </button>
      </div>

      {/* Assigned Users List */}
      <div className="space-y-3">
        {assignments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <UserIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No team members assigned yet</p>
            <button onClick={() => setIsModalOpen(true)} className="mt-3 text-blue-600 hover:text-blue-700">
              Assign your first team member
            </button>
          </div>
        ) : (
          assignments.map((assignment) => (
            <div key={assignment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                  {assignment.user.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{assignment.user.fullName}</p>
                  <p className="text-sm text-gray-500">{assignment.user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">{assignment.role}</p>
                  <p className="text-xs text-gray-500">
                    Assigned {new Date(assignment.assignedAt).toLocaleDateString()}
                  </p>
                </div>
                <RoleBadge role={assignment.user.role} />
                <button
                  onClick={() => removeAssignment(assignment.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove assignment"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Assignment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Assign Team Member</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(80vh-140px)]">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Event Lead">Event Lead</option>
                  <option value="Budget Manager">Budget Manager</option>
                  <option value="Coordinator">Coordinator</option>
                  <option value="Team Member">Team Member</option>
                  <option value="Finance Approver">Finance Approver</option>
                </select>
              </div>

              {/* Available Users */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Available Users</label>
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <UserIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>{searchQuery ? 'No users found' : 'All users are already assigned'}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredUsers.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => assignUser(user)}
                        className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                            {user.fullName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-gray-900">{user.fullName}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <RoleBadge role={user.role} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
