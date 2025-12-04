import { useState, useEffect, useRef } from 'react';
import { useFetcher, useRevalidator } from '@remix-run/react';
import { Edit, Plus, X, Calendar, User } from '../Icons';
import { EditButton, DeleteButton } from '../shared';
import { toast } from 'react-hot-toast';
import { demoEventNotes } from "~/lib/demoData";

interface Note {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  tags?: string[];
}

interface EventNotesProps {
  eventId: string;
  notes?: Note[];
  isDemo?: boolean;
  onSave?: (notes: Note[]) => Promise<void>;
  user?: any;
  fetcher?: ReturnType<typeof useFetcher>;
}

export function EventNotes({ eventId, notes: initialNotes = [], isDemo = false, onSave, user, fetcher: parentFetcher }: EventNotesProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [noteTags, setNoteTags] = useState('');
  const fetcher = parentFetcher || useFetcher();
  const revalidator = useRevalidator();
  const previousFetcherStateRef = useRef<string | undefined>(fetcher?.state);
  const wasSubmittingRef = useRef(false);
  const submittingNoteRef = useRef<Note | null>(null);
  const submittingFormRef = useRef(false);

  // Role-based access control
  const isAdmin = user?.role === 'Admin' || user?.role === 'admin';
  const isEventManager = user?.role === 'EventManager';
  const isViewer = user?.role === 'Viewer';

  // Event Notes: Admin and EventManager only (Finance cannot edit notes, similar to events)
  const canEditNotes = (isAdmin || isEventManager || isDemo);

  // Update notes when initialNotes prop changes
  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  // Handle fetcher state changes - refresh data when submission completes
  useEffect(() => {
    if (!fetcher || isDemo) {
      return;
    }

    const currentState = fetcher.state;
    const previousState = previousFetcherStateRef.current;

    // Track when we start submitting
    if (currentState === "submitting" && previousState !== "submitting") {
      wasSubmittingRef.current = true;
    }

    // Process when fetcher becomes idle after submitting
    // This handles both direct transitions (submitting -> idle) and redirects (submitting -> loading -> idle)
    if (currentState === "idle" && wasSubmittingRef.current && (previousState === "submitting" || previousState === "loading")) {
      // Check for error
      if (fetcher.data && typeof fetcher.data === 'object' && 'error' in fetcher.data) {
        toast.error((fetcher.data as { error: string }).error);
        wasSubmittingRef.current = false;
        submittingNoteRef.current = null;
        submittingFormRef.current = false;
        previousFetcherStateRef.current = currentState;
        return;
      }

      // Success case - refresh data
      // Use refs to get the values at submission time
      const wasEditing = submittingNoteRef.current !== null;
      const wasShowingForm = submittingFormRef.current;

      if (wasShowingForm) {
        setShowForm(false);
        setNoteContent('');
        setNoteTags('');
        setEditingNote(null);
        toast.success(wasEditing ? 'Note updated successfully' : 'Note created successfully');
      } else {
        toast.success('Note deleted successfully');
      }

      // Reset refs
      submittingNoteRef.current = null;
      submittingFormRef.current = false;
      wasSubmittingRef.current = false;

      // Refresh data - trigger revalidation which will reload all loaders
      // Also explicitly reload the parent fetcher to ensure we get the latest notes
      revalidator.revalidate();
      if (parentFetcher && parentFetcher.state === "idle") {
        // Small delay to ensure redirect has completed
        setTimeout(() => {
          parentFetcher.load(`/events/${eventId}`);
        }, 200);
      }
    }

    previousFetcherStateRef.current = currentState;
  }, [fetcher?.state, fetcher?.data, eventId, parentFetcher, revalidator, isDemo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!noteContent.trim()) return;

    if (isDemo) {
      // Demo mode - handle locally
      const tags = noteTags.split(',').map(t => t.trim()).filter(Boolean);
      const newNote: Note = {
        id: editingNote?.id || `note-${Date.now()}`,
        content: noteContent,
        createdAt: editingNote?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: editingNote?.createdBy || 'Current User',
        tags: tags.length > 0 ? tags : undefined,
      };

      const updatedNotes = editingNote
        ? notes.map(n => n.id === editingNote.id ? newNote : n)
        : [...notes, newNote].sort((a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );

      setNotes(updatedNotes);
      if (onSave) {
        onSave(updatedNotes);
      }

      setNoteContent('');
      setNoteTags('');
      setShowForm(false);
      setEditingNote(null);
      toast.success(editingNote ? 'Note updated successfully' : 'Note created successfully');
    } else {
      // Non-demo mode - use fetcher to submit
      // Capture current values in refs before submission
      submittingNoteRef.current = editingNote;
      submittingFormRef.current = true;
      
      const formData = new FormData();
      formData.append("intent", editingNote ? "updateNote" : "createNote");
      formData.append("content", noteContent);
      if (noteTags.trim()) {
        formData.append("tags", noteTags);
      }
      if (editingNote) {
        formData.append("noteId", editingNote.id);
      }
      fetcher.submit(formData, { method: "post", action: `/events/${eventId}` });
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setNoteContent(note.content);
    setNoteTags(note.tags?.join(', ') || '');
    setShowForm(true);
  };

  const handleDelete = (noteId: string) => {
    if (isDemo) {
      // Demo mode - handle locally
      const updatedNotes = notes.filter(n => n.id !== noteId);
      setNotes(updatedNotes);
      if (onSave) {
        onSave(updatedNotes);
      }
      toast.success('Note deleted successfully');
    } else {
      // Non-demo mode - use fetcher to submit
      if (!confirm("Are you sure you want to delete this note? This action cannot be undone.")) {
        return;
      }
      submittingFormRef.current = false; // Not showing form for delete
      const formData = new FormData();
      formData.append("intent", "deleteNote");
      formData.append("noteId", noteId);
      fetcher.submit(formData, { method: "post", action: `/events/${eventId}` });
    }
  };

  // Use demo data from centralized file
  const displayNotes = isDemo ? demoEventNotes : notes;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Edit size={24} className="text-blue-600" />
            Notes
          </h2>
          <p className="text-gray-600 mt-1">Keep track of important information and reminders</p>
        </div>
        {canEditNotes && (
          <button
            onClick={() => {
              setShowForm(true);
              setEditingNote(null);
              setNoteContent('');
              setNoteTags('');
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus size={18} />
            Add Note
          </button>
        )}
      </div>

      {displayNotes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <Edit size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No notes yet</h3>
          <p className="text-gray-600 mb-4">Add notes to track important information about this event</p>
          {canEditNotes && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus size={18} />
              Add Your First Note
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {displayNotes.map((note) => (
            <div
              key={note.id}
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{note.content}</p>
                </div>
                {canEditNotes && (
                  <div className="flex items-center gap-2 ml-4">
                    <EditButton
                      onClick={() => handleEdit(note)}
                    />
                    <DeleteButton
                      onClick={() => handleDelete(note.id)}
                      requireConfirm={true}
                      confirmMessage="Are you sure you want to delete this note? This action cannot be undone."
                    />
                  </div>
                )}
              </div>

              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {note.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>
                    {new Date(note.updatedAt).toLocaleDateString()} at{' '}
                    {new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {note.createdBy && (
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    <span>{note.createdBy}</span>
                  </div>
                )}
                {note.updatedAt !== note.createdAt && (
                  <span className="text-gray-400">(edited)</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && canEditNotes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-xl font-bold text-gray-900">
                {editingNote ? 'Edit Note' : 'Add Note'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingNote(null);
                  setNoteContent('');
                  setNoteTags('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Note Content *</label>
                <textarea
                  required
                  name="content"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={8}
                  disabled={fetcher.state === "submitting"}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Write your note here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={noteTags}
                  onChange={(e) => setNoteTags(e.target.value)}
                  disabled={fetcher.state === "submitting"}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="e.g., urgent, venue, catering"
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple tags with commas</p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={fetcher.state === "submitting" || !noteContent.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {fetcher.state === "submitting" ? 'Saving...' : editingNote ? 'Update Note' : 'Add Note'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingNote(null);
                    setNoteContent('');
                    setNoteTags('');
                  }}
                  disabled={fetcher.state === "submitting"}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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

