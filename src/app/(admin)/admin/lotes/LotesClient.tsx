'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { createBatch, toggleBatchStatus } from '@/actions/adminBatches';
import { BatchStatus } from '@prisma/client';

export function LotesClient({ initialBatches }: { initialBatches: any[] }) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    status: 'ACTIVE' as BatchStatus,
    pricePresencialTier1: 0,
    pricePresencialTier2: 0,
    pricePresencialTier3: 0,
    priceOnlineTier1: 0,
    priceOnlineTier2: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const result = await createBatch(formData);
    
    if (result.error) {
      setError(result.error);
    } else {
      setShowModal(false);
      setFormData({
        name: '',
        status: 'ACTIVE',
        pricePresencialTier1: 0,
        pricePresencialTier2: 0,
        pricePresencialTier3: 0,
        priceOnlineTier1: 0,
        priceOnlineTier2: 0,
      });
    }
    setLoading(false);
  };

  const handleStatusChange = async (id: string, newStatus: BatchStatus) => {
    await toggleBatchStatus(id, newStatus);
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <Button onClick={() => setShowModal(true)}>+ Novo Lote</Button>
      </div>

      <div style={{ overflowX: 'auto', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: '#374151' }}>Nome do Lote</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: '#374151' }}>Preços (Presencial)</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: '#374151' }}>Preços (Online)</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: '#374151' }}>Status</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: '#374151' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {initialBatches.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                  Nenhum lote cadastrado.
                </td>
              </tr>
            ) : (
              initialBatches.map((batch) => (
                <tr key={batch.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 500 }}>{batch.name}</td>
                  <td style={{ padding: '12px 16px', fontSize: '0.875rem' }}>
                    T1: {formatPrice(batch.pricePresencialTier1)}<br/>
                    T2: {formatPrice(batch.pricePresencialTier2)}<br/>
                    T3: {formatPrice(batch.pricePresencialTier3)}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.875rem' }}>
                    T1: {formatPrice(batch.priceOnlineTier1)}<br/>
                    T2: {formatPrice(batch.priceOnlineTier2)}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <select 
                      value={batch.status} 
                      onChange={(e) => handleStatusChange(batch.id, e.target.value as BatchStatus)}
                      style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        border: '1px solid #d1d5db',
                        backgroundColor: batch.status === 'ACTIVE' ? '#dcfce7' : batch.status === 'CLOSED' ? '#fee2e2' : '#fef3c7',
                        color: batch.status === 'ACTIVE' ? '#166534' : batch.status === 'CLOSED' ? '#991b1b' : '#92400e',
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }}
                    >
                      <option value="UPCOMING">Em Breve</option>
                      <option value="ACTIVE">Ativo</option>
                      <option value="CLOSED">Encerrado</option>
                    </select>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button style={{ color: 'var(--color-primary)', textDecoration: 'underline', border: 'none', background: 'none', cursor: 'pointer' }}>Editar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '8px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px' }}>Novo Lote de Inscrição</h2>
            
            {error && <div style={{ padding: '12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '4px', marginBottom: '16px' }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Nome do Lote * (Ex: 1º Lote)</label>
                <input 
                  type="text" 
                  required
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Status *</label>
                <select 
                  value={formData.status} 
                  onChange={e => setFormData({...formData, status: e.target.value as BatchStatus})}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                >
                  <option value="UPCOMING">Em Breve (Não aceita vendas)</option>
                  <option value="ACTIVE">Ativo (Aberto para vendas)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ border: '1px solid #e5e7eb', padding: '12px', borderRadius: '8px' }}>
                  <h3 style={{ fontWeight: 600, marginBottom: '12px', fontSize: '0.875rem' }}>Preços Presenciais (R$)</h3>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem' }}>Tier 1 (ex: Estudantes)
                    <input type="number" step="0.01" min="0" required value={formData.pricePresencialTier1} onChange={e => setFormData({...formData, pricePresencialTier1: parseFloat(e.target.value)})} style={{ width: '100%', padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                  </label>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem' }}>Tier 2 (ex: Profissionais)
                    <input type="number" step="0.01" min="0" required value={formData.pricePresencialTier2} onChange={e => setFormData({...formData, pricePresencialTier2: parseFloat(e.target.value)})} style={{ width: '100%', padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                  </label>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem' }}>Tier 3
                    <input type="number" step="0.01" min="0" required value={formData.pricePresencialTier3} onChange={e => setFormData({...formData, pricePresencialTier3: parseFloat(e.target.value)})} style={{ width: '100%', padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                  </label>
                </div>

                <div style={{ border: '1px solid #e5e7eb', padding: '12px', borderRadius: '8px' }}>
                  <h3 style={{ fontWeight: 600, marginBottom: '12px', fontSize: '0.875rem' }}>Preços Online (R$)</h3>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem' }}>Tier 1
                    <input type="number" step="0.01" min="0" required value={formData.priceOnlineTier1} onChange={e => setFormData({...formData, priceOnlineTier1: parseFloat(e.target.value)})} style={{ width: '100%', padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                  </label>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem' }}>Tier 2
                    <input type="number" step="0.01" min="0" required value={formData.priceOnlineTier2} onChange={e => setFormData({...formData, priceOnlineTier2: parseFloat(e.target.value)})} style={{ width: '100%', padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Criar Lote'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
