'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { createCategory, toggleCategoryStatus } from '@/actions/adminCategories';
import { CategoryType, PriceTier } from '@prisma/client';

export function CategoriasClient({ initialCategories }: { initialCategories: any[] }) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'PRESENCIAL' as CategoryType,
    priceTier: 'PRESENCIAL_TIER1' as PriceTier,
    requiresCRO: false,
    requiresStudentProof: false,
    requiresAbroadProof: false,
    active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const result = await createCategory(formData);
    
    if (result.error) {
      setError(result.error);
    } else {
      setShowModal(false);
      // reset form
      setFormData({
        name: '',
        type: 'PRESENCIAL',
        priceTier: 'PRESENCIAL_TIER1',
        requiresCRO: false,
        requiresStudentProof: false,
        requiresAbroadProof: false,
        active: true,
      });
    }
    setLoading(false);
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    await toggleCategoryStatus(id, !currentStatus);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <Button onClick={() => setShowModal(true)}>+ Nova Categoria</Button>
      </div>

      <div style={{ overflowX: 'auto', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: '#374151' }}>Nome</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: '#374151' }}>Tipo</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: '#374151' }}>Faixa de Preço</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: '#374151' }}>Requisitos</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: '#374151' }}>Status</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: '#374151' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {initialCategories.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                  Nenhuma categoria cadastrada.
                </td>
              </tr>
            ) : (
              initialCategories.map((cat) => (
                <tr key={cat.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px 16px' }}>{cat.name}</td>
                  <td style={{ padding: '12px 16px' }}>{cat.type}</td>
                  <td style={{ padding: '12px 16px' }}>{cat.priceTier}</td>
                  <td style={{ padding: '12px 16px', fontSize: '0.875rem' }}>
                    {cat.requiresCRO && <span style={{ marginRight: '4px', background: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: '4px' }}>CRO</span>}
                    {cat.requiresStudentProof && <span style={{ marginRight: '4px', background: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '4px' }}>Estudante</span>}
                    {cat.requiresAbroadProof && <span style={{ marginRight: '4px', background: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: '4px' }}>Estrangeiro</span>}
                    {!cat.requiresCRO && !cat.requiresStudentProof && !cat.requiresAbroadProof && <span style={{ color: '#9ca3af' }}>Nenhum</span>}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ 
                      display: 'inline-block', 
                      padding: '2px 8px', 
                      borderRadius: '999px', 
                      fontSize: '0.75rem', 
                      fontWeight: 600,
                      backgroundColor: cat.active ? '#dcfce7' : '#fee2e2',
                      color: cat.active ? '#166534' : '#991b1b'
                    }}>
                      {cat.active ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button 
                      onClick={() => handleToggle(cat.id, cat.active)}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: 'var(--color-primary)', 
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      {cat.active ? 'Desativar' : 'Ativar'}
                    </button>
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
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px' }}>Nova Categoria</h2>
            
            {error && <div style={{ padding: '12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '4px', marginBottom: '16px' }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Nome da Categoria *</label>
                <input 
                  type="text" 
                  required
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Tipo *</label>
                <select 
                  value={formData.type} 
                  onChange={e => setFormData({...formData, type: e.target.value as CategoryType})}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                >
                  <option value="PRESENCIAL">Presencial</option>
                  <option value="ONLINE">Online</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Faixa de Preço (Tier) *</label>
                <select 
                  value={formData.priceTier} 
                  onChange={e => setFormData({...formData, priceTier: e.target.value as PriceTier})}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                >
                  <option value="PRESENCIAL_TIER1">Presencial - Tier 1</option>
                  <option value="PRESENCIAL_TIER2">Presencial - Tier 2</option>
                  <option value="PRESENCIAL_TIER3">Presencial - Tier 3</option>
                  <option value="ONLINE_TIER1">Online - Tier 1</option>
                  <option value="ONLINE_TIER2">Online - Tier 2</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" checked={formData.requiresCRO} onChange={e => setFormData({...formData, requiresCRO: e.target.checked})} />
                  Exige número de CRO na inscrição
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" checked={formData.requiresStudentProof} onChange={e => setFormData({...formData, requiresStudentProof: e.target.checked})} />
                  Exige comprovante de estudante
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" checked={formData.requiresAbroadProof} onChange={e => setFormData({...formData, requiresAbroadProof: e.target.checked})} />
                  Exige comprovante de estrangeiro
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
