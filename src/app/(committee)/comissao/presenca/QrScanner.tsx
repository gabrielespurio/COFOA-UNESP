'use client';

import React, { useEffect, useState, useRef } from 'react';
import styles from './page.module.css';
import { Button } from '@/components/ui/Button/Button';
import { checkInByQrToken } from '@/actions/lectures';

type ScanResult = {
  success: boolean;
  message?: string;
  data?: {
    participantName: string;
    lectureTitle: string;
    lectureId: string;
    checkedInAt: string;
    alreadyCheckedIn?: boolean;
  };
  error?: string;
};

export default function QrScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    if (isScanning && !scanResult) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isScanning, scanResult]);

  const startScanner = async () => {
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };

      await html5QrCode.start(
        { facingMode: 'environment' },
        config,
        async (decodedText) => {
          if (!isProcessing) {
            handleScan(decodedText);
          }
        },
        () => {
          // Ignore parse errors
        }
      );
    } catch (err) {
      console.error('Error starting scanner', err);
      setIsScanning(false);
      setScanResult({
        success: false,
        error: 'Não foi possível iniciar a câmera. Verifique as permissões.',
      });
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner', err);
      }
    }
  };

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      
      oscillator.start();
      setTimeout(() => oscillator.stop(), 150);
    } catch (e) {
      console.error('Audio feedback failed', e);
    }
  };

  const handleScan = async (decodedText: string) => {
    setIsProcessing(true);
    playBeep();
    
    // We stop the visual scanning, let user see result
    stopScanner();
    
    try {
      const response = await checkInByQrToken(decodedText);
      setScanResult(response as ScanResult);
    } catch (error) {
      setScanResult({
        success: false,
        error: 'Erro ao processar o QR Code. Tente novamente.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setIsScanning(true);
  };

  return (
    <div className={styles.scannerSection}>
      {!scanResult ? (
        <>
          <div className={styles.scannerWrapper}>
            <div id="qr-reader" style={{ width: '100%', minHeight: isScanning ? '300px' : '0' }}></div>
          </div>
          
          <Button 
            onClick={() => setIsScanning(!isScanning)}
            variant={isScanning ? 'outline' : 'primary'}
          >
            {isScanning ? 'Parar Câmera' : 'Iniciar Câmera'}
          </Button>
          
          {isProcessing && <p>Processando...</p>}
        </>
      ) : (
        <div className={`${styles.resultCard} ${
          scanResult.success 
            ? scanResult.data?.alreadyCheckedIn 
              ? styles.resultWarning 
              : styles.resultSuccess 
            : styles.resultError
        }`}>
          {scanResult.success && scanResult.data ? (
            <>
              <div className={styles.resultIcon}>
                {scanResult.data.alreadyCheckedIn ? '⚠️' : '✅'}
              </div>
              <h3 className={styles.resultName}>{scanResult.data.participantName}</h3>
              <p className={styles.resultLecture}>{scanResult.data.lectureTitle}</p>
              
              {scanResult.data.alreadyCheckedIn ? (
                <p className={styles.resultTime}>
                  Participante já estava registrado nesta atividade.
                  <br />
                  Registrado em: {new Date(scanResult.data.checkedInAt).toLocaleString('pt-BR')}
                </p>
              ) : (
                <p className={styles.resultTime}>
                  Presença confirmada às {new Date(scanResult.data.checkedInAt).toLocaleString('pt-BR')}
                </p>
              )}
            </>
          ) : (
            <>
              <div className={styles.resultIcon}>❌</div>
              <h3 className={styles.resultName}>Erro no Check-in</h3>
              <p className={styles.resultTime}>{scanResult.error || 'QR Code inválido ou expirado.'}</p>
            </>
          )}
          
          <Button onClick={resetScanner} variant="primary" style={{ marginTop: '1rem' }}>
            Escanear Próximo
          </Button>
        </div>
      )}
    </div>
  );
}
