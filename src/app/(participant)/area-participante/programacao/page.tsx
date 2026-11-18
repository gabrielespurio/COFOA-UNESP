import React from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { getLectures, getMyEnrolledLectureIds } from '@/actions/lectures';
import { ParticipantProgramacaoClient } from './ParticipantProgramacaoClient';

export const metadata = {
  title: 'Programação & Inscrições — COFOA XV',
};

export default async function ProgramacaoPage() {
  const [lectures, enrolledIds] = await Promise.all([
    getLectures(),
    getMyEnrolledLectureIds(),
  ]);

  // Serialize date objects for client component
  const serializedLectures = lectures.map((lecture: any) => ({
    id: lecture.id,
    title: lecture.title,
    description: lecture.description,
    speaker: lecture.speaker,
    location: lecture.location,
    startTime: lecture.startTime.toISOString(),
    endTime: lecture.endTime.toISOString(),
    _count: lecture._count,
  }));

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '3rem' }}>
      <SectionHeading
        title="Programação & Inscrição em Atividades"
        subtitle="Inscreva-se nas palestras científicas e nos workshops práticos laboratoriais (Hands-On e Mini-Hands com limite de 20 vagas)."
      />

      <ParticipantProgramacaoClient
        lectures={serializedLectures}
        enrolledIds={enrolledIds}
      />
    </div>
  );
}
