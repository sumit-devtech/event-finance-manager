import React, { useState } from 'react';
import { Users, Plus, X, Mail, Phone, Edit2, Trash2 } from 'lucide-react';

interface Stakeholder {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  createdAt: string;
}

export const StakeholderManagement: React.FC<{ eventId: string }> = ({ eventId }) => {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([
    {
      id: '1',
      name: 'David Thompson',
      role: 'Keynote Speaker',
      email: 'david.thompson@external.com',
      phone: '+1 (555) 123-4567',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Lisa Martinez',
      role: 'Sponsor Representative',
      email: 'lisa.martinez@sponsor.com',
      phone: '+1 (555) 234-5678',
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'James Wilson',
      role: 'VIP Guest',
      email: 'james.wilson@vip.com',
      phone: '+1 (555) 345-6789',
      createdAt: new Date().toISOString(),
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStakeholder, setEditingStakeholder] = useState<Stakeholder | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
  });

  const openModal = (stakeholder?: Stakeholder) => {
    if (stakeholder) {
      setEditingStakeholder(stakeholder);
      setFormData({
        name: stakeholder.name,
        role: stakeholder.role,
        email: stakeholder.email,
        phone: stakeholder.phone,
      });
    } else {
      setEditingStakeholder(null);
      setFormData({ name: '', role: '', email: '', phone: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStakeholder(null);
    setFormData({ name: '', role: '', email: '', phone: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingStakeholder) {
      // Update existing stakeholder
      setStakeholders(
        stakeholders.map((s) =>
          s.id === editingStakeholder.id
            ? { ...s, ...formData, updatedAt: new Date().toISOString() }
            : s
        )
      );
    } else {
      // Add new stakeholder
      const newStakeholder: Stakeholder = {
        id: crypto.randomUUID(),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      setStakeholders([...stakeholders, newStakeholder]);
    }

    closeModal();
  };

  const deleteStakeholder = (id: string) => {
    if (confirm('Are you sure you want to remove this stakeholder?')) {
      setStakeholders(stakeholders.filter((s) => s.id !== id));
    }
  };

  const roleColors: Record<string, string> = {
    'Keynote Speaker': 'bg-purple-100 text-purple-800',
    'Sponsor Representative': 'bg-blue-100 text-blue-800',
    'VIP Guest': 'bg-yellow-100 text-yellow-800',
    'Panel Member': 'bg-green-100 text-green-800',
    'Media Contact': 'bg-pink-100 text-pink-800',
    'Other': 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Event Stakeholders</h3>
            <p className="text-sm text-gray-500">External participants and contacts</p>
          </div>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Stakeholder
        </button>
      </div>

      {/* Stakeholders Grid */}
      {stakeholders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No stakeholders added yet</p>
          <button onClick={() => openModal()} className="mt-3 text-blue-600 hover:text-blue-700">
            Add your first stakeholder
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stakeholders.map((stakeholder) => (
            <div key={stakeholder.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{stakeholder.name}</h4>
                  <span className={`inline-block mt-1 px-2 py-1 rounded text-xs ${roleColors[stakeholder.role] || roleColors['Other']}`}>
                    {stakeholder.role}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openModal(stakeholder)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteStakeholder(stakeholder.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a href={`mailto:${stakeholder.email}`} className="hover:text-blue-600 truncate">
                    {stakeholder.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a href={`tel:${stakeholder.phone}`} className="hover:text-blue-600">
                    {stakeholder.phone}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingStakeholder ? 'Edit Stakeholder' : 'Add Stakeholder'}
              </h3>
              <button onClick={closeModal} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select role...</option>
                  <option value="Keynote Speaker">Keynote Speaker</option>
                  <option value="Sponsor Representative">Sponsor Representative</option>
                  <option value="VIP Guest">VIP Guest</option>
                  <option value="Panel Member">Panel Member</option>
                  <option value="Media Contact">Media Contact</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="john.doe@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingStakeholder ? 'Update' : 'Add'} Stakeholder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
