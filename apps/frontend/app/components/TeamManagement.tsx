import { Link } from "@remix-run/react";
import { Plus, Mail, UserCog, Trash2, Crown, Shield, User as UserIcon, Search } from 'lucide-react';
import type { User } from "~/lib/auth";

interface TeamManagementProps {
  user: User;
  organization?: any;
  members?: any[];
}

export function TeamManagement({ user, organization, members = [] }: TeamManagementProps) {
  const getRoleIcon = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return <Crown className="text-yellow-600" size={20} />;
      case 'manager':
      case 'eventmanager':
        return <Shield className="text-blue-600" size={20} />;
      default:
        return <UserIcon className="text-gray-600" size={20} />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-yellow-100 text-yellow-700';
      case 'manager':
      case 'eventmanager':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const activeMembers = members.filter(m => m.isActive !== false);
  const pendingMembers = members.filter(m => m.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Management</h2>
          <p className="text-gray-600 mt-1">Manage your team members and their permissions</p>
        </div>
        {user.role === 'Admin' && (
          <Link
            to="/team/invite"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 justify-center"
          >
            <Plus size={20} />
            <span>Invite Member</span>
          </Link>
        )}
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-2">Total Members</p>
          <p className="text-2xl font-bold">{members.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-2">Active Members</p>
          <p className="text-2xl font-bold text-green-600">{activeMembers.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-2">Pending Invites</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingMembers.length}</p>
        </div>
      </div>

      {/* Members Table */}
      {members.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Team Members</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-600 font-medium">Member</th>
                  <th className="px-6 py-3 text-left text-gray-600 font-medium">Role</th>
                  <th className="px-6 py-3 text-left text-gray-600 font-medium">Status</th>
                  <th className="px-6 py-3 text-left text-gray-600 font-medium">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {(member.name || member.email || 'U')[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{member.name || member.email?.split('@')[0] || 'Unknown'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(member.role)}
                        <span className={`px-3 py-1 rounded-full text-sm ${getRoleBadgeColor(member.role)}`}>
                          {member.role || 'Member'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadgeColor(member.isActive !== false ? 'active' : 'inactive')}`}>
                        {member.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {member.email}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <UserCog className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">No team members yet</p>
          {user.role === 'Admin' && (
            <Link
              to="/team/invite"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              <span>Invite Member</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

