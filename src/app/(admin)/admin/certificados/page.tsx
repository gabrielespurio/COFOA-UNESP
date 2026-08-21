import { Metadata } from 'next';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';

export const metadata: Metadata = {
  title: 'Certificados',
};

export default function AdminCertificadosPage() {
  return (
    <div>
      <SectionHeading title="Certificados" />
      <div style={{
        marginTop: '2rem', padding: '3rem', textAlign: 'center', 
        background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--color-gray-300)'
      }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Módulo de certificados em desenvolvimento</p>
      </div>
    </div>
  );
}
