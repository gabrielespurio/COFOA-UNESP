'use client';

import React, { useState, useEffect } from 'react';
import { updateUserRoles } from '@/actions/users';
import { Role } from '@prisma/client';
import styles from '../participantes/page.module.css';

type UserWithParticipant = {
  id: string;
  email: string;
  roles: Role[];
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

  const handleRoleToggle = async (userId: string, currentRoles: Role[], roleToToggle: Role) => {
    let newRoles = [...currentRoles];
    if (newRoles.includes(roleToToggle)) {
      newRoles = newRoles.filter(r => r !== roleToToggle);
    } else {
      newRoles.push(roleToToggle);
    }

    if (!newRoles.includes('PARTICIPANT')) {
      newRoles.push('PARTICIPANT');
    }

    if (!window.confirm(`Tem certeza que deseja atualizar os perfis deste usuário?`)) {
      return;
    }

    setUpdatingId(userId);
    setMessage(null);

    const result = await updateUserRoles(userId, newRoles);

    if (result.error) {
      setMessage({ text: result.error, type: 'error' });
    } else {
      setMessage({ text: 'Perfis atualizados com sucesso.', type: 'success' });
    }

    setUpdatingId(null);
  };

  const getRoleBadges = (roles: Role[]) => {
    return (
      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
        {roles.includes('ADMIN') && <span className={styles.badgeAdmin}>Admin</span>}
        {roles.includes('COMMITTEE') && <span className={styles.badgeSuccess}>Comissão</span>}
        {roles.includes('SCREENER') && <span className={styles.badgeWarning} style={{ background: '#fef08a', color: '#854d0e', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>Triagem</span>}
        {roles.includes('PARTICIPANT') && !roles.includes('ADMIN') && !roles.includes('COMMITTEE') && !roles.includes('SCREENER') && (
          <span className={styles.badgeUser}>Participante</span>
        )}
      </div>
    );
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
              <th>Perfis Atuais</th>
              <th style={{ textAlign: 'right' }}>Ações</th>
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
                    {getRoleBadges(user.roles)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {user.roles.includes('ADMIN') ? (
                      <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Administrador</span>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end', fontSize: 'var(--font-size-sm)' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: updatingId === user.id ? 'not-allowed' : 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={user.roles.includes('COMMITTEE')}
                            disabled={updatingId === user.id}
                            onChange={() => handleRoleToggle(user.id, user.roles, 'COMMITTEE')}
                          />
                          Comissão (2ª Etapa)
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: updatingId === user.id ? 'not-allowed' : 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={user.roles.includes('SCREENER')}
                            disabled={updatingId === user.id}
                            onChange={() => handleRoleToggle(user.id, user.roles, 'SCREENER')}
                          />
                          Triagem (1ª Etapa)
                        </label>
                      </div>
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
