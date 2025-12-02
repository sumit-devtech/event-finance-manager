/**
 * Receipt Files List Component
 */

import { FileText } from "~/components/Icons";
import { ReceiptFileItem } from "./ReceiptFileItem";
import { EXPENSE_LABELS, DEFAULT_EXPENSE_VALUES } from "~/constants/expenses";
import { isImageFile } from "./utils/expenseHelpers";

interface ReceiptFilesListProps {
  files: any[];
  onDownload: (fileId: string, filename: string) => void;
}

export function ReceiptFilesList({ files, onDownload }: ReceiptFilesListProps) {
  if (!files || files.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText size={48} className="mx-auto mb-2 text-gray-400" />
        <p className="text-sm">{EXPENSE_LABELS.NO_RECEIPT_FILES}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {files.map((file: any) => (
        <ReceiptFileItem
          key={file.id}
          file={file}
          onDownload={onDownload}
        />
      ))}
    </div>
  );
}


