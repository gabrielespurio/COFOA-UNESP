import React from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
export const metadata = {
  title: 'Programação',
};

export default function ProgramacaoPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <SectionHeading title="Programação do Evento" />
      <p style={{ color: 'var(--color-text-secondary)' }}>
        Acompanhe a programação completa do COFOA XV e inscreva-se nas palestras que mais combinam com a sua jornada acadêmica.
      </p>

      <div style={{ 
        background: '#fff', 
        border: '1px solid var(--color-border-light)', 
        borderRadius: '8px', 
        padding: '3rem',
        textAlign: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '1rem' }}>
          Em Breve
        </h3>
        <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
          A grade científica do COFOA XV está sendo cuidadosamente preparada pela nossa comissão.<br />
          Em breve divulgaremos todos os detalhes das palestras e workshops.
        </p>
      </div>
    </div>
  );
}
