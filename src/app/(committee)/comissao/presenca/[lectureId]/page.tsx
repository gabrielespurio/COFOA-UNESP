import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { getLectureAttendance, getLecturesForAttendance } from '@/actions/lectures';
import styles from './page.module.css';

interface PageProps {
  params: {
    lectureId: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // Try to find the title, but fallback if not available
  return {
    title: `Detalhes de Presença - Comissão`,
  };
}

export default async function LectureAttendancePage({ params }: PageProps) {
  // Await the params object according to Next.js 15+ constraints if this is Next 15,
  // but the prompt says Next.js 16 (React 19). We will access params.lectureId asynchronously if needed,
  // however `params` is a promise in Next 15+.
  const { lectureId } = await Promise.resolve(params);
  
  const lecture = await getLectureAttendance(lectureId);

  if (!lecture) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>
          <h2>Atividade não encontrada</h2>
          <p>A atividade solicitada não existe ou você não tem permissão para acessá-la.</p>
          <Link href="/comissao/presenca" className={styles.backLink} style={{ marginTop: '1rem', display: 'inline-block' }}>
            ← Voltar para Presença
          </Link>
        </div>
      </div>
    );
  }

  const totalEnrolled = lecture.enrollments.length;
  const totalAttended = lecture.enrollments.filter((e: any) => e.status === 'ATTENDED' || e.checkedInAt).length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/comissao/presenca" className={styles.backLink}>
          ← Voltar para Lista de Atividades
        </Link>
        
        <div>
          <h1 className={styles.lectureTitle}>{lecture.title}</h1>
          <p className={styles.lectureSpeaker}>{lecture.speaker}</p>
        </div>
        
        <div className={styles.lectureMeta}>
          <span className={styles.metaItem}>
            📅 {new Date(lecture.startTime).toLocaleDateString('pt-BR')}
          </span>
          <span className={styles.metaItem}>
            🕒 {new Date(lecture.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {new Date(lecture.endTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className={styles.metaItem}>
            📍 {lecture.location}
          </span>
        </div>
        
        <div className={styles.statsBar}>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Total Inscritos</span>
            <span className={styles.statValue}>{totalEnrolled}</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Total Presentes</span>
            <span className={styles.statValue}>{totalAttended}</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Taxa de Presença</span>
            <span className={styles.statValue}>
              {totalEnrolled > 0 ? Math.round((totalAttended / totalEnrolled) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        {lecture.enrollments.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Nome do Participante</th>
                <th className={styles.th}>E-mail</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Horário Check-in</th>
              </tr>
            </thead>
            <tbody>
              {lecture.enrollments.map((enrollment: any) => {
                const isAttended = enrollment.status === 'ATTENDED' || !!enrollment.checkedInAt;
                
                return (
                  <tr key={enrollment.id} className={styles.tr}>
                    <td className={styles.td}>
                      <strong>{enrollment.participantName}</strong>
                    </td>
                    <td className={styles.td}>{enrollment.participantEmail}</td>
                    <td className={styles.td}>
                      <span className={`${styles.statusBadge} ${isAttended ? styles.statusAttended : styles.statusEnrolled}`}>
                        {isAttended ? 'Presente' : 'Inscrito'}
                      </span>
                    </td>
                    <td className={styles.td}>
                      {enrollment.checkedInAt 
                        ? new Date(enrollment.checkedInAt).toLocaleString('pt-BR') 
                        : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className={styles.emptyState}>
            <p>Nenhum participante inscrito nesta atividade.</p>
          </div>
        )}
      </div>
    </div>
  );
}
