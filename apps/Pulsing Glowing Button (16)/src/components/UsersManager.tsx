import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  UserPlus,
  CheckCircle,
  X,
  UserCheck,
} from "./Icons";

interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "EventManager" | "Finance" | "Viewer";
  status: "active" | "inactive";
  createdAt: string;
  assignedEvents?: string[];
}

interface UsersManagerProps {
  organization: any;
  events: any[];
}

export default function UsersManager({
  organization,
  events,
}: UsersManagerProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(
    null,
  );
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Viewer" as User["role"],
  });
  const [selectedEvents, setSelectedEvents] = useState<
    string[]
  >([]);
  const [filterRole, setFilterRole] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Load demo users
  useEffect(() => {
    const demoUsers: User[] = [
      {
        id: "user-1",
        name: "Sarah Johnson",
        email: "sarah@company.com",
        role: "Admin",
        status: "active",
        createdAt: new Date().toISOString(),
        assignedEvents: ["event-1", "event-2"],
      },
      {
        id: "user-2",
        name: "Mike Davis",
        email: "mike@company.com",
        role: "EventManager",
        status: "active",
        createdAt: new Date().toISOString(),
        assignedEvents: ["event-1"],
      },
      {
        id: "user-3",
        name: "Jane Smith",
        email: "jane@company.com",
        role: "Finance",
        status: "active",
        createdAt: new Date().toISOString(),
        assignedEvents: ["event-2", "event-3"],
      },
      {
        id: "user-4",
        name: "Bob Wilson",
        email: "bob@company.com",
        role: "Viewer",
        status: "active",
        createdAt: new Date().toISOString(),
        assignedEvents: [],
      },
    ];
    setUsers(demoUsers);
  }, []);

  const handleAddUser = () => {
    if (!formData.name || !formData.email) return;

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: "active",
      createdAt: new Date().toISOString(),
      assignedEvents: [],
    };

    setUsers([...users, newUser]);
    setFormData({ name: "", email: "", role: "Viewer" });
    setShowAddModal(false);
  };

  const handleEditUser = () => {
    if (!selectedUser) return;

    setUsers(
      users.map((user) =>
        user.id === selectedUser.id
          ? {
              ...user,
              name: formData.name,
              email: formData.email,
              role: formData.role,
            }
          : user,
      ),
    );
    setShowEditModal(false);
    setSelectedUser(null);
    setFormData({ name: "", email: "", role: "Viewer" });
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter((user) => user.id !== userId));
    }
  };

  const handleAssignEvents = () => {
    if (!selectedUser) return;

    setUsers(
      users.map((user) =>
        user.id === selectedUser.id
          ? { ...user, assignedEvents: selectedEvents }
          : user,
      ),
    );
    setShowAssignModal(false);
    setSelectedUser(null);
    setSelectedEvents([]);
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setShowEditModal(true);
  };

  const openAssignModal = (user: User) => {
    setSelectedUser(user);
    setSelectedEvents(user.assignedEvents || []);
    setShowAssignModal(true);
  };

  const toggleEventSelection = (eventId: string) => {
    setSelectedEvents((prev) =>
      prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId],
    );
  };

  const filteredUsers = users.filter((user) => {
    const matchesRole =
      filterRole === "all" || user.role === filterRole;
    const matchesSearch =
      user.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      user.email
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const roleColors: Record<User["role"], string> = {
    Admin: "bg-purple-100 text-purple-700 border-purple-200",
    EventManager: "bg-blue-100 text-blue-700 border-blue-200",
    Finance: "bg-green-100 text-green-700 border-green-200",
    Viewer: "bg-gray-100 text-gray-700 border-gray-200",
  };

  const roleDescriptions: Record<User["role"], string> = {
    Admin: "Full access to all features",
    EventManager: "Manage events, budgets, and expenses",
    Finance: "View and approve expenses, manage budgets",
    Viewer: "View-only access to events and reports",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1>Team Members</h1>
          <p className="text-gray-600 mt-1">
            Manage organization users and assign them to events
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm"
        >
          <UserPlus size={20} />
          <span>Add User</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
          <p className="text-purple-100 text-sm mb-1">Admin</p>
          <p className="text-3xl" style={{ fontWeight: "700" }}>
            {users.filter((u) => u.role === "Admin").length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
          <p className="text-blue-100 text-sm mb-1">
            Event Managers
          </p>
          <p className="text-3xl" style={{ fontWeight: "700" }}>
            {
              users.filter((u) => u.role === "EventManager")
                .length
            }
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
          <p className="text-green-100 text-sm mb-1">Finance</p>
          <p className="text-3xl" style={{ fontWeight: "700" }}>
            {users.filter((u) => u.role === "Finance").length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-gray-500 to-gray-600 text-white rounded-xl p-6 shadow-lg">
          <p className="text-gray-100 text-sm mb-1">Viewers</p>
          <p className="text-3xl" style={{ fontWeight: "700" }}>
            {users.filter((u) => u.role === "Viewer").length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-2 text-sm">
              Search Users
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2 text-sm">
              Filter by Role
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="EventManager">
                Event Manager
              </option>
              <option value="Finance">Finance</option>
              <option value="Viewer">Viewer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Users
              size={48}
              className="mx-auto text-gray-400 mb-4"
            />
            <h3 className="mb-2">No Users Found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filterRole !== "all"
                ? "Try adjusting your filters"
                : "Add your first team member to get started"}
            </p>
            {!searchQuery && filterRole === "all" && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add First User
              </button>
            )}
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                {/* User Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div
                    className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl"
                    style={{ fontWeight: "700" }}
                  >
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1">{user.name}</h3>
                    <p className="text-gray-600 mb-3">
                      {user.email}
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span
                        className={`px-3 py-1 rounded-full text-sm border ${roleColors[user.role]}`}
                        style={{ fontWeight: "600" }}
                      >
                        {user.role}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {user.assignedEvents?.length || 0}{" "}
                        event(s) assigned
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mt-2">
                      {roleDescriptions[user.role]}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openAssignModal(user)}
                    className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 flex items-center gap-2 border border-green-200"
                  >
                    <UserCheck size={18} />
                    <span>Assign Events</span>
                  </button>
                  <button
                    onClick={() => openEditModal(user)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200"
                    title="Edit user"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200"
                    title="Delete user"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2>Add New User</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({
                    name: "",
                    email: "",
                    role: "Viewer",
                  });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                  placeholder="john@company.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as User["role"],
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Viewer">
                    Viewer - View-only access
                  </option>
                  <option value="Finance">
                    Finance - Manage budgets & expenses
                  </option>
                  <option value="EventManager">
                    Event Manager - Manage events
                  </option>
                  <option value="Admin">
                    Admin - Full access
                  </option>
                </select>
                <p className="text-gray-500 text-sm mt-2">
                  {roleDescriptions[formData.role]}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleAddUser}
                disabled={!formData.name || !formData.email}
                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <UserPlus size={20} />
                <span>Create User</span>
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({
                    name: "",
                    email: "",
                    role: "Viewer",
                  });
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2>Edit User</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                  setFormData({
                    name: "",
                    email: "",
                    role: "Viewer",
                  });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as User["role"],
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Viewer">Viewer</option>
                  <option value="Finance">Finance</option>
                  <option value="EventManager">
                    Event Manager
                  </option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleEditUser}
                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <CheckCircle size={20} />
                <span>Save Changes</span>
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                  setFormData({
                    name: "",
                    email: "",
                    role: "Viewer",
                  });
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Events Modal */}
      {showAssignModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2>Assign Events</h2>
                <p className="text-gray-600 mt-1">
                  Select events for {selectedUser.name}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedUser(null);
                  setSelectedEvents([]);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {events.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No events available to assign
                </div>
              ) : (
                events.map((event) => (
                  <div
                    key={event.id}
                    onClick={() =>
                      toggleEventSelection(event.id)
                    }
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedEvents.includes(event.id)
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                          selectedEvents.includes(event.id)
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedEvents.includes(event.id) && (
                          <CheckCircle
                            size={16}
                            className="text-white"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4>{event.name}</h4>
                        <p className="text-gray-600 text-sm">
                          {new Date(
                            event.date,
                          ).toLocaleDateString()}{" "}
                          • {event.location}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className="text-gray-900"
                          style={{ fontWeight: "600" }}
                        >
                          ${event.budget?.toLocaleString()}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {event.type}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleAssignEvents}
                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <CheckCircle size={20} />
                <span>
                  Assign {selectedEvents.length} Event(s)
                </span>
              </button>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedUser(null);
                  setSelectedEvents([]);
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}