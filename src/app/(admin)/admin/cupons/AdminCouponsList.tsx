'use client';

import React, { useState, useTransition } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Badge/Badge';
import { createCoupon } from '@/actions/adminCoupons';
import styles from './AdminCouponsList.module.css';
import { formatCurrency } from '@/lib/utils';

export function AdminCouponsList({ initialCoupons, users }: { initialCoupons: any[], users: any[] }) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  
  const [userId, setUserId] = useState('');
  const [code, setCode] = useState('');
  const [discountValue, setDiscountValue] = useState(100);
  const [error, setError] = useState('');

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!userId || !code || !discountValue) {
      setError('Preencha todos os campos.');
      return;
    }

    startTransition(async () => {
      const result = await createCoupon({
        userId,
        code,
        discountValue: discountValue * 100, // converte pra centavos
        discountType: 'FIXED'
      });

      if (result.error) {
        setError(result.error);
      } else if (result.coupon) {
        setCoupons([result.coupon, ...coupons]);
        setIsModalOpen(false);
        setUserId('');
        setCode('');
      }
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>+ Novo Cupom</Button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Código</th>
              <th>Usuário</th>
              <th>Desconto</th>
              <th>Status</th>
              <th>Data Criação</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Nenhum cupom gerado ainda.</td>
              </tr>
            )}
            {coupons.map(coupon => (
              <tr key={coupon.id}>
                <td><strong>{coupon.code}</strong></td>
                <td>
                  {coupon.user ? (
                    <div>
                      <div style={{ fontWeight: 500 }}>{coupon.user.participant?.fullName || 'Nome não cadastrado'}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{coupon.user.email}</div>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--color-text-muted)' }}>Cupom Global</span>
                  )}
                </td>
                <td>
                  {coupon.discountType === 'FIXED' 
                    ? formatCurrency(coupon.discountValue) 
                    : `${coupon.discountValue}%`}
                </td>
                <td>
                  {coupon.usedCount > 0 ? (
                    <Badge variant="success">Utilizado</Badge>
                  ) : (
                    <Badge variant="warning">Disponível</Badge>
                  )}
                </td>
                <td>{new Date(coupon.createdAt).toLocaleDateString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Novo Cupom</h2>
            {error && <div className={styles.error}>{error}</div>}
            
            <form onSubmit={handleCreateCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Usuário</label>
                <select 
                  className={styles.input} 
                  value={userId} 
                  onChange={e => setUserId(e.target.value)}
                  required
                >
                  <option value="">Selecione um usuário...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.participant?.fullName ? `${u.participant.fullName} (${u.email})` : u.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Código do Cupom</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={code} 
                  onChange={e => setCode(e.target.value)} 
                  placeholder="Ex: DESCONTO100"
                  required 
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Valor de Desconto (R$)</label>
                <input 
                  type="number" 
                  className={styles.input} 
                  value={discountValue} 
                  onChange={e => setDiscountValue(Number(e.target.value))} 
                  required 
                  min="1"
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button variant="primary" type="submit" loading={isPending}>Salvar Cupom</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
