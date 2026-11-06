import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { getLectureAttendance } from '@/actions/lectures';
import { formatBRTDateTime, formatBRTDate, formatBRTTime } from '@/lib/formatDate';
import styles from './page.module.css';

interface PageProps {
  params: Promise<{
    lectureId: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `Detalhes de Presença - Comissão`,
  };
}

export default async function LectureAttendancePage({ params }: PageProps) {
  const { lectureId } = await params;
  
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
          <h1 className={styles.lectureTitle}>
            {lecture.isKitPickup ? `🎁 ${lecture.title}` : lecture.title}
          </h1>
          <p className={styles.lectureSpeaker}>{lecture.speaker}</p>
        </div>
        
        <div className={styles.lectureMeta}>
          <span className={styles.metaItem}>
            📅 {formatBRTDate(lecture.startTime)}
          </span>
          <span className={styles.metaItem}>
            🕒 {formatBRTTime(lecture.startTime, false)} - {formatBRTTime(lecture.endTime, false)}
          </span>
          <span className={styles.metaItem}>
            📍 {lecture.location}
          </span>
        </div>
        
        <div className={styles.statsBar}>
          {lecture.isKitPickup ? (
            <>
              <div className={styles.statBox}>
                <span className={styles.statLabel}>Brindes Retirados</span>
                <span className={styles.statValue} style={{ color: '#166534' }}>{entries.length}</span>
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
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
                <th className={styles.th}>Horário da Leitura (Brasília)</th>
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
                        {lecture.isKitPickup ? '🎁 BRINDE RETIRADO' : isEntry ? 'ENTRADA' : 'SAÍDA'}
                      </span>
                    </td>
                    <td className={styles.td}>
                      {formatBRTDateTime(attendance.scannedAt)}
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
