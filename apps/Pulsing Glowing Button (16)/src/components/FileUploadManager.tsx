import React, { useState } from 'react';
import { Upload, File, X, Download, Eye, Trash2, FileText, Image, FileSpreadsheet } from 'lucide-react';

interface UploadedFile {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  url?: string;
  linkedTo?: 'event' | 'budgetItem' | 'report';
  linkedId?: string;
}

interface FileUploadManagerProps {
  eventId?: string;
  budgetItemId?: string;
  reportId?: string;
  onUpload?: (files: File[]) => void;
}

export const FileUploadManager: React.FC<FileUploadManagerProps> = ({
  eventId,
  budgetItemId,
  reportId,
  onUpload,
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([
    {
      id: '1',
      filename: 'invoice_001.pdf',
      mimeType: 'application/pdf',
      size: 245000,
      uploadedAt: new Date().toISOString(),
      linkedTo: 'budgetItem',
    },
    {
      id: '2',
      filename: 'receipt_catering.jpg',
      mimeType: 'image/jpeg',
      size: 180000,
      uploadedAt: new Date().toISOString(),
      linkedTo: 'event',
    },
    {
      id: '3',
      filename: 'budget_summary.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: 52000,
      uploadedAt: new Date().toISOString(),
      linkedTo: 'report',
    },
  ]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFileUpload(droppedFiles);
  };

  const handleFileUpload = (selectedFiles: File[]) => {
    const newFiles: UploadedFile[] = selectedFiles.map((file) => ({
      id: crypto.randomUUID(),
      filename: file.name,
      mimeType: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      linkedTo: budgetItemId ? 'budgetItem' : eventId ? 'event' : 'report',
      linkedId: budgetItemId || eventId || reportId,
    }));

    setFiles([...files, ...newFiles]);
    onUpload?.(selectedFiles);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(Array.from(e.target.files));
    }
  };

  const deleteFile = (id: string) => {
    setFiles(files.filter((f) => f.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="w-5 h-5 text-blue-500" />;
    if (mimeType.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
        }`}
      >
        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 mb-2">Drag and drop files here, or click to browse</p>
        <p className="text-sm text-gray-400 mb-4">Supports: PDF, Images, Excel, Word (Max 10MB)</p>
        <label className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
          <input type="file" multiple onChange={handleFileInput} className="hidden" accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.doc,.docx" />
          Select Files
        </label>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium text-gray-700">Uploaded Files ({files.length})</h3>
          <div className="space-y-2">
            {files.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 flex-1">
                  {getFileIcon(file.mimeType)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{file.filename}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)} • Uploaded {new Date(file.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Preview">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Download">
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteFile(file.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
