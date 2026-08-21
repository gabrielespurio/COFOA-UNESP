import { Metadata } from 'next';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';

export const metadata: Metadata = {
  title: 'Cupons',
};

export default function AdminCuponsPage() {
  return (
    <div>
      <SectionHeading title="Cupons" />
      <div style={{
        marginTop: '2rem', padding: '3rem', textAlign: 'center', 
        background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--color-gray-300)'
      }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Módulo de cupons em desenvolvimento</p>
      </div>
    </div>
  );
}
