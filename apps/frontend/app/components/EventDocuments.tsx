import { useState } from 'react';
import { Folder, Plus, X, Download, FileText, Calendar } from './Icons';
import { DeleteButton } from './shared';
import { toast } from 'react-hot-toast';
import { demoEventDocuments } from "~/lib/demoData";

interface Document {
  id: string;
  name: string;
  type: string;
  size?: number;
  uploadedAt: string;
  uploadedBy?: string;
  url?: string;
}

interface EventDocumentsProps {
  eventId: string;
  documents?: Document[];
  isDemo?: boolean;
  onUpload?: (file: File) => Promise<void>;
  onDelete?: (documentId: string) => Promise<void>;
  user?: any;
}

export function EventDocuments({ eventId, documents: initialDocuments = [], isDemo = false, onUpload, onDelete, user }: EventDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Role-based access control
  const isViewer = user?.role === 'Viewer';
  const canEditDocuments = !isViewer || isDemo;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      if (onUpload) {
        await onUpload(file);
      }
      
      const newDocument: Document = {
        id: `doc-${Date.now()}`,
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'Current User',
      };

      setDocuments([...documents, newDocument]);
      setShowUploadForm(false);
      toast.success('Document uploaded successfully');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error('Error uploading file:', errorMessage);
      toast.error('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    try {
      if (onDelete) {
        await onDelete(documentId);
      }
      setDocuments(documents.filter(doc => doc.id !== documentId));
      toast.success('Document deleted successfully');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error('Error deleting document:', errorMessage);
      toast.error('Failed to delete document. Please try again.');
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('image')) return '🖼️';
    if (type.includes('spreadsheet') || type.includes('excel')) return '📊';
    if (type.includes('word') || type.includes('document')) return '📝';
    return '📎';
  };

  // Use demo data from centralized file
  const displayDocuments = isDemo ? demoEventDocuments : documents;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Folder size={24} className="text-blue-600" />
            Documents
          </h2>
          <p className="text-gray-600 mt-1">Manage all event-related documents and files</p>
        </div>
        {canEditDocuments && (
          <button
            onClick={() => setShowUploadForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus size={18} />
            Upload Document
          </button>
        )}
      </div>

      {displayDocuments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <Folder size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents uploaded</h3>
          <p className="text-gray-600 mb-4">Upload contracts, plans, and other event documents</p>
          {canEditDocuments && (
            <button
              onClick={() => setShowUploadForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus size={18} />
              Upload Your First Document
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayDocuments.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="text-3xl flex-shrink-0">{getFileIcon(doc.type)}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate mb-1">{doc.name}</h3>
                  <p className="text-xs text-gray-500">{formatFileSize(doc.size)}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Calendar size={14} />
                  <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                </div>
                {doc.uploadedBy && (
                  <p className="text-xs text-gray-600">Uploaded by {doc.uploadedBy}</p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    if (doc.url) {
                      window.open(doc.url, '_blank');
                    } else {
                      toast.info('Download functionality will be implemented');
                    }
                  }}
                  className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  Download
                </button>
                {canEditDocuments && (
                  <DeleteButton
                    onClick={() => handleDelete(doc.id)}
                    requireConfirm={true}
                    confirmMessage="Are you sure you want to delete this document? This action cannot be undone."
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Form Modal */}
      {showUploadForm && canEditDocuments && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-xl font-bold text-gray-900">Upload Document</h3>
              <button
                onClick={() => setShowUploadForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
            <div className="p-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <FileText size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-4">
                  Drag and drop a file here, or click to select
                </p>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer ${
                    uploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {uploading ? 'Uploading...' : 'Select File'}
                </label>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => setShowUploadForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


