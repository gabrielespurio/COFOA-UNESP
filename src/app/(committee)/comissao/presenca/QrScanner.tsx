'use client';

import React, { useEffect, useState, useRef } from 'react';
import styles from './page.module.css';
import { Button } from '@/components/ui/Button/Button';
import { registerAttendance } from '@/actions/lectures';
import { formatBRTTime } from '@/lib/formatDate';

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
  alreadyClaimed?: boolean;
};

interface LectureOption {
  id: string;
  title: string;
  isKitPickup?: boolean;
}

export default function QrScanner({ lectures }: { lectures: LectureOption[] }) {
  const [selectedLectureId, setSelectedLectureId] = useState('');
  const [selectedType, setSelectedType] = useState<'ENTRY' | 'EXIT' | ''>('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const scannerRef = useRef<any>(null);

  const selectedLecture = lectures.find((l) => l.id === selectedLectureId);
  const isKit =
    selectedLecture?.isKitPickup ||
    selectedLecture?.title?.toLowerCase().includes('brinde') ||
    selectedLectureId === 'credenciamento-brinde';

  // Quando for retirada de brinde, fixa automaticamente a ação em ENTRADA
  useEffect(() => {
    if (isKit) {
      setSelectedType('ENTRY');
    }
  }, [selectedLectureId, isKit]);

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

  const playBeep = (isSuccess: boolean) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      if (isSuccess) {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
        oscillator.start();
        setTimeout(() => oscillator.stop(), 180);
      } else {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(260, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.18, audioCtx.currentTime);
        oscillator.start();
        setTimeout(() => {
          oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
          setTimeout(() => oscillator.stop(), 200);
        }, 120);
      }
    } catch (e) {
      // Audio feedback failed
    }
  };

  const handleScan = async (decodedText: string) => {
    if (!selectedLectureId || !selectedType) return;

    setIsProcessing(true);
    stopScanner();

    try {
      const response = await registerAttendance(decodedText, selectedLectureId, selectedType);
      playBeep(response.success === true);
      setScanResult(response as ScanResult);
    } catch (error: any) {
      playBeep(false);
      setScanResult({
        success: false,
        error: error.message || 'Erro ao processar o QR Code. Tente novamente.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleScan(manualCode.trim());
      setManualCode('');
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setIsScanning(true);
  };

  const canScan = selectedLectureId !== '' && (isKit || selectedType !== '');

  return (
    <div className={styles.scannerSection}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginBottom: '2rem',
          padding: '1.5rem',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>
            Atividade / Controle:
          </label>
          <select
            value={selectedLectureId}
            onChange={(e) => setSelectedLectureId(e.target.value)}
            disabled={isScanning || !!scanResult}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-light)',
              fontWeight: 500,
            }}
          >
            <option value="">-- Selecione a atividade --</option>
            {lectures.map((l) => (
              <option key={l.id} value={l.id}>
                {l.isKitPickup ? `🎁 ${l.title}` : l.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>
            Ação:
          </label>
          {isKit ? (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1rem',
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '8px',
                color: '#065f46',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              🎁 Retirada de Brinde / Kit (Apenas Entrada — Uso Único por Participante)
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="type"
                  value="ENTRY"
                  checked={selectedType === 'ENTRY'}
                  onChange={() => setSelectedType('ENTRY')}
                  disabled={isScanning || !!scanResult}
                />
                <strong>Entrada</strong> (Chegada na sala)
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
                <strong>Saída</strong> (Término da palestra)
              </label>
            </div>
          )}
        </div>
      </div>

      {!scanResult ? (
        <>
          {canScan ? (
            <>
              {/* Leitor Manual / USB */}
              <form
                onSubmit={handleManualSubmit}
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  maxWidth: '500px',
                  margin: '0 auto 1.5rem',
                }}
              >
                <input
                  type="text"
                  placeholder="Digitar ou colar código do QR Code / CPF..."
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.65rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                  }}
                />
                <Button type="submit" variant="primary" size="md" disabled={isProcessing}>
                  {isProcessing ? 'Verificando...' : 'Registrar'}
                </Button>
              </form>

              <div className={styles.scannerWrapper}>
                <div id="qr-reader" style={{ width: '100%', minHeight: isScanning ? '300px' : '0' }}></div>
              </div>

              <Button
                onClick={() => setIsScanning(!isScanning)}
                variant={isScanning ? 'outline' : 'primary'}
                fullWidth
              >
                {isScanning ? 'Parar Câmera' : '📷 Iniciar Leitura por Câmera'}
              </Button>

              {isProcessing && (
                <p style={{ textAlign: 'center', marginTop: '1rem', fontWeight: 600 }}>
                  Processando leitura...
                </p>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem 0' }}>
              Selecione a atividade e a ação acima para liberar a leitura.
            </div>
          )}
        </>
      ) : (
        <div
          className={`${styles.resultCard} ${
            scanResult.success ? styles.resultSuccess : styles.resultError
          }`}
        >
          {scanResult.success && scanResult.data ? (
            <>
              <div className={styles.resultIcon}>✅</div>
              <h3 className={styles.resultName}>{scanResult.data.participantName}</h3>
              <p className={styles.resultLecture} style={{ color: 'var(--color-text-muted)' }}>
                {scanResult.data.participantEmail}
              </p>

              <div
                style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  background: 'rgba(255,255,255,0.7)',
                  borderRadius: 'var(--radius-md)',
                  width: '100%',
                }}
              >
                <p style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1B2D5B' }}>
                  {scanResult.data.lectureTitle}
                </p>
                <p
                  style={{
                    fontSize: '1.15rem',
                    marginTop: '0.5rem',
                    fontWeight: 800,
                    color: scanResult.data.type === 'ENTRY' ? '#166534' : '#b91c1c',
                  }}
                >
                  {isKit
                    ? '🎁 BRINDE RETIRADO COM SUCESSO'
                    : scanResult.data.type === 'ENTRY'
                    ? '✓ ENTRADA REGISTRADA'
                    : '✓ SAÍDA REGISTRADA'}
                </p>
                <p style={{ fontSize: '0.9rem', color: '#475569', marginTop: '0.5rem' }}>
                  Horário: <strong>{formatBRTTime(scanResult.data.checkedInAt)}</strong> (Horário de Brasília)
                </p>
              </div>
            </>
          ) : (
            <>
              <div className={styles.resultIcon}>❌</div>
              <h3 className={styles.resultName}>Não foi possível registrar</h3>
              <p
                className={styles.resultTime}
                style={{
                  fontSize: '1rem',
                  lineHeight: '1.5',
                  color: '#991b1b',
                  fontWeight: 600,
                  maxWidth: '500px',
                  margin: '0.75rem auto 0',
                }}
              >
                {scanResult.error || 'QR Code inválido ou não reconhecido.'}
              </p>
            </>
          )}

          <Button onClick={resetScanner} variant="primary" style={{ marginTop: '2rem' }} fullWidth>
            Escanear Próximo Participante →
          </Button>
        </div>
      )}
    </div>
  );
}
