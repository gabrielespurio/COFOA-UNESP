import React from 'react';
import { Metadata } from 'next';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { ApresentacaoTrabalhosClient } from './ApresentacaoTrabalhosClient';

export const metadata: Metadata = {
  title: 'Apresentação de Trabalhos — COFOA XV',
  description: 'Cronograma completo de apresentações dos trabalhos científicos do COFOA XV com salas, totens e horários.',
};

export default function ApresentacaoTrabalhosPage() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <SectionHeading
        overline="Grade Científica"
        title="Apresentação de Trabalhos"
        subtitle="Consulte os horários, salas virtuais/totens e autores das apresentações científicas do COFOA XV."
      />
      <ApresentacaoTrabalhosClient />
    </div>
  );
}
