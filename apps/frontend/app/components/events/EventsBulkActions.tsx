import { Archive, Copy, Download, X } from '../Icons';

interface EventsBulkActionsProps {
  selectedCount: number;
  onArchive: () => void;
  onDuplicate: () => void;
  onExport: () => void;
  onClear: () => void;
  canPerformBulkActions: boolean;
}

export function EventsBulkActions({
  selectedCount,
  onArchive,
  onDuplicate,
  onExport,
  onClear,
  canPerformBulkActions,
}: EventsBulkActionsProps) {
  if (selectedCount === 0 || !canPerformBulkActions) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-blue-900 text-sm">
        {selectedCount} event(s) selected
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onArchive}
          className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm"
        >
          <Archive size={16} />
          <span>Archive</span>
        </button>
        <button
          onClick={onDuplicate}
          className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm"
        >
          <Copy size={16} />
          <span>Duplicate</span>
        </button>
        <button
          onClick={onExport}
          className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm"
        >
          <Download size={16} />
          <span>Export</span>
        </button>
        <button
          onClick={onClear}
          className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

