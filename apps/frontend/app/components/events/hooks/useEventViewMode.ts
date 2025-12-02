/**
 * Hook for managing event view mode (card/table)
 */

import { useState, useEffect } from 'react';

export type ViewMode = 'card' | 'table';

const VIEW_MODE_STORAGE_KEY = 'eventsViewMode';

export function useEventViewMode() {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [isMobile, setIsMobile] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize view mode based on screen size and saved preference
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initializeViewMode = () => {
      // Check if user has a saved preference first
      const savedViewMode = localStorage.getItem(VIEW_MODE_STORAGE_KEY) as ViewMode | null;
      if (savedViewMode && (savedViewMode === 'card' || savedViewMode === 'table')) {
        setViewMode(savedViewMode);
      } else {
        // Default: card for mobile (< 768px), table for desktop
        const mobile = window.innerWidth < 768;
        setIsMobile(mobile);
        setViewMode(mobile ? 'card' : 'table');
      }
      setIsInitialized(true);
    };

    initializeViewMode();
  }, []);

  // Detect mobile viewport and update isMobile state on resize
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Only auto-switch view mode if user hasn't manually changed it
      // (i.e., if there's no saved preference)
      if (!isInitialized) return;

      const savedViewMode = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
      if (!savedViewMode) {
        // No saved preference, auto-switch based on screen size
        setViewMode(mobile ? 'card' : 'table');
      }
    };

    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isInitialized]);

  // Save view mode preference when user manually changes it (but not on initial load)
  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
  }, [viewMode, isInitialized]);

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  return {
    viewMode,
    setViewMode: handleViewModeChange,
    isMobile,
    isInitialized,
  };
}

