'use server';

import { cookies } from 'next/headers';

export async function setSimulatedDate(dateString: string | null) {
  const cookieStore = await cookies();
  
  if (dateString) {
    // Valida se é uma data válida
    const d = new Date(dateString);
    if (!isNaN(d.getTime())) {
      cookieStore.set('simulated_date', dateString, { path: '/' });
    }
  } else {
    cookieStore.delete('simulated_date');
  }
}
