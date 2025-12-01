import { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Mail, Phone } from 'lucide-react';
import type { User as AuthUser } from "~/lib/auth";
import { Dropdown } from './shared';

interface Stakeholder {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  organization: string;
  notes: string;
}

interface StakeholderManagerProps {
  eventId: string;
  onAdd: (data: Partial<Stakeholder>) => Promise<void>;
  onUpdate: (id: string, data: Partial<Stakeholder>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  user: AuthUser | null;
  isDemo?: boolean;
}

export function StakeholderManager({
  eventId,
  onAdd,
  onUpdate,
  onDelete,
  user,
  isDemo = false,
}: StakeholderManagerProps) {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Role-based access control
  const isAdmin = user?.role === 'Admin' || user?.role === 'admin';
  const isEventManager = user?.role === 'EventManager';
  const isViewer = user?.role === 'Viewer';

  // Stakeholders: Admin and EventManager only (Finance cannot manage stakeholders, similar to events)
  const canEditStakeholders = (isAdmin || isEventManager || isDemo);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    organization: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  // Mock data for demo
  useEffect(() => {
    if (isDemo) {
      setStakeholders([
        {
          id: '1',
          name: 'John Smith',
          role: 'Client Representative',
          email: 'john@clientcompany.com',
          phone: '+1 (555) 123-4567',
          organization: 'Client Company Inc.',
          notes: 'Primary decision maker',
        },
        {
          id: '2',
          name: 'Emily Chen',
          role: 'Sponsor Contact',
          email: 'emily@sponsor.com',
          phone: '+1 (555) 987-6543',
          organization: 'Sponsor Corp',
          notes: 'Handles sponsorship logistics',
        },
      ]);
    }
  }, [eventId, isDemo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isDemo) {
        if (editingId) {
          setStakeholders(stakeholders.map(s => 
            s.id === editingId ? { ...s, ...formData } : s
          ));
        } else {
          setStakeholders([...stakeholders, {
            id: Date.now().toString(),
            ...formData,
          } as Stakeholder]);
        }
        resetForm();
      } else {
        if (editingId) {
          await onUpdate(editingId, formData);
        } else {
          await onAdd(formData);
        }
        resetForm();
      }
    } catch (error) {
      console.error('Error saving stakeholder:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      email: '',
      phone: '',
      organization: '',
      notes: '',
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (stakeholder: Stakeholder) => {
    setFormData({
      name: stakeholder.name,
      role: stakeholder.role,
      email: stakeholder.email,
      phone: stakeholder.phone,
      organization: stakeholder.organization,
      notes: stakeholder.notes,
    });
    setEditingId(stakeholder.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (isDemo) {
      setStakeholders(stakeholders.filter(s => s.id !== id));
    } else {
      await onDelete(id);
    }
  };

  const roleOptions = [
    'Client Representative',
    'Sponsor Contact',
    'Partner Liaison',
    'Media Contact',
    'Vendor Representative',
    'VIP Guest',
    'Other',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Users size={24} className="text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">External Stakeholders</h3>
            <p className="text-gray-600 text-sm mt-1">
              Manage clients, partners, and sponsors
            </p>
            {isDemo && (
              <p className="text-yellow-700 text-sm mt-1">Demo Mode: Changes are not saved</p>
            )}
          </div>
        </div>
        {canEditStakeholders && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            <span>Add Stakeholder</span>
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && canEditStakeholders && (
        <form onSubmit={handleSubmit} className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h4 className="mb-4 font-semibold text-gray-900">{editingId ? 'Edit' : 'Add'} Stakeholder</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Full name"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Role *</label>
              <Dropdown
                value={formData.role}
                onChange={(value) => setFormData({ ...formData, role: value })}
                options={[
                  { value: '', label: 'Select role' },
                  ...roleOptions.map(role => ({
                    value: role,
                    label: role,
                  })),
                ]}
                placeholder="Select role"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="email@example.com"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="+1 (555) 123-4567"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2 font-medium">Organization</label>
              <input
                type="text"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Company name"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2 font-medium">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Additional information..."
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : editingId ? 'Update' : 'Add'} Stakeholder
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Stakeholders List */}
      {stakeholders.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <h4 className="mb-2 font-semibold text-lg">No Stakeholders Added</h4>
          <p className="text-gray-600 mb-6">
            Add external stakeholders to track clients, partners, and sponsors
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Add First Stakeholder
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stakeholders.map((stakeholder) => (
            <div
              key={stakeholder.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:border-green-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="mb-1 font-semibold text-gray-900">{stakeholder.name}</h4>
                  <p className="text-green-600 text-sm font-medium">{stakeholder.role}</p>
                </div>
                {canEditStakeholders && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(stakeholder)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(stakeholder.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>

              {stakeholder.organization && (
                <p className="text-gray-700 mb-3 font-medium">{stakeholder.organization}</p>
              )}

              <div className="space-y-2 mb-3">
                {stakeholder.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail size={16} />
                    <a href={`mailto:${stakeholder.email}`} className="hover:text-green-600">
                      {stakeholder.email}
                    </a>
                  </div>
                )}
                {stakeholder.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={16} />
                    <a href={`tel:${stakeholder.phone}`} className="hover:text-green-600">
                      {stakeholder.phone}
                    </a>
                  </div>
                )}
              </div>

              {stakeholder.notes && (
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                  {stakeholder.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {stakeholders.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-900 text-sm">
            <strong>{stakeholders.length}</strong> stakeholder(s) registered for this event.
          </p>
        </div>
      )}
    </div>
  );
}
