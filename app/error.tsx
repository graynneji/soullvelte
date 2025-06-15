'use client';

import { useEffect } from 'react';
import { useFetchErrorModal } from './_components/FetchErrorModal/FetchErrorModal';


export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  const { showError, ErrorModal } = useFetchErrorModal();

  useEffect(() => {
    // Show the error modal whenever a global error occurs
    showError('general', {
      onRetry: async () => reset(), // Try to recover by resetting the error boundary
      showCloseButton: false,
    });
  }, [error, showError, reset]);

  return (
    <>
      {ErrorModal}
      {/* Optionally, you can also show fallback UI here */}
    </>
  );
}