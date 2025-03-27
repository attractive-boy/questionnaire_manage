'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function QuestionnairesPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard/questionnaires/1');
  }, [router]);

  return null;
}