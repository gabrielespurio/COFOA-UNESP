'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button/Button';
import { QrCodeDisplay } from '../programacao/meus-qrcodes/QrCodeDisplay';
import { purchaseCompanionDinnerTicket, syncCompanionDinnerPayment, cancelCompanionDinnerTicket } from '@/actions/dinner';
import styles from './page.module.css';

interface TicketData {
  id: string;
  amount: number;
  status: string;
  companionName: string | null;
  invoiceUrl: string | null;
  qrCodeToken: string;
  paidAt: Date | null;
  checkedInAt: Date | null;
}

interface DinnerClientProps {
  initialTicket: TicketData | null;
  participantName: string;
  isParticipantConfirmed: boolean;
}

export function DinnerClient({
  initialTicket,
  participantName,
  isParticipantConfirmed,
}: DinnerClientProps) {
  const router = useRouter();
  const [ticket, setTicket] = useState<TicketData | null>(initialTicket);
  const [companionName, setCompanionName] = useState(initialTicket?.companionName || '');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const res = await purchaseCompanionDinnerTicket(companionName);
    setLoading(false);

    if (res.error) {
      setErrorMessage(res.error);
    } else if (res.invoiceUrl) {
      window.location.href = res.invoiceUrl;
    } else {
      router.refresh();
    }
  };

  const handleSync = async () => {
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const res = await syncCompanionDinnerPayment();
    setLoading(false);

    if (res.error) {
      setErrorMessage(res.error);
    } else if (res.message) {
      if (res.isPaid) {
        setSuccessMessage(res.message);
        router.refresh();
      } else {
        setErrorMessage(res.message);
      }
    }
  };

  const handleCancel = async () => {
    if (!confirm('Tem certeza de que deseja cancelar esta cobrança do jantar?')) return;
    setLoading(true);
    setErrorMessage(null);

    const res = await cancelCompanionDinnerTicket();
    setLoading(false);

    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setTicket(null);
      setCompanionName('');
      router.refresh();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={styles.wrapper}>
      {/* Informação sobre o Jantar do Participante */}
      <div className={styles.infoCard}>
        <div className={styles.infoIcon}>🍽️</div>
        <div className={styles.infoContent}>
          <h3 className={styles.infoTitle}>Jantar de Confraternização — COFOA XV</h3>
          <p className={styles.infoText}>
            Como congressista com inscrição confirmada, o seu acesso ao Jantar de Confraternização já está <strong>incluso automaticamente</strong>.
          </p>
          <p className={styles.infoSubtext}>
            Deseja levar um acompanhante ou cônjuge? Adquira abaixo o <strong>Convite Individual de Acompanhante</strong> com QR Code de uso único para a portaria.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className={styles.alertError}>
          <span>⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className={styles.alertSuccess}>
          <span>✅</span>
          <span>{successMessage}</span>
        </div>
      )}

      {/* CASO 1: Acompanhante PAGO (Exibe o Convite com QR Code) */}
      {ticket && ticket.status === 'PAID' && (
        <div className={styles.ticketSection}>
          <div className={`${styles.ticketCard} ${styles.printOnlyArea}`}>
            <div className={styles.ticketHeader}>
              <div className={styles.ticketBadge}>CONVITE INDIVIDUAL ACOMPANHANTE</div>
              <h2 className={styles.ticketEvent}>15º COFOA — Jantar Oficial</h2>
              <div className={styles.ticketPrice}>Taxa de Acompanhante: R$ 185,00</div>
            </div>

            <div className={styles.ticketBody}>
              <div className={styles.qrContainer}>
                <QrCodeDisplay token={ticket.qrCodeToken} size={190} />
                <div className={styles.tokenCode}>{ticket.qrCodeToken}</div>
              </div>

              <div className={styles.ticketDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Acompanhante:</span>
                  <span className={styles.detailValue}>
                    {ticket.companionName || 'Convidado(a)'}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Congressista Responsável:</span>
                  <span className={styles.detailValue}>{participantName}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Status do Convite:</span>
                  <span className={styles.detailValue}>
                    {ticket.checkedInAt ? (
                      <span className={styles.statusUsed}>
                        ✓ Utilizado na entrada ({new Date(ticket.checkedInAt).toLocaleDateString('pt-BR')} às {new Date(ticket.checkedInAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })})
                      </span>
                    ) : (
                      <span className={styles.statusConfirmed}>
                        ✓ Confirmado (Apresente na portaria)
                      </span>
                    )}
                  </span>
                </div>

                <div className={styles.securityNotice}>
                  <strong>⚠️ Importante (Uso Único):</strong> Este QR Code é exclusivo e de uso único. Ao ser lido na portaria do jantar, ele será automaticamente validado e inutilizado para novas entradas.
                </div>
              </div>
            </div>
          </div>

          <div className={`${styles.actionButtons} ${styles.noPrint}`}>
            <Button variant="primary" size="md" onClick={handlePrint}>
              🖨️ Imprimir / Salvar Convite
            </Button>
          </div>
        </div>
      )}

      {/* CASO 2: Cobrança PENDENTE */}
      {ticket && ticket.status === 'PENDING' && (
        <div className={styles.pendingCard}>
          <div className={styles.pendingHeader}>
            <span className={styles.pendingIcon}>⏳</span>
            <div>
              <h3>Convite de Acompanhante Gerado (Aguardando Pagamento)</h3>
              <p>
                {ticket.companionName 
                  ? `Acompanhante: ${ticket.companionName}` 
                  : 'Acompanhante: Não informado'}
              </p>
            </div>
          </div>

          <div className={styles.pendingPriceBox}>
            <span className={styles.priceLabel}>Valor do Convite:</span>
            <span className={styles.priceValue}>R$ 185,00</span>
          </div>

          <p className={styles.pendingInstruction}>
            Efetue o pagamento via Pix ou Cartão no Asaas. Assim que o pagamento for compensado, o <strong>QR Code oficial de acesso</strong> será liberado imediatamente nesta tela.
          </p>

          <div className={styles.pendingActions}>
            {ticket.invoiceUrl && (
              <Button
                href={ticket.invoiceUrl}
                variant="primary"
                size="md"
                target="_blank"
                rel="noopener noreferrer"
              >
                Pagar Convite (R$ 185,00)
              </Button>
            )}

            <Button
              variant="outline"
              size="md"
              onClick={handleSync}
              disabled={loading}
            >
              {loading ? 'Verificando...' : 'Já paguei'}
            </Button>

            <Button
              variant="ghost"
              size="md"
              onClick={handleCancel}
              disabled={loading}
              style={{ color: 'var(--color-danger, #ef4444)' }}
            >
              Cancelar cobrança
            </Button>
          </div>
        </div>
      )}

      {/* CASO 3: NENHUM CONVITE GERADO (Formulário de Compra) */}
      {!ticket && (
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h3>Adquirir Convite de Acompanhante</h3>
            <p>Garanta a presença do seu cônjuge ou acompanhante no Jantar Oficial do Congresso.</p>
          </div>

          <form onSubmit={handlePurchase} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="companionName" className={styles.label}>
                Nome Completo do Acompanhante (Opcional, mas recomendado para conferência):
              </label>
              <input
                id="companionName"
                type="text"
                placeholder="Ex: Maria da Silva"
                value={companionName}
                onChange={(e) => setCompanionName(e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.priceSummary}>
              <div>
                <strong>Convite Jantar Acompanhante</strong>
                <span className={styles.summaryDesc}>Entrada individual com buffet e confraternização</span>
              </div>
              <div className={styles.summaryValue}>R$ 185,00</div>
            </div>

            <div className={styles.limitNotice}>
              ℹ️ Limite de <strong>1 convite de acompanhante</strong> por participante.
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              {loading ? 'Gerando cobrança Asaas...' : 'Comprar Convite (R$ 185,00)'}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
