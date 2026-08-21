import { cookies } from 'next/headers';

// Pega a data atual no fuso horário de Brasília (UTC-3), mas permitindo a simulação (Time Travel)
export async function getCurrentDate() {
  const cookieStore = await cookies();
  const simulatedDateStr = cookieStore.get('simulated_date')?.value;

  if (simulatedDateStr) {
    const simulatedDate = new Date(simulatedDateStr);
    if (!isNaN(simulatedDate.getTime())) {
      return simulatedDate;
    }
  }

  // Se não tiver simulador ativo, usa a data atual
  // Como estamos no Node.js/Vercel, new Date() retorna UTC.
  return new Date();
}

// Verifica o status do lote com base na data fornecida
export function getBatchStatus(startDateStr: string | null, endDateStr: string | null, currentDate: Date): 'UPCOMING' | 'ACTIVE' | 'SOLD_OUT' {
  if (!startDateStr || !endDateStr) {
    return 'UPCOMING';
  }

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  if (currentDate < startDate) {
    return 'UPCOMING';
  } else if (currentDate > endDate) {
    return 'SOLD_OUT';
  } else {
    return 'ACTIVE';
  }
}

// Formata uma data para visualização curta (DD/MM)
export function formatShortDate(dateStr: string | null) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}
