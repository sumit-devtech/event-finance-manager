/**
 * Receipt File Item Component with Image Preview
 */

import { useState, useEffect } from 'react';
import { FileText, Image as ImageIcon, X, Download, Loader } from "~/components/Icons";
import { formatDate } from "~/lib/utils";
import { isImageFile } from "./utils/expenseHelpers";
import { EXPENSE_LABELS, EXPENSE_MESSAGES } from "~/constants/expenses";
import { API_ENDPOINTS, DEFAULT_STRINGS } from "~/constants/common";
import { env } from "~/lib/env";
import toast from "react-hot-toast";

interface ReceiptFileItemProps {
  file: any;
  onDownload: (fileId: string, filename: string) => void;
}

export function ReceiptFileItem({ file, onDownload }: ReceiptFileItemProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const isImage = isImageFile(file.mimeType, file.filename || '');

  useEffect(() => {
    if (isImage && showPreview && !imageUrl && !imageError) {
      setLoadingImage(true);
      const loadImage = async () => {
        try {
          const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
          const url = `${env.API_BASE_URL}${API_ENDPOINTS.FILES(file.id)}`;

          const response = await fetch(url, {
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
            },
          });

          if (response.ok) {
            const blob = await response.blob();

            if (blob.size === 0) {
              console.error('Image blob is empty');
              setImageError(true);
            } else {
              const blobUrl = window.URL.createObjectURL(blob);
              setImageUrl(blobUrl);
            }
          } else {
            setImageError(true);
          }
        } catch (error) {
          console.error('Error loading image:', error);
          setImageError(true);
        } finally {
          setLoadingImage(false);
        }
      };
      loadImage();
    }

    // Cleanup blob URL on unmount
    return () => {
      if (imageUrl) {
        window.URL.revokeObjectURL(imageUrl);
      }
    };
  }, [isImage, file.id, imageUrl, imageError, showPreview]);

  const fileSize = file.size ? `${(file.size / 1024).toFixed(2)} KB` : DEFAULT_STRINGS.UNKNOWN_SIZE;
  const fileType = file.mimeType ? file.mimeType.split('/')[1] || file.mimeType : DEFAULT_STRINGS.UNKNOWN;

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {isImage ? (
              <ImageIcon size={16} className="text-blue-600 flex-shrink-0" />
            ) : (
              <FileText size={16} className="text-gray-500 flex-shrink-0" />
            )}
            <span className="text-gray-900 font-medium truncate">{file.filename || DEFAULT_STRINGS.UNTITLED}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{fileSize}</span>
            {file.mimeType && (
              <span className="capitalize">{fileType}</span>
            )}
            {file.uploadedAt && (
              <span>{formatDate(new Date(file.uploadedAt))}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isImage && (
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0"
              title={showPreview ? EXPENSE_LABELS.HIDE_PREVIEW : EXPENSE_LABELS.SHOW_PREVIEW}
            >
              {showPreview ? (
                <>
                  <X size={16} />
                  <span className="text-sm">{EXPENSE_LABELS.HIDE}</span>
                </>
              ) : (
                <>
                  <ImageIcon size={16} />
                  <span className="text-sm">{EXPENSE_LABELS.PREVIEW}</span>
                </>
              )}
            </button>
          )}
          <button
            onClick={() => onDownload(file.id, file.filename || DEFAULT_STRINGS.FILE)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
            title={EXPENSE_LABELS.DOWNLOAD_FILE}
          >
            <Download size={16} />
            <span className="text-sm">{EXPENSE_LABELS.DOWNLOAD}</span>
          </button>
        </div>
      </div>
      {isImage && showPreview && (
        <div className="mt-4 rounded-lg overflow-hidden border border-gray-200 bg-white relative">
          {loadingImage && (
            <div className="flex items-center justify-center p-8 text-gray-500">
              <div className="text-center">
                <Loader size={24} className="animate-spin mx-auto mb-2 text-gray-400" />
                <p className="text-sm">{EXPENSE_LABELS.LOADING_PREVIEW}</p>
              </div>
            </div>
          )}
          {imageError && (
            <div className="flex items-center justify-center p-8 text-gray-500">
              <div className="text-center">
                <ImageIcon size={48} className="mx-auto mb-2 text-gray-400" />
                <p className="text-sm mb-2">{EXPENSE_LABELS.PREVIEW_NOT_AVAILABLE}</p>
                <button
                  onClick={() => {
                    setImageError(false);
                    setImageUrl(null);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 underline"
                >
                  {EXPENSE_LABELS.RETRY}
                </button>
              </div>
            </div>
          )}
          {imageUrl && !imageError && (
            <div className="relative">
              <button
                onClick={() => setShowPreview(false)}
                className="absolute top-2 right-2 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                title={EXPENSE_LABELS.CLOSE_PREVIEW}
              >
                <X size={16} />
              </button>
              <img
                src={imageUrl}
                alt={file.filename || 'Receipt preview'}
                className="w-full h-auto max-h-96 object-contain"
                onError={() => {
                  console.error('Image load error in img tag');
                  setImageError(true);
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}


