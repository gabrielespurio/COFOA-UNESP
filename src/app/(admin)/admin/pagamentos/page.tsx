import { Metadata } from 'next';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';

export const metadata: Metadata = {
  title: 'Pagamentos',
};

export default function AdminPagamentosPage() {
  return (
    <div>
      <SectionHeading title="Pagamentos" />
      <div style={{
        marginTop: '2rem', padding: '3rem', textAlign: 'center', 
        background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--color-gray-300)'
      }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Módulo de pagamentos em desenvolvimento</p>
      </div>
    </div>
  );
}
