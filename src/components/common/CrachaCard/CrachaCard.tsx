'use client';

import React from 'react';
import { QrCodeDisplay } from '@/app/(participant)/area-participante/programacao/meus-qrcodes/QrCodeDisplay';
import styles from './CrachaCard.module.css';

interface CrachaCardProps {
  fullName: string;
  categoryName?: string | null;
  institution?: string | null;
  participantId: string;
  cpf?: string | null;
  showPrintButton?: boolean;
  qrSize?: number;
}

export function CrachaCard({
  fullName,
  categoryName,
  institution,
  participantId,
  cpf,
  showPrintButton = true,
  qrSize = 150,
}: CrachaCardProps) {
  const handlePrint = () => {
    window.print();
  };

  const formattedCpf = cpf ? cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '***.$2.$3-**') : null;

  return (
    <div className={styles.crachaWrapper}>
      <div className={`${styles.crachaCard} ${styles.printOnlyArea}`}>
        <div className={styles.crachaBody}>
          <h1 className={styles.participantName}>
            {fullName}
          </h1>

          <div className={styles.qrContainer}>
            <QrCodeDisplay token={participantId} size={qrSize} />
          </div>
        </div>
      </div>

      {showPrintButton && (
        <button 
          type="button" 
          onClick={handlePrint} 
          className={`${styles.printBtn} ${styles.noPrint}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
          Imprimir Crachá
        </button>
      )}
    </div>
  );
}
