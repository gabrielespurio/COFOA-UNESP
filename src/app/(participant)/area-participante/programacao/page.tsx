import React from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { Button } from '@/components/ui/Button/Button';

export const metadata = {
  title: 'Programação',
};

const MOCK_LECTURES = Array.from({ length: 10 }).map((_, i) => ({
  id: i + 1,
  title: `Palestra Inovadora em Odontologia ${i + 1}`,
  description: 'Uma visão profunda sobre as novas tecnologias e práticas clínicas que estão moldando o futuro da nossa área. Venha aprender com os melhores especialistas e transformar seu dia a dia clínico.',
  speaker: `Dr. Palestrante ${i + 1}`,
  time: `10:00 - 11:30`,
  date: '25/10/2026',
}));

export default function ProgramacaoPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <SectionHeading title="Programação do Evento" />
      <p style={{ color: 'var(--color-text-secondary)' }}>
        Acompanhe a programação completa do COFOA XV e inscreva-se nas palestras que mais combinam com a sua jornada acadêmica.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {MOCK_LECTURES.map((lecture) => (
          <div key={lecture.id} style={{ 
            background: '#fff', 
            border: '1px solid var(--color-border-light)', 
            borderRadius: '8px', 
            padding: '1.5rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                  {lecture.date} | {lecture.time}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
                  {lecture.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1rem', fontWeight: 500 }}>
                  Com {lecture.speaker}
                </p>
                <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                  {lecture.description}
                </p>
              </div>
              <div>
                <Button variant="outline" size="sm">
                  Inscrever-se
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
