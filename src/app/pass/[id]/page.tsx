import React from 'react';
import PassClient from './PassClient';
import { initialMembers } from '@/lib/data';
import { supabase } from '@/lib/supabaseClient';

export async function generateStaticParams() {
  const ids = new Set<string>();

  // Add initial members
  initialMembers.forEach((m) => {
    if (m.id) ids.add(m.id);
    if (m.memberId) ids.add(m.memberId);
  });

  // Known members & recent IDs
  const extra = [
    'lookup',
    'RED-1071',
    'RED-1450',
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
  extra.forEach((id) => ids.add(id));

  // Query Supabase members
  if (supabase) {
    try {
      const { data } = await supabase.from('members').select('id, member_id');
      if (data && Array.isArray(data)) {
        data.forEach((m: any) => {
          if (m.id) ids.add(m.id);
          if (m.member_id) ids.add(m.member_id);
        });
      }
    } catch (e) {}
  }

  return Array.from(ids).map((id) => ({ id }));
}

export default async function MemberPassPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <PassClient id={resolvedParams.id} />;
}
