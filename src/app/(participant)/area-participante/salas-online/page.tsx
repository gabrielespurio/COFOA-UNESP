import React from 'react';
import { Metadata } from 'next';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { OnlineRoomsQuickAccess } from '../OnlineRoomsQuickAccess';

export const metadata: Metadata = {
  title: 'Salas Online (Google Meet) — COFOA XV',
  description: 'Acesso rápido às salas virtuais do Google Meet para apresentação de trabalhos online do COFOA XV (25/11/2026).',
};

export default function SalasOnlinePage() {
  return (
    <div style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <SectionHeading
        overline="Apresentações Virtuais"
        title="Salas Online — Google Meet"
        subtitle="Acesse diretamente as salas de transmissão das apresentações orais de quarta-feira (25/11/2026)."
      />
      <OnlineRoomsQuickAccess />
    </div>
  );
}
