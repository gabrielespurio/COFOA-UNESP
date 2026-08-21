export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
}

export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '');
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ').trim();
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'paid':
    case 'accepted':
    case 'active':
      return 'var(--color-success)';
    case 'pending':
    case 'processing':
    case 'under_review':
    case 'upcoming':
      return 'var(--color-warning)';
    case 'failed':
    case 'cancelled':
    case 'rejected':
      return 'var(--color-error)';
    case 'draft':
    case 'closed':
    case 'refunded':
    default:
      return 'var(--color-text-muted)';
  }
}

