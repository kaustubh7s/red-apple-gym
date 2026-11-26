import React from 'react';
import PassClient from './PassClient';
import { initialMembers } from '@/lib/data';

// dynamicParams removed

export function generateStaticParams() {
  const ids = initialMembers.flatMap((m) => [m.id, m.memberId]);
  const extra = [
    '[id]',
    'lookup',
    'RED-1071',
    'RED-1864',
    'RED-1011',
    'RED-7258',
    'RED-3049',
    'RED-3051',
    'RED-3809',
    'RED-2576',
    'RED-9256',
    'RED-8021', 'RED-8022', 'RED-8023', 'RED-8024',
    'RED-8025', 'RED-8026', 'RED-8027', 'RED-8028', 'RED-8029',
    'RAG-2024-001', 'RAG-2024-002'
  ];
  const uniqueIds = Array.from(new Set([...ids, ...extra]));
  return uniqueIds.map((id) => ({ id }));
}

export default async function MemberPassPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <PassClient id={resolvedParams.id} />;
}
