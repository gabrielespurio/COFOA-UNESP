'use client';

import React, { useState, useEffect } from 'react';
import { updateUserRole } from '@/actions/users';
import { Role } from '@prisma/client';
import styles from '../participantes/page.module.css';

type UserWithParticipant = {
  id: string;
  email: string;
  role: Role;
  createdAt: Date;
  participant: {
    fullName: string;
    cpf: string;
    phone: string | null;
  } | null;
};

export function UsersTable({ initialUsers }: { initialUsers: UserWithParticipant[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredUsers = initialUsers.filter(user => {
    const search = searchTerm.toLowerCase();
    return (
      user.email.toLowerCase().includes(search) ||
      (user.participant?.fullName || '').toLowerCase().includes(search) ||
      (user.participant?.cpf || '').includes(search)
    );
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleRoleChange = async (userId: string, newRole: Role) => {
    if (!window.confirm(`Tem certeza que deseja alterar o perfil deste usuário para ${newRole}?`)) {
      return;
    }

    setUpdatingId(userId);
    setMessage(null);

    const result = await updateUserRole(userId, newRole);

    if (result.error) {
      setMessage({ text: result.error, type: 'error' });
    } else {
      setMessage({ text: 'Perfil atualizado com sucesso.', type: 'success' });
    }

    setUpdatingId(null);
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return <span className={styles.badgeAdmin}>Admin</span>;
      case 'COMMITTEE':
        return <span className={styles.badgeSuccess}>Comissão</span>;
      default:
        return <span className={styles.badgeUser}>Participante</span>;
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Pesquisar por nome, e-mail ou CPF..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: '1 1 300px',
            maxWidth: '500px',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            fontFamily: 'inherit',
            fontSize: 'var(--font-size-sm)'
          }}
        />
        <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
          {filteredUsers.length} {filteredUsers.length === 1 ? 'usuário encontrado' : 'usuários encontrados'}
        </div>
      </div>

      {message && (
        <div style={{ 
          padding: '1rem', 
          marginBottom: '1.5rem', 
          borderRadius: 'var(--radius-md)',
          backgroundColor: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(45, 138, 110, 0.1)',
          color: message.type === 'error' ? 'var(--color-error)' : 'var(--color-success)',
          fontWeight: 500,
          fontSize: 'var(--font-size-sm)'
        }}>
          {message.text}
        </div>
      )}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nome / E-mail</th>
              <th>CPF</th>
              <th>Perfil Atual</th>
              <th style={{ textAlign: 'right' }}>Ação</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles.emptyState} style={{ textAlign: 'center', padding: '2rem' }}>
                  Nenhum usuário encontrado.
                </td>
              </tr>
            ) : (
              paginatedUsers.map(user => (
                <tr key={user.id}>
                  <td className={styles.nameCell}>
                    <div style={{ fontWeight: 500, color: 'var(--color-primary)' }}>{user.participant?.fullName || 'Nome não cadastrado'}</div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>{user.email}</div>
                  </td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>
                    {user.participant?.cpf || '-'}
                  </td>
                  <td>
                    {getRoleBadge(user.role)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {user.role === 'ADMIN' ? (
                      <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Administrador</span>
                    ) : (
                      <label style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        cursor: updatingId === user.id ? 'not-allowed' : 'pointer',
                        opacity: updatingId === user.id ? 0.5 : 1
                      }}>
                        <input
                          type="checkbox"
                          disabled={updatingId === user.id}
                          checked={user.role === 'COMMITTEE'}
                          onChange={(e) => handleRoleChange(user.id, e.target.checked ? 'COMMITTEE' : 'PARTICIPANT')}
                          style={{
                            marginRight: '0.5rem',
                            cursor: 'pointer',
                            accentColor: 'var(--color-primary)'
                          }}
                        />
                        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>
                          Habilitar Avaliador
                        </span>
                      </label>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
        <button 
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            background: currentPage === 1 ? 'var(--color-surface-alt)' : 'white',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            color: currentPage === 1 ? 'var(--color-text-secondary)' : 'var(--color-text-primary)',
            fontWeight: 500
          }}
        >
          Anterior
        </button>
        
        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
          Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
        </span>
        
        <button 
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            background: currentPage === totalPages ? 'var(--color-surface-alt)' : 'white',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            color: currentPage === totalPages ? 'var(--color-text-secondary)' : 'var(--color-text-primary)',
            fontWeight: 500
          }}
        >
          Próxima
        </button>
      </div>
    </>
  );
}
