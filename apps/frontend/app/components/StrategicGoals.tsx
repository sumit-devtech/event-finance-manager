import { useState } from 'react';
import { Target, Plus, X, CheckCircle, Clock } from './Icons';

interface StrategicGoal {
  id: string;
  title: string;
  description: string;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  deadline?: string;
  status: 'not-started' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

interface StrategicGoalsProps {
  eventId: string;
  goals?: StrategicGoal[];
  isDemo?: boolean;
  onSave?: (goals: StrategicGoal[]) => Promise<void>;
  user?: any;
}

export function StrategicGoals({ eventId, goals: initialGoals = [], isDemo = false, onSave, user }: StrategicGoalsProps) {
  const [goals, setGoals] = useState<StrategicGoal[]>(initialGoals);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<StrategicGoal | null>(null);

  // Role-based access control
  const isAdmin = user?.role === 'Admin' || user?.role === 'admin';
  const isEventManager = user?.role === 'EventManager';
  const isViewer = user?.role === 'Viewer';

  // Strategic Goals: Admin and EventManager only (Finance cannot create/edit goals)
  const canEditGoals = (isAdmin || isEventManager || isDemo);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetValue: '',
    currentValue: '',
    unit: '',
    deadline: '',
    status: 'not-started' as StrategicGoal['status'],
    priority: 'medium' as StrategicGoal['priority'],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newGoal: StrategicGoal = {
      id: editingGoal?.id || `goal-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      targetValue: formData.targetValue ? parseFloat(formData.targetValue) : undefined,
      currentValue: formData.currentValue ? parseFloat(formData.currentValue) : undefined,
      unit: formData.unit || undefined,
      deadline: formData.deadline || undefined,
      status: formData.status,
      priority: formData.priority,
    };

    const updatedGoals = editingGoal
      ? goals.map(g => g.id === editingGoal.id ? newGoal : g)
      : [...goals, newGoal];

    setGoals(updatedGoals);
    if (onSave) {
      onSave(updatedGoals);
    }
    
    setFormData({
      title: '',
      description: '',
      targetValue: '',
      currentValue: '',
      unit: '',
      deadline: '',
      status: 'not-started',
      priority: 'medium',
    });
    setShowForm(false);
    setEditingGoal(null);
  };

  const handleEdit = (goal: StrategicGoal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description,
      targetValue: goal.targetValue?.toString() || '',
      currentValue: goal.currentValue?.toString() || '',
      unit: goal.unit || '',
      deadline: goal.deadline || '',
      status: goal.status,
      priority: goal.priority,
    });
    setShowForm(true);
  };

  const handleDelete = (goalId: string) => {
    const updatedGoals = goals.filter(g => g.id !== goalId);
    setGoals(updatedGoals);
    if (onSave) {
      onSave(updatedGoals);
    }
  };

  const getStatusColor = (status: StrategicGoal['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: StrategicGoal['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getProgress = (goal: StrategicGoal) => {
    if (!goal.targetValue || !goal.currentValue) return 0;
    return Math.min((goal.currentValue / goal.targetValue) * 100, 100);
  };

  // Demo data
  const demoGoals: StrategicGoal[] = [
    {
      id: '1',
      title: 'Achieve 500+ Attendees',
      description: 'Target attendance for the main conference day',
      targetValue: 500,
      currentValue: 320,
      unit: 'attendees',
      deadline: '2024-03-15',
      status: 'in-progress',
      priority: 'high',
    },
    {
      id: '2',
      title: 'Generate 100 Qualified Leads',
      description: 'Capture contact information from interested participants',
      targetValue: 100,
      currentValue: 45,
      unit: 'leads',
      deadline: '2024-03-17',
      status: 'in-progress',
      priority: 'high',
    },
    {
      id: '3',
      title: 'Maintain Budget Within 5% Variance',
      description: 'Keep actual spending within 5% of planned budget',
      targetValue: 5,
      currentValue: 2.3,
      unit: '%',
      deadline: '2024-03-17',
      status: 'in-progress',
      priority: 'medium',
    },
  ];

  const displayGoals = isDemo ? demoGoals : goals;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Target size={24} className="text-blue-600" />
            Strategic Goals
          </h2>
          <p className="text-gray-600 mt-1">Define and track strategic objectives for this event</p>
        </div>
        {canEditGoals && (
          <button
            onClick={() => {
              setShowForm(true);
              setEditingGoal(null);
              setFormData({
                title: '',
                description: '',
                targetValue: '',
                currentValue: '',
                unit: '',
                deadline: '',
                status: 'not-started',
                priority: 'medium',
              });
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus size={18} />
            Add Goal
          </button>
        )}
      </div>

      {displayGoals.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <Target size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No strategic goals defined</h3>
          <p className="text-gray-600 mb-4">Create your first strategic goal to track event objectives</p>
          {canEditGoals && (
            <button
              onClick={() => {
                setShowForm(true);
                setEditingGoal(null);
                setFormData({
                  title: '',
                  description: '',
                  targetValue: '',
                  currentValue: '',
                  unit: '',
                  deadline: '',
                  status: 'not-started',
                  priority: 'medium',
                });
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus size={18} />
              Add Your First Goal
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayGoals.map((goal) => {
            const progress = getProgress(goal);
            return (
              <div
                key={goal.id}
                className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{goal.title}</h3>
                    <p className="text-sm text-gray-600">{goal.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(goal.status)}`}>
                      {goal.status.replace('-', ' ')}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(goal.priority)}`}>
                      {goal.priority}
                    </span>
                  </div>
                </div>

                {goal.targetValue !== undefined && goal.currentValue !== undefined && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Progress</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {goal.currentValue.toLocaleString()} / {goal.targetValue.toLocaleString()} {goal.unit || ''}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{progress.toFixed(0)}% complete</p>
                  </div>
                )}

                {goal.deadline && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Clock size={16} />
                    <span>Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleEdit(goal)}
                    className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && canEditGoals && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-xl font-bold text-gray-900">
                {editingGoal ? 'Edit Strategic Goal' : 'Add Strategic Goal'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingGoal(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Achieve 500+ Attendees"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the strategic goal..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Value</label>
                  <input
                    type="number"
                    value={formData.targetValue}
                    onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Value</label>
                  <input
                    type="number"
                    value={formData.currentValue}
                    onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="320"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., attendees, leads, %"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as StrategicGoal['status'] })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="not-started">Not Started</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as StrategicGoal['priority'] })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {editingGoal ? 'Update Goal' : 'Add Goal'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingGoal(null);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


