'use client';

import React, { useEffect, useState, useRef } from 'react';
import styles from './page.module.css';
import { Button } from '@/components/ui/Button/Button';
import { registerAttendance } from '@/actions/lectures';

type ScanResult = {
  success: boolean;
  message?: string;
  data?: {
    participantName: string;
    participantEmail: string;
    lectureTitle: string;
    lectureId: string;
    type: 'ENTRY' | 'EXIT';
    checkedInAt: string;
  };
  error?: string;
};

export default function QrScanner({ lectures }: { lectures: { id: string, title: string }[] }) {
  const [selectedLectureId, setSelectedLectureId] = useState('');
  const [selectedType, setSelectedType] = useState<'ENTRY' | 'EXIT' | ''>('');
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
    if (!selectedLectureId || !selectedType) return;
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
    if (!selectedLectureId || !selectedType) return;

    setIsProcessing(true);
    playBeep();
    
    // Stop the visual scanning
    stopScanner();
    
    try {
      const response = await registerAttendance(decodedText, selectedLectureId, selectedType);
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

  const canScan = selectedLectureId !== '' && selectedType !== '';

  return (
    <div className={styles.scannerSection}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', padding: '1.5rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Atividade Atual:</label>
          <select 
            value={selectedLectureId} 
            onChange={e => setSelectedLectureId(e.target.value)}
            disabled={isScanning || !!scanResult}
            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-light)' }}
          >
            <option value="">-- Selecione a atividade --</option>
            {lectures.map(l => (
              <option key={l.id} value={l.id}>{l.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Ação:</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input 
                type="radio" 
                name="type" 
                value="ENTRY" 
                checked={selectedType === 'ENTRY'} 
                onChange={() => setSelectedType('ENTRY')}
                disabled={isScanning || !!scanResult}
              />
              Entrada
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input 
                type="radio" 
                name="type" 
                value="EXIT" 
                checked={selectedType === 'EXIT'} 
                onChange={() => setSelectedType('EXIT')}
                disabled={isScanning || !!scanResult}
              />
              Saída
            </label>
          </div>
        </div>
      </div>

      {!scanResult ? (
        <>
          {canScan ? (
            <>
              <div className={styles.scannerWrapper}>
                <div id="qr-reader" style={{ width: '100%', minHeight: isScanning ? '300px' : '0' }}></div>
              </div>
              
              <Button 
                onClick={() => setIsScanning(!isScanning)}
                variant={isScanning ? 'outline' : 'primary'}
                fullWidth
              >
                {isScanning ? 'Parar Câmera' : 'Iniciar Leitura Contínua'}
              </Button>
              
              {isProcessing && <p style={{ textAlign: 'center', marginTop: '1rem' }}>Processando leitura...</p>}
            </>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem 0' }}>
              Selecione a atividade e a ação acima para liberar a câmera.
            </div>
          )}
        </>
      ) : (
        <div className={`${styles.resultCard} ${scanResult.success ? styles.resultSuccess : styles.resultError}`}>
          {scanResult.success && scanResult.data ? (
            <>
              <div className={styles.resultIcon}>✅</div>
              <h3 className={styles.resultName}>{scanResult.data.participantName}</h3>
              <p className={styles.resultLecture} style={{ color: 'var(--color-text-muted)' }}>{scanResult.data.participantEmail}</p>
              
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.5)', borderRadius: 'var(--radius-md)' }}>
                <p style={{ fontWeight: 600 }}>{scanResult.data.lectureTitle}</p>
                <p style={{ fontSize: '1.1rem', marginTop: '0.5rem', fontWeight: 700, color: scanResult.data.type === 'ENTRY' ? '#2e7d32' : '#d32f2f' }}>
                  {scanResult.data.type === 'ENTRY' ? 'ENTRADA' : 'SAÍDA'} Registrada
                </p>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                  às {new Date(scanResult.data.checkedInAt).toLocaleTimeString('pt-BR')}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className={styles.resultIcon}>❌</div>
              <h3 className={styles.resultName}>Erro na Leitura</h3>
              <p className={styles.resultTime}>{scanResult.error || 'QR Code inválido ou não reconhecido.'}</p>
            </>
          )}
          
          <Button onClick={resetScanner} variant="primary" style={{ marginTop: '2rem' }} fullWidth>
            Escanear Próximo Participante
          </Button>
        </div>
      )}
    </div>
  );
}
