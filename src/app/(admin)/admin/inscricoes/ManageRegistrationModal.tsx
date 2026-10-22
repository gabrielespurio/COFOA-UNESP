'use client';

import React, { useState, useTransition } from 'react';
import styles from './ManageRegistrationModal.module.css';
import { 
  adminCancelRegistration, 
  adminChangeCategory, 
  adminUpdateParticipantData, 
  adminManualConfirm 
} from '@/actions/admin';
import { formatCurrency } from '@/lib/utils';

export interface ManageModalCategory {
  id: string;
  name: string;
  type: string;
}

export interface ManageModalParticipant {
  id: string;
  fullName: string;
  cpf: string;
  phone: string | null;
  institution?: string | null;
  city?: string | null;
  state?: string | null;
  course?: string | null;
  croNumber?: string | null;
  user: {
    email: string;
  };
}

export interface ManageModalRegistration {
  id: string;
  status: string;
  amount: number;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
  coupon?: {
    code: string;
    discountValue: number;
  } | null;
  payment?: {
    id: string;
    gatewayId: string | null;
    status: string;
  } | null;
}

interface ManageRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  participant: ManageModalParticipant;
  registration: ManageModalRegistration | null;
  categories: ManageModalCategory[];
}

export function ManageRegistrationModal({
  isOpen,
  onClose,
  participant,
  registration,
  categories,
}: ManageRegistrationModalProps) {
  const [activeTab, setActiveTab] = useState<'inscricao' | 'participante'>('inscricao');
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form states for Participant
  const [fullName, setFullName] = useState(participant.fullName || '');
  const [email, setEmail] = useState(participant.user?.email || '');
  const [cpf, setCpf] = useState(participant.cpf || '');
  const [phone, setPhone] = useState(participant.phone || '');
  const [institution, setInstitution] = useState(participant.institution || '');
  const [city, setCity] = useState(participant.city || '');
  const [state, setState] = useState(participant.state || '');
  const [course, setCourse] = useState(participant.course || '');
  const [croNumber, setCroNumber] = useState(participant.croNumber || '');

  // Form states for Category change
  const [selectedCategory, setSelectedCategory] = useState(registration?.categoryId || '');
  const [customAmount, setCustomAmount] = useState<string>(
    registration ? (registration.amount / 100).toFixed(2) : ''
  );

  // Form states for Cancellation
  const [cancelMode, setCancelMode] = useState<'DELETE' | 'MARK_CANCELLED'>('DELETE');
  const [cancelAsaas, setCancelAsaas] = useState(true);
  const [removeCoupon, setRemoveCoupon] = useState(false);

  if (!isOpen) return null;

  const handleUpdateParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const res = await adminUpdateParticipantData({
        participantId: participant.id,
        fullName,
        email,
        cpf,
        phone,
        institution,
        city,
        state,
        course,
        croNumber,
      });

      if (res.error) {
        setMessage({ text: res.error, type: 'error' });
      } else {
        setMessage({ text: 'Dados cadastrais atualizados com sucesso!', type: 'success' });
      }
    });
  };

  const handleChangeCategory = async () => {
    if (!registration) return;
    setMessage(null);

    const amountInCents = customAmount ? Math.round(parseFloat(customAmount.replace(',', '.')) * 100) : undefined;

    if (!window.confirm('Tem certeza que deseja alterar a categoria desta inscrição?')) {
      return;
    }

    startTransition(async () => {
      const res = await adminChangeCategory({
        registrationId: registration.id,
        newCategoryId: selectedCategory,
        customAmountCents: amountInCents,
      });

      if (res.error) {
        setMessage({ text: res.error, type: 'error' });
      } else {
        setMessage({ text: 'Categoria alterada com sucesso!', type: 'success' });
      }
    });
  };

  const handleManualConfirm = async (isExempt: boolean) => {
    if (!registration) return;
    setMessage(null);

    const confirmMsg = isExempt 
      ? 'Deseja isentar esta inscrição (marcar como CONFIRMADA e valor R$ 0)?' 
      : 'Deseja aprovar manualmente esta inscrição (marcar como CONFIRMADA)?';

    if (!window.confirm(confirmMsg)) return;

    startTransition(async () => {
      const res = await adminManualConfirm({
        registrationId: registration.id,
        isExempt,
      });

      if (res.error) {
        setMessage({ text: res.error, type: 'error' });
      } else {
        setMessage({ 
          text: isExempt ? 'Inscrição isenta e confirmada com sucesso!' : 'Inscrição confirmada com sucesso!', 
          type: 'success' 
        });
      }
    });
  };

  const handleCancelRegistration = async () => {
    if (!registration) return;
    setMessage(null);

    const msg = cancelMode === 'DELETE'
      ? 'Atenção: A inscrição será EXCLUÍDA do sistema e a fatura no Asaas será cancelada. O participante poderá escolher nova categoria na Área do Participante. Deseja prosseguir?'
      : 'A inscrição será marcada como CANCELADA. Deseja prosseguir?';

    if (!window.confirm(msg)) return;

    startTransition(async () => {
      const res = await adminCancelRegistration({
        registrationId: registration.id,
        mode: cancelMode,
        cancelAsaas,
        removeCoupon,
      });

      if (res.error) {
        setMessage({ text: res.error, type: 'error' });
      } else {
        setMessage({ 
          text: cancelMode === 'DELETE' 
            ? 'Inscrição excluída e fatura cancelada com sucesso! O participante já pode escolher nova categoria.' 
            : 'Inscrição cancelada com sucesso.', 
          type: 'success' 
        });
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h3 className={styles.headerTitle}>Gerenciar Participante / Inscrição</h3>
            <div className={styles.headerSubtitle}>
              {participant.fullName} • {participant.user?.email}
            </div>
          </div>
          <button className={styles.closeButton} onClick={onClose} aria-label="Fechar">
            &times;
          </button>
        </div>

        <div className={styles.tabs}>
          <button 
            type="button"
            className={`${styles.tab} ${activeTab === 'inscricao' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('inscricao')}
          >
            Inscrição & Categoria
          </button>
          <button 
            type="button"
            className={`${styles.tab} ${activeTab === 'participante' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('participante')}
          >
            Dados Cadastrais
          </button>
        </div>

        <div className={styles.content}>
          {message && (
            <div className={message.type === 'success' ? styles.alertSuccess : styles.alertError}>
              {message.text}
            </div>
          )}

          {activeTab === 'inscricao' && (
            <div>
              {!registration ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#6b7280' }}>
                  <p style={{ fontSize: '1rem', fontWeight: 600, color: '#374151' }}>
                    Este participante ainda não iniciou nenhuma inscrição.
                  </p>
                  <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    O participante pode acessar a Área do Participante para escolher sua categoria.
                  </p>
                </div>
              ) : (
                <>
                  <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>Status Atual</h4>
                    <div className={styles.infoGrid}>
                      <div className={styles.infoItem}>
                        <label>Status</label>
                        <span style={{ 
                          fontWeight: 700,
                          color: registration.status === 'CONFIRMED' ? '#059669' : registration.status === 'PENDING' ? '#d97706' : '#dc2626'
                        }}>
                          {registration.status === 'CONFIRMED' ? 'Confirmada (Paga)' : registration.status === 'PENDING' ? 'Pendente' : 'Cancelada'}
                        </span>
                      </div>
                      <div className={styles.infoItem}>
                        <label>Valor Cadastrado</label>
                        <span>{formatCurrency(registration.amount)}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <label>Categoria Atual</label>
                        <span>{registration.category?.name || 'Não informada'}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <label>Cupom Utilizado</label>
                        <span>{registration.coupon?.code || 'Nenhum cupom'}</span>
                      </div>
                      {registration.payment?.gatewayId && (
                        <div className={styles.infoItem} style={{ gridColumn: 'span 2' }}>
                          <label>ID Fatura Asaas</label>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                            {registration.payment.gatewayId} ({registration.payment.status})
                          </span>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {registration.status !== 'CONFIRMED' && (
                        <button
                          type="button"
                          onClick={() => handleManualConfirm(false)}
                          disabled={isPending}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#059669',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            cursor: 'pointer'
                          }}
                        >
                          Aprovar Manualmente
                        </button>
                      )}
                      {registration.amount > 0 && registration.status !== 'CONFIRMED' && (
                        <button
                          type="button"
                          onClick={() => handleManualConfirm(true)}
                          disabled={isPending}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#0284c7',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            cursor: 'pointer'
                          }}
                        >
                          Conceder Isenção (R$ 0,00)
                        </button>
                      )}
                    </div>
                  </div>

                  <hr style={{ margin: '1.5rem 0', borderColor: '#e5e7eb' }} />

                  {/* Alterar Categoria */}
                  <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>Alterar Categoria da Inscrição</h4>
                    <div className={styles.formGrid}>
                      <div className={styles.formGroupFull}>
                        <label className={styles.label}>Nova Categoria</label>
                        <select
                          className={styles.select}
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.type})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label}>Valor Final (R$)</label>
                        <input
                          type="text"
                          className={styles.input}
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          placeholder="Ex: 80.00"
                        />
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                          Deixe como está para manter o valor atual da inscrição.
                        </span>
                      </div>

                      <div className={styles.formGroup} style={{ justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={handleChangeCategory}
                          disabled={isPending || selectedCategory === registration.categoryId}
                          style={{
                            padding: '0.65rem 1.25rem',
                            background: 'var(--color-primary, #0284c7)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            cursor: isPending || selectedCategory === registration.categoryId ? 'not-allowed' : 'pointer',
                            opacity: selectedCategory === registration.categoryId ? 0.6 : 1
                          }}
                        >
                          {isPending ? 'Atualizando...' : 'Salvar Nova Categoria'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Cancelamento Seguro */}
                  <div className={styles.cardDanger}>
                    <div className={styles.cardDangerTitle}>Zona de Cancelamento</div>
                    <div className={styles.cardDangerDesc}>
                      Cancele ou resete a inscrição deste participante. Você pode escolher cancelar a cobrança no Asaas e liberar o participante para realizar uma nova inscrição livremente.
                    </div>

                    <div className={styles.dangerOptions}>
                      <label className={styles.checkboxLabel}>
                        <input
                          type="radio"
                          name="cancelMode"
                          checked={cancelMode === 'DELETE'}
                          onChange={() => setCancelMode('DELETE')}
                        />
                        <strong>Excluir Inscrição (Recomendado):</strong> Libera o usuário para se inscrever do zero na Área do Participante.
                      </label>

                      <label className={styles.checkboxLabel}>
                        <input
                          type="radio"
                          name="cancelMode"
                          checked={cancelMode === 'MARK_CANCELLED'}
                          onChange={() => setCancelMode('MARK_CANCELLED')}
                        />
                        <strong>Manter como Cancelada:</strong> Apenas altera o status no histórico para Cancelada.
                      </label>

                      <label className={styles.checkboxLabel} style={{ marginTop: '0.5rem' }}>
                        <input
                          type="checkbox"
                          checked={cancelAsaas}
                          onChange={(e) => setCancelAsaas(e.target.checked)}
                        />
                        Excluir cobrança correspondente no banco Asaas (se houver fatura ativa)
                      </label>

                      {registration.coupon && (
                        <label className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={removeCoupon}
                            onChange={(e) => setRemoveCoupon(e.target.checked)}
                          />
                          Desativar cupom utilizado ({registration.coupon.code}) para não poder ser reutilizado
                        </label>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleCancelRegistration}
                      disabled={isPending}
                      style={{
                        padding: '0.65rem 1.25rem',
                        background: '#dc2626',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        cursor: isPending ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isPending ? 'Processando cancelamento...' : 'Confirmar Cancelamento da Inscrição'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'participante' && (
            <form onSubmit={handleUpdateParticipant}>
              <div className={styles.formGrid}>
                <div className={styles.formGroupFull}>
                  <label className={styles.label}>Nome Completo *</label>
                  <input
                    type="text"
                    required
                    className={styles.input}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>E-mail de Acesso *</label>
                  <input
                    type="email"
                    required
                    className={styles.input}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>CPF *</label>
                  <input
                    type="text"
                    required
                    className={styles.input}
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Celular / WhatsApp</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Instituição de Origem</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Cidade</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Estado (UF)</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Ex: SP"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Curso</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>CRO (se profissional)</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={croNumber}
                    onChange={(e) => setCroNumber(e.target.value)}
                  />
                </div>

                <div className={styles.formGroupFull} style={{ marginTop: '1rem' }}>
                  <button
                    type="submit"
                    disabled={isPending}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'var(--color-primary, #0284c7)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      cursor: isPending ? 'not-allowed' : 'pointer',
                      alignSelf: 'flex-start'
                    }}
                  >
                    {isPending ? 'Salvando alterações...' : 'Salvar Dados do Usuário'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.5rem 1rem',
              background: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
