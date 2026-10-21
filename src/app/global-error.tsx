'use client';

import React from 'react';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="flex min-h-screen items-center justify-center bg-zinc-50 p-6 text-center">
        <div className="max-w-md rounded-2xl bg-white p-6 shadow-md border border-zinc-200">
          <h2 className="text-lg font-bold text-zinc-900 mb-2">Something went wrong</h2>
          <p className="text-xs text-zinc-500 mb-4">An error occurred while loading this view.</p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-700 text-white"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
