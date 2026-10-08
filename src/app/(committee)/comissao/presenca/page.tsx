import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { Button } from '@/components/ui/Button/Button';
import QrScanner from './QrScanner';
import { getLecturesForAttendance } from '@/actions/lectures';
import styles from './page.module.css';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Controle de Presença - Comissão',
};

export default async function AttendancePage() {
  const lectures = await getLecturesForAttendance();

  return (
    <div className={styles.container}>
      <SectionHeading 
        title="Controle de Presença" 
        subtitle="Escaneie o QR Code dos participantes para registrar presença" 
      />
      
      <QrScanner lectures={lectures.map((l: any) => ({ id: l.id, title: l.title }))} />
      
      <div className={styles.lecturesSection}>
        <SectionHeading 
          title="Atividades" 
          subtitle="Acompanhe a presença nas atividades programadas" 
        />
        
        <div className={styles.lecturesGrid}>
          {lectures.map((lecture: any) => {
            const attendanceRatio = lecture.totalEnrolled > 0 
              ? (lecture.totalAttended / lecture.totalEnrolled) * 100 
              : 0;
              
            return (
              <div key={lecture.id} className={styles.lectureCard}>
                <div className={styles.lectureHeader}>
                  <h3 className={styles.lectureTitle}>{lecture.title}</h3>
                  <p className={styles.lectureSpeaker}>{lecture.speaker}</p>
                </div>
                
                <div className={styles.lectureMeta}>
                  <span>
                    📅 {new Date(lecture.startTime).toLocaleDateString('pt-BR')} 
                    {' • '}
                    {new Date(lecture.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} 
                    {' - '}
                    {new Date(lecture.endTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span>📍 {lecture.location}</span>
                </div>
                
                <div className={styles.attendanceStats}>
                  <div className={styles.statsRow}>
                    <span className={styles.statLabel}>Presenças</span>
                    <span className={styles.statValue}>
                      {lecture.totalAttended} / {lecture.totalEnrolled}
                    </span>
                  </div>
                  
                  <div className={styles.attendanceBar}>
                    <div 
                      className={styles.attendanceFill} 
                      style={{ width: `${attendanceRatio}%` }}
                    />
                  </div>
                </div>
                
                <div className={styles.cardAction}>
                  <Link href={`/comissao/presenca/${lecture.id}`} passHref legacyBehavior>
                    <Button variant="outline" fullWidth>
                      Ver Detalhes
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
        
        {lectures.length === 0 && (
          <p className={cn(styles.statValue, "text-center py-8")}>
            Nenhuma atividade programada para controle de presença.
          </p>
        )}
      </div>
    </div>
  );
}
