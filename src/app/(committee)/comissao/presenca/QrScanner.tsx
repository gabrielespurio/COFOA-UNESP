'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
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
    message?: string;
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
  const [selectedType, setSelectedType] = useState<'ENTRY' | 'EXIT' | ''>('ENTRY');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [continuousMode, setContinuousMode] = useState(true);

  const scannerRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastScannedRef = useRef<{ code: string; timestamp: number }>({ code: '', timestamp: 0 });

  const selectedLecture = lectures.find((l) => l.id === selectedLectureId);
  const isKit =
    selectedLecture?.isKitPickup ||
    selectedLecture?.title?.toLowerCase().includes('brinde') ||
    selectedLectureId === 'credenciamento-brinde';

  // Quando trocar a atividade, se for brinde fixa ENTRADA; caso contrário garante ENTRADA se vazio
  useEffect(() => {
    if (isKit) {
      setSelectedType('ENTRY');
    } else if (!selectedType) {
      setSelectedType('ENTRY');
    }
  }, [selectedLectureId, isKit, selectedType]);

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
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        oscillator.start();
        setTimeout(() => oscillator.stop(), 180);
      } else {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(260, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
        oscillator.start();
        setTimeout(() => {
          oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
          setTimeout(() => oscillator.stop(), 200);
        }, 120);
      }
    } catch (e) {
      // Audio feedback error ignored
    }
  };

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
      scannerRef.current = null;
    }
  }, []);

  const handleScan = useCallback(
    async (decodedText: string) => {
      const targetType = isKit ? 'ENTRY' : (selectedType || 'ENTRY');

      if (!selectedLectureId) {
        setScanResult({
          success: false,
          error: 'Por favor, selecione primeiro a atividade no menu acima.',
        });
        return;
      }

      setIsProcessing(true);

      try {
        const response = await registerAttendance(decodedText, selectedLectureId, targetType);
        playBeep(response.success === true);
        setScanResult(response as ScanResult);

        // Se NÃO estiver em modo contínuo, pausa a câmera após ler
        if (!continuousMode) {
          stopScanner();
          setIsScanning(false);
        }
      } catch (error: any) {
        playBeep(false);
        setScanResult({
          success: false,
          error: error.message || 'Erro ao processar o QR Code. Tente novamente.',
        });
      } finally {
        setIsProcessing(false);
        // Devolve o foco ao input para continuar lendo com pistola de código de barras
        setTimeout(() => {
          inputRef.current?.focus();
        }, 150);
      }
    },
    [selectedLectureId, selectedType, isKit, continuousMode, stopScanner]
  );

  const startScanner = useCallback(async () => {
    if (!selectedLectureId) return;

    // Garante que o scanner anterior foi parado antes de recriar
    await stopScanner();

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;

      const config = { fps: 12, qrbox: { width: 260, height: 260 } };

      await html5QrCode.start(
        { facingMode: 'environment' },
        config,
        async (decodedText) => {
          const now = Date.now();
          // Debounce: ignora mesmo código lido repetidamente em menos de 3.5 segundos
          if (
            decodedText === lastScannedRef.current.code &&
            now - lastScannedRef.current.timestamp < 3500
          ) {
            return;
          }

          lastScannedRef.current = { code: decodedText, timestamp: now };
          handleScan(decodedText);
        },
        () => {
          // Ignora falhas de frame sem QR
        }
      );
    } catch (err: any) {
      console.error('Error starting scanner', err);
      setIsScanning(false);
      setScanResult({
        success: false,
        error: 'Não foi possível acessar a câmera do dispositivo. Verifique as permissões.',
      });
    }
  }, [selectedLectureId, handleScan, stopScanner]);

  useEffect(() => {
    if (isScanning) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isScanning, startScanner, stopScanner]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleScan(manualCode.trim());
      setManualCode('');
    }
  };

  const handleToggleCamera = () => {
    if (!selectedLectureId) {
      setScanResult({
        success: false,
        error: 'Selecione uma atividade antes de iniciar a câmera.',
      });
      return;
    }
    setIsScanning((prev) => !prev);
  };

  const handleClearResult = () => {
    setScanResult(null);
    if (!isScanning) {
      setIsScanning(true);
    }
    inputRef.current?.focus();
  };

  return (
    <div className={styles.scannerSection}>
      {/* SELETOR DE ATIVIDADE E AÇÃO */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          padding: '1.5rem',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div>
          <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem', fontSize: '1rem' }}>
            1. Selecione a Atividade:
          </label>
          <select
            value={selectedLectureId}
            onChange={(e) => {
              setSelectedLectureId(e.target.value);
              setScanResult(null);
            }}
            style={{
              width: '100%',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--color-primary)',
              fontWeight: 600,
              fontSize: '1rem',
              background: '#ffffff',
            }}
          >
            <option value="">-- Clique aqui para escolher a atividade --</option>
            {lectures.map((l) => (
              <option key={l.id} value={l.id}>
                {l.isKitPickup ? `🎁 ${l.title}` : l.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem', fontSize: '1rem' }}>
            2. Tipo de Registro:
          </label>
          {isKit ? (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                background: '#ecfdf5',
                border: '2px solid #10b981',
                borderRadius: '8px',
                color: '#065f46',
                fontWeight: 700,
                fontSize: '1rem',
              }}
            >
              🎁 Retirada de Brinde / Kit (Uso Único por Congressista)
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  cursor: 'pointer',
                  padding: '0.6rem 1.2rem',
                  borderRadius: '8px',
                  background: selectedType === 'ENTRY' ? '#dcfce7' : '#f1f5f9',
                  border: selectedType === 'ENTRY' ? '2px solid #16a34a' : '2px solid transparent',
                  fontWeight: 700,
                }}
              >
                <input
                  type="radio"
                  name="type"
                  value="ENTRY"
                  checked={selectedType === 'ENTRY'}
                  onChange={() => setSelectedType('ENTRY')}
                  style={{ transform: 'scale(1.2)' }}
                />
                🟢 ENTRADA (Chegada na sala)
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  cursor: 'pointer',
                  padding: '0.6rem 1.2rem',
                  borderRadius: '8px',
                  background: selectedType === 'EXIT' ? '#fee2e2' : '#f1f5f9',
                  border: selectedType === 'EXIT' ? '2px solid #dc2626' : '2px solid transparent',
                  fontWeight: 700,
                }}
              >
                <input
                  type="radio"
                  name="type"
                  value="EXIT"
                  checked={selectedType === 'EXIT'}
                  onChange={() => setSelectedType('EXIT')}
                  style={{ transform: 'scale(1.2)' }}
                />
                🔴 SAÍDA (Término da palestra)
              </label>
            </div>
          )}
        </div>
      </div>

      {/* FEEDBACK PROEMINENTE DO RESULTADO DO ESCANEAMENTO */}
      {scanResult && (
        <div
          className={`${styles.resultCard} ${
            scanResult.success ? styles.resultSuccess : styles.resultError
          }`}
          style={{ width: '100%', maxWidth: '650px', animation: 'fadeIn 0.2s ease-in-out' }}
        >
          {scanResult.success && scanResult.data ? (
            <>
              <div className={styles.resultIcon} style={{ fontSize: '2.5rem' }}>✅</div>
              <h3 className={styles.resultName} style={{ fontSize: '1.5rem', color: '#0f172a' }}>
                {scanResult.data.participantName}
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                {scanResult.data.participantEmail}
              </p>

              <div
                style={{
                  marginTop: '0.75rem',
                  padding: '0.85rem',
                  background: 'rgba(255,255,255,0.85)',
                  borderRadius: 'var(--radius-md)',
                  width: '100%',
                }}
              >
                <p style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1B2D5B' }}>
                  {scanResult.data.lectureTitle}
                </p>
                <p
                  style={{
                    fontSize: '1.25rem',
                    marginTop: '0.4rem',
                    fontWeight: 900,
                    color: scanResult.data.type === 'ENTRY' ? '#15803d' : '#b91c1c',
                  }}
                >
                  {isKit
                    ? '🎁 BRINDE RETIRADO COM SUCESSO'
                    : scanResult.data.type === 'ENTRY'
                    ? '✓ ENTRADA CONFIRMADA'
                    : '✓ SAÍDA CONFIRMADA'}
                </p>
                <p style={{ fontSize: '0.9rem', color: '#475569', marginTop: '0.25rem' }}>
                  Horário: <strong>{formatBRTTime(scanResult.data.checkedInAt)}</strong>
                  {scanResult.data.message && ` (${scanResult.data.message})`}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', width: '100%' }}>
                <Button onClick={handleClearResult} variant="outline" size="sm" fullWidth>
                  Limpar Aviso
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className={styles.resultIcon} style={{ fontSize: '2.5rem' }}>❌</div>
              <h3 className={styles.resultName} style={{ color: '#991b1b' }}>Não foi possível registrar</h3>
              <p
                style={{
                  fontSize: '1.05rem',
                  lineHeight: '1.5',
                  color: '#991b1b',
                  fontWeight: 600,
                  marginTop: '0.5rem',
                }}
              >
                {scanResult.error || 'Código ou QR Code não reconhecido.'}
              </p>
              <Button onClick={handleClearResult} variant="primary" size="sm" style={{ marginTop: '1rem' }} fullWidth>
                Tentar Novamente
              </Button>
            </>
          )}
        </div>
      )}

      {/* ENTRADA MANUAL / LEITOR DE CÓDIGO DE BARRAS USB (SEMPRE VISÍVEL) */}
      <div style={{ width: '100%', maxWidth: '650px' }}>
        <form
          onSubmit={handleManualSubmit}
          style={{
            display: 'flex',
            gap: '0.5rem',
            width: '100%',
          }}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Escanear com pistola USB ou digitar CPF / Token..."
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            disabled={!selectedLectureId || isProcessing}
            autoFocus
            style={{
              flex: 1,
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--color-border)',
              fontSize: '1rem',
              fontWeight: 500,
              background: !selectedLectureId ? '#f1f5f9' : '#ffffff',
            }}
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!selectedLectureId || isProcessing || !manualCode.trim()}
          >
            {isProcessing ? 'Verificando...' : 'Registrar'}
          </Button>
        </form>
        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.35rem', display: 'block' }}>
          💡 Pistolas USB / Bluetooth e digitação de CPF (com ou sem pontuação) funcionam diretamente neste campo.
        </span>
      </div>

      {/* ÁREA DA CÂMERA DO CELULAR / NOTEBOOK */}
      <div
        style={{
          width: '100%',
          maxWidth: '500px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <div className={styles.scannerWrapper} style={{ minHeight: isScanning ? '320px' : '0' }}>
          <div id="qr-reader" style={{ width: '100%' }}></div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
          <Button
            onClick={handleToggleCamera}
            variant={isScanning ? 'outline' : 'primary'}
            fullWidth
            size="lg"
            disabled={!selectedLectureId}
          >
            {isScanning ? '⏹️ Pausar Câmera' : '📷 Iniciar Leitura por Câmera'}
          </Button>
        </div>

        {isScanning && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={continuousMode}
              onChange={(e) => setContinuousMode(e.target.checked)}
            />
            <span><strong>Modo Fila Contínua:</strong> manter câmera ligada após cada leitura</span>
          </label>
        )}
      </div>
    </div>
  );
}
