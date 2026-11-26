'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PassClient from './[id]/PassClient';

function PassPageContent() {
  const searchParams = useSearchParams();
  const [resolvedId, setResolvedId] = React.useState<string>(() => {
    return searchParams.get('id') || searchParams.get('mId') || '';
  });

  React.useEffect(() => {
    let id = searchParams.get('id') || searchParams.get('mId') || '';
    if (!id && typeof window !== 'undefined') {
      const parts = window.location.pathname.split('/').filter(Boolean);
      const lastPart = parts[parts.length - 1];
      if (lastPart && lastPart !== 'pass' && !lastPart.includes('[')) {
        id = decodeURIComponent(lastPart);
      }
    }
    if (id) setResolvedId(id);
  }, [searchParams]);

  return <PassClient id={resolvedId} />;
}

export default function StandalonePassPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B0C0E] text-white flex items-center justify-center font-sans text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E50914] animate-ping" />
            <span>Loading Digital Member Pass...</span>
          </div>
        </div>
      }
    >
      <PassPageContent />
    </Suspense>
  );
}

