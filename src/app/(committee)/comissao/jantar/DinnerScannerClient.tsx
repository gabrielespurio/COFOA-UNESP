'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button/Button';
import { scanDinnerTicket } from '@/actions/dinner';
import styles from './page.module.css';

interface TicketItem {
  id: string;
  companionName: string | null;
  amount: number;
  status: string;
  qrCodeToken: string;
  paidAt: Date | null;
  checkedInAt: Date | null;
  createdAt: Date;
  participant: {
    fullName: string;
    cpf: string;
    phone: string | null;
    user: { email: string };
  };
}

interface DinnerScannerClientProps {
  initialTickets: TicketItem[];
  stats: {
    totalPaid: number;
    totalCheckedIn: number;
    totalPending: number;
    totalRevenue: number;
  };
}

export function DinnerScannerClient({ initialTickets, stats }: DinnerScannerClientProps) {
  const router = useRouter();
  const [tickets, setTickets] = useState<TicketItem[]>(initialTickets);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CHECKED_IN' | 'NOT_CHECKED_IN' | 'PENDING'>('ALL');

  // Scanner state
  const [isScanning, setIsScanning] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<{
    success?: boolean;
    error?: string;
    alreadyCheckedIn?: boolean;
    type?: 'ACOMPANHANTE' | 'CONGRESSISTA';
    companionName?: string;
    participantName?: string;
    participantEmail?: string;
    checkedInAt?: string;
    categoryName?: string;
    message?: string;
  } | null>(null);

  const scannerRef = useRef<any>(null);

  const playSound = (isSuccess: boolean) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      if (isSuccess) {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // High pleasant A5
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        oscillator.start();
        setTimeout(() => oscillator.stop(), 200);
      } else {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(250, audioCtx.currentTime); // Low buzz
        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
        oscillator.start();
        setTimeout(() => {
          oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
          setTimeout(() => oscillator.stop(), 200);
        }, 150);
      }
    } catch (e) {
      // Audio not supported or blocked
    }
  };

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
      const html5QrCode = new Html5Qrcode('qr-dinner-reader');
      scannerRef.current = html5QrCode;

      const config = { fps: 10, qrbox: { width: 260, height: 260 } };

      await html5QrCode.start(
        { facingMode: 'environment' },
        config,
        async (decodedText) => {
          if (!isProcessing) {
            handleProcessCode(decodedText);
          }
        },
        () => {}
      );
    } catch (err) {
      console.error('Error starting camera scanner:', err);
      setIsScanning(false);
      setScanResult({
        error: 'Não foi possível acessar a câmera do dispositivo. Verifique as permissões.',
      });
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  };

  const handleProcessCode = async (token: string) => {
    if (!token.trim()) return;
    setIsProcessing(true);

    try {
      const res = await scanDinnerTicket(token);
      setIsProcessing(false);

      if (res.error) {
        playSound(false);
        setScanResult(res as any);
      } else {
        playSound(true);
        setScanResult(res as any);
        router.refresh();
      }
    } catch (err: any) {
      setIsProcessing(false);
      playSound(false);
      setScanResult({ error: err.message || 'Erro ao processar convite.' });
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualToken) {
      handleProcessCode(manualToken);
      setManualToken('');
    }
  };

  const handleNextScan = () => {
    setScanResult(null);
  };

  // Filtragem da lista
  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      (t.companionName && t.companionName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      t.participant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.qrCodeToken.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.participant.cpf.includes(searchTerm);

    if (!matchesSearch) return false;

    if (statusFilter === 'CHECKED_IN') return t.status === 'PAID' && t.checkedInAt !== null;
    if (statusFilter === 'NOT_CHECKED_IN') return t.status === 'PAID' && t.checkedInAt === null;
    if (statusFilter === 'PENDING') return t.status === 'PENDING';

    return true;
  });

  return (
    <div className={styles.container}>
      {/* Cards de Métricas */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Convites Pagos</div>
          <div className={`${styles.statValue} ${styles.statPaid}`}>{stats.totalPaid}</div>
          <div className={styles.statSub}>Acompanhantes confirmados</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>Presentes na Entrada</div>
          <div className={`${styles.statValue} ${styles.statEntered}`}>{stats.totalCheckedIn}</div>
          <div className={styles.statSub}>
            {stats.totalPaid > 0
              ? `${Math.round((stats.totalCheckedIn / stats.totalPaid) * 100)}% de presença`
              : '0% de presença'}
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>Pagamentos Pendentes</div>
          <div className={`${styles.statValue} ${styles.statPending}`}>{stats.totalPending}</div>
          <div className={styles.statSub}>Aguardando confirmação Pix/Cartão</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>Receita Arrecadada</div>
          <div className={`${styles.statValue} ${styles.statRevenue}`}>
            R$ {stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className={styles.statSub}>{stats.totalPaid} x R$ 185,00</div>
        </div>
      </div>

      {/* ÁREA DE LEITURA DO QR CODE (PORTARIA) */}
      <div className={styles.scannerSection}>
        <div className={styles.scannerHeader}>
          <h3>📸 Portaria do Jantar — Validação de Convites (Uso Único)</h3>
          <p>Leia o QR Code do convite do acompanhante ou o crachá do congressista.</p>
        </div>

        <div className={styles.scannerControls}>
          {!isScanning ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setScanResult(null);
                setIsScanning(true);
              }}
            >
              📷 Abrir Câmera para Bipar
            </Button>
          ) : (
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsScanning(false)}
            >
              ⏹ Fechar Câmera
            </Button>
          )}

          {/* Digitação ou Leitor USB */}
          <form onSubmit={handleManualSubmit} className={styles.manualForm}>
            <input
              type="text"
              placeholder="Digitar código do convite (ex: JNT-...)"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              className={styles.manualInput}
            />
            <Button type="submit" variant="primary" size="md" disabled={isProcessing}>
              {isProcessing ? 'Verificando...' : 'Validar'}
            </Button>
          </form>
        </div>

        {/* Leitor de vídeo HTML5 */}
        <div
          id="qr-dinner-reader"
          className={styles.cameraBox}
          style={{ display: isScanning && !scanResult ? 'block' : 'none' }}
        />

        {/* RESULTADO DA LEITURA */}
        {scanResult && (
          <div className={styles.resultContainer}>
            {/* 1. SUCESSO ACOMPANHANTE */}
            {scanResult.success && scanResult.type === 'ACOMPANHANTE' && (
              <div className={`${styles.resultCard} ${styles.resultSuccess}`}>
                <div className={styles.resultIcon}>✅</div>
                <div className={styles.resultContent}>
                  <h2 className={styles.resultTitle}>ENTRADA DE ACOMPANHANTE LIBERADA!</h2>
                  <div className={styles.resultRow}>
                    <strong>Acompanhante:</strong> {scanResult.companionName}
                  </div>
                  <div className={styles.resultRow}>
                    <strong>Congressista Responsável:</strong> {scanResult.participantName}
                  </div>
                  <div className={styles.resultRow}>
                    <strong>Horário de Entrada:</strong>{' '}
                    {new Date(scanResult.checkedInAt!).toLocaleTimeString('pt-BR')}
                  </div>
                  <div className={styles.usedBadge}>✓ Convite validado e inutilizado para novo uso</div>
                </div>
              </div>
            )}

            {/* 2. SUCESSO CONGRESSISTA */}
            {scanResult.success && scanResult.type === 'CONGRESSISTA' && (
              <div className={`${styles.resultCard} ${styles.resultCongressista}`}>
                <div className={styles.resultIcon}>🎉</div>
                <div className={styles.resultContent}>
                  <h2 className={styles.resultTitle}>CONGRESSISTA INSCRITO (ACESSO LIBERADO)</h2>
                  <div className={styles.resultRow}>
                    <strong>Congressista:</strong> {scanResult.participantName}
                  </div>
                  <div className={styles.resultRow}>
                    <strong>Categoria:</strong> {scanResult.categoryName}
                  </div>
                  <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                    Inscrição regular no congresso com acesso automático ao jantar.
                  </p>
                </div>
              </div>
            )}

            {/* 3. ALERTA: JÁ UTILIZADO */}
            {scanResult.alreadyCheckedIn && (
              <div className={`${styles.resultCard} ${styles.resultAlreadyUsed}`}>
                <div className={styles.resultIcon}>🚫</div>
                <div className={styles.resultContent}>
                  <h2 className={styles.resultTitle}>ATENÇÃO: ESTE CONVITE JÁ FOI UTILIZADO!</h2>
                  <div className={styles.resultRow}>
                    <strong>Acompanhante:</strong> {scanResult.companionName}
                  </div>
                  <div className={styles.resultRow}>
                    <strong>Congressista:</strong> {scanResult.participantName}
                  </div>
                  <div className={styles.resultRow}>
                    <strong>Entrada registrada em:</strong>{' '}
                    {new Date(scanResult.checkedInAt!).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(scanResult.checkedInAt!).toLocaleTimeString('pt-BR')}
                  </div>
                  <div className={styles.dangerNotice}>
                    ❌ Não permita nova entrada com este mesmo QR Code.
                  </div>
                </div>
              </div>
            )}

            {/* 4. ERRO COMUM / NÃO PAGO */}
            {!scanResult.success && !scanResult.alreadyCheckedIn && (
              <div className={`${styles.resultCard} ${styles.resultError}`}>
                <div className={styles.resultIcon}>❌</div>
                <div className={styles.resultContent}>
                  <h2 className={styles.resultTitle}>CONVITE NÃO AUTORIZADO</h2>
                  <p className={styles.errorText}>{scanResult.error}</p>
                </div>
              </div>
            )}

            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
              <Button variant="primary" size="lg" onClick={handleNextScan}>
                Próxima Leitura →
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* LISTA DE CONVIDADOS */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h3>Lista de Convites de Acompanhantes ({filteredTickets.length})</h3>

          <div className={styles.tableFilters}>
            <input
              type="text"
              placeholder="Buscar por acompanhante, congressista ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.filterInput}
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className={styles.filterSelect}
            >
              <option value="ALL">Todos os Convites</option>
              <option value="CHECKED_IN">Já Entraram na Portaria</option>
              <option value="NOT_CHECKED_IN">Confirmados (Ainda não entraram)</option>
              <option value="PENDING">Pagamentos Pendentes</option>
            </select>
          </div>
        </div>

        <div className={styles.tableResponsive}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Acompanhante</th>
                <th>Congressista Responsável</th>
                <th>Código / Token</th>
                <th>Status Pagamento</th>
                <th>Entrada na Portaria</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.emptyTable}>
                    Nenhum convite encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <strong style={{ color: '#0f172a' }}>
                        {t.companionName || 'Acompanhante (Não informado)'}
                      </strong>
                    </td>
                    <td>
                      <div>{t.participant.fullName}</div>
                      <div className={styles.subText}>{t.participant.cpf}</div>
                    </td>
                    <td>
                      <code className={styles.tokenTag}>{t.qrCodeToken}</code>
                    </td>
                    <td>
                      {t.status === 'PAID' ? (
                        <span className={styles.badgePaid}>Pago (R$ 185)</span>
                      ) : (
                        <span className={styles.badgePending}>Pendente</span>
                      )}
                    </td>
                    <td>
                      {t.checkedInAt ? (
                        <span className={styles.badgeCheckedIn}>
                          ✓ Entrou às {new Date(t.checkedInAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      ) : t.status === 'PAID' ? (
                        <span className={styles.badgeWaiting}>Aguardando entrada</span>
                      ) : (
                        <span className={styles.badgeMuted}>-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
