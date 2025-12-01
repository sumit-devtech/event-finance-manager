import { useEffect, useRef } from 'react';
import type { FetcherWithComponents } from '@remix-run/react';

interface UseFormSubmissionOptions {
  fetcher: FetcherWithComponents<any>;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  isDemo?: boolean;
}

/**
 * Hook to handle form submission with fetcher and auto-close modal on success
 * Tracks fetcher state and closes modal when submission completes successfully
 */
export function useFormSubmission({
  fetcher,
  onSuccess,
  onError,
  isDemo = false,
}: UseFormSubmissionOptions) {
  const previousState = useRef(fetcher.state);
  const isLoading = fetcher.state !== 'idle';

  useEffect(() => {
    if (isDemo) return;

    const wasSubmitting = previousState.current === 'submitting' || previousState.current === 'loading';
    const isNowIdle = fetcher.state === 'idle';

    // When fetcher goes from submitting/loading back to idle
    if (wasSubmitting && isNowIdle) {
      // Check if there's an error in the response
      if (fetcher.data && typeof fetcher.data === 'object' && 'error' in fetcher.data) {
        // Call error handler if provided
        if (onError) {
          onError(fetcher.data.error as string);
        }
        previousState.current = fetcher.state;
        return;
      }
      // Call success handler (typically closes modal)
      if (onSuccess) {
        onSuccess();
      }
    }

    previousState.current = fetcher.state;
  }, [fetcher.state, fetcher.data, onSuccess, onError, isDemo]);

  return { isLoading };
}

