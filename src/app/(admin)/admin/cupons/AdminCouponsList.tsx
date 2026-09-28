'use client';

import React, { useState, useTransition, useMemo } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Badge/Badge';
import { createCoupon } from '@/actions/adminCoupons';
import styles from './AdminCouponsList.module.css';

export function AdminCouponsList({ users: initialUsers }: { users: any[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState('');
  const [isPending, startTransition] = useTransition();
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const name = u.participant?.fullName || '';
      const email = u.email || '';
      const term = search.toLowerCase();
      return name.toLowerCase().includes(term) || email.toLowerCase().includes(term);
    });
  }, [users, search]);

  const handleGenerateDefaultCoupon = async (userId: string, email: string, name: string) => {
    const baseName = name ? name.split(' ')[0].toUpperCase() : email.split('@')[0].toUpperCase().replace(/[^A-Z0-9]/g, '');
    const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase();
    const code = `COFOA-${baseName}-${randomStr}`;

    setLoadingUserId(userId);

    startTransition(async () => {
      const result = await createCoupon({
        userId,
        code,
        discountValue: 10000, // 100 Reais
        discountType: 'FIXED'
      });

      if (result.coupon) {
        setUsers(currentUsers => 
          currentUsers.map(u => 
            u.id === userId 
              ? { ...u, coupons: [result.coupon] } 
              : u
          )
        );
      } else {
        alert(result.error || 'Erro ao gerar cupom.');
      }
      setLoadingUserId(null);
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
        <input 
          type="text"
          placeholder="Pesquisar participante por nome ou email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={styles.input}
          style={{ width: '100%', maxWidth: '400px' }}
        />
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Participante</th>
              <th>Status do Cupom</th>
              <th>Código do Cupom</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>Nenhum participante encontrado.</td>
              </tr>
            )}
            {filteredUsers.map(user => {
              const coupon = user.coupons && user.coupons.length > 0 ? user.coupons[0] : null;

              return (
                <tr key={user.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{user.participant?.fullName || 'Nome não cadastrado'}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{user.email}</div>
                  </td>
                  <td>
                    {!coupon ? (
                      <span style={{ color: 'var(--color-text-muted)' }}>Não possui</span>
                    ) : coupon.usedCount > 0 ? (
                      <Badge variant="success">Utilizado</Badge>
                    ) : (
                      <Badge variant="warning">Disponível</Badge>
                    )}
                  </td>
                  <td>
                    {coupon ? (
                      <strong>{coupon.code}</strong>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    {!coupon && (
                      <Button 
                        variant="primary" 
                        size="sm"
                        loading={loadingUserId === user.id}
                        disabled={isPending && loadingUserId !== null}
                        onClick={() => handleGenerateDefaultCoupon(user.id, user.email, user.participant?.fullName || '')}
                      >
                        Gerar Cupom de R$ 100
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
