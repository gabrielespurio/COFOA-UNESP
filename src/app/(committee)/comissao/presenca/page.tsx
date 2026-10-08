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
            
            const now = new Date();
            const start = new Date(lecture.startTime);
            const end = new Date(lecture.endTime);
            const isOngoing = now >= start && now <= end;
            const isFinished = now > end;
            
            let statusText = 'Em Breve';
            let statusClass = styles.statusUpcoming;
            if (isOngoing) {
              statusText = 'Acontecendo Agora';
              statusClass = styles.statusOngoing;
            } else if (isFinished) {
              statusText = 'Finalizada';
              statusClass = styles.statusFinished;
            }

            const speakerInitials = lecture.speaker !== '-' && lecture.speaker !== 'Intervalo'
              ? lecture.speaker.split(' ').filter((n: string) => n.length > 2).map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
              : 'CO';

            return (
              <div key={lecture.id} className={styles.lectureCard}>
                <div className={cn(styles.cardBadge, statusClass)}>
                  {statusText}
                </div>
                
                <div className={styles.cardContentWrapper}>
                  <div className={styles.lectureHeader}>
                    <div className={styles.speakerAvatar}>
                      {speakerInitials}
                    </div>
                    <div>
                      <h3 className={styles.lectureTitle} title={lecture.title}>{lecture.title}</h3>
                      <p className={styles.lectureSpeaker}>{lecture.speaker}</p>
                    </div>
                  </div>
                  
                  <div className={styles.lectureMeta}>
                    <span className={styles.metaBadge}>
                      📅 {start.toLocaleDateString('pt-BR')} 
                    </span>
                    <span className={styles.metaBadge}>
                      🕒 {start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} 
                      {' às '}
                      {end.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={styles.metaBadge}>
                      📍 {lecture.location || 'A confirmar'}
                    </span>
                  </div>
                  
                  <div className={styles.attendanceStats}>
                    <div className={styles.statsRow}>
                      <span className={styles.statLabel}>Registros de Presença</span>
                      <span className={styles.statValue}>
                        {lecture.totalAttended} <span style={{ fontSize: '0.85em', color: 'var(--color-text-muted)' }}>(Entradas)</span>
                      </span>
                    </div>
                    
                    <div className={styles.attendanceBar}>
                      <div 
                        className={styles.attendanceFill} 
                        style={{ 
                          width: `${Math.min(100, attendanceRatio)}%`,
                          backgroundColor: attendanceRatio > 0 ? 'var(--color-primary)' : 'transparent' 
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className={styles.cardAction}>
                    <Link href={`/comissao/presenca/${lecture.id}`} passHref legacyBehavior>
                      <Button variant={isOngoing ? 'primary' : 'outline'} fullWidth>
                        Gerenciar Presenças
                      </Button>
                    </Link>
                  </div>
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
