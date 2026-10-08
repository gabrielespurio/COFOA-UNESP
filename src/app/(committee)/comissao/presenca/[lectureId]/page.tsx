import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { getLectureAttendance } from '@/actions/lectures';
import styles from './page.module.css';

interface PageProps {
  params: {
    lectureId: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `Detalhes de Presença - Comissão`,
  };
}

export default async function LectureAttendancePage({ params }: PageProps) {
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

  const entries = lecture.attendances.filter((a: any) => a.type === 'ENTRY');
  const exits = lecture.attendances.filter((a: any) => a.type === 'EXIT');

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
            <span className={styles.statLabel}>Total Registros</span>
            <span className={styles.statValue}>{lecture.attendances.length}</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Entradas</span>
            <span className={styles.statValue}>{entries.length}</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Saídas</span>
            <span className={styles.statValue}>{exits.length}</span>
          </div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        {lecture.attendances.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Nome do Participante</th>
                <th className={styles.th}>E-mail</th>
                <th className={styles.th}>Ação</th>
                <th className={styles.th}>Horário da Leitura</th>
              </tr>
            </thead>
            <tbody>
              {lecture.attendances.map((attendance: any) => {
                const isEntry = attendance.type === 'ENTRY';
                
                return (
                  <tr key={attendance.id} className={styles.tr}>
                    <td className={styles.td}>
                      <strong>{attendance.participantName}</strong>
                    </td>
                    <td className={styles.td}>{attendance.participantEmail}</td>
                    <td className={styles.td}>
                      <span className={`${styles.statusBadge} ${isEntry ? styles.statusAttended : styles.statusEnrolled}`}>
                        {isEntry ? 'ENTRADA' : 'SAÍDA'}
                      </span>
                    </td>
                    <td className={styles.td}>
                      {new Date(attendance.scannedAt).toLocaleString('pt-BR')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className={styles.emptyState}>
            <p>Nenhuma leitura registrada nesta atividade.</p>
          </div>
        )}
      </div>
    </div>
  );
}
