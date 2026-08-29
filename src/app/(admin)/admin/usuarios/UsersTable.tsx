'use client';

import { useState } from 'react';
import { updateUserRole } from '@/actions/users';
import { Role } from '@prisma/client';

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

  const filteredUsers = initialUsers.filter(user => {
    const search = searchTerm.toLowerCase();
    return (
      user.email.toLowerCase().includes(search) ||
      (user.participant?.fullName || '').toLowerCase().includes(search) ||
      (user.participant?.cpf || '').includes(search)
    );
  });

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
      // A página fará o revalidate e atualizará os dados reais automaticamente
    }

    setUpdatingId(null);
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">Admin</span>;
      case 'COMMITTEE':
        return <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded">Comissão</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded">Participante</span>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Pesquisar por nome, e-mail ou CPF..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/2 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {message && (
        <div className={`p-4 mb-4 rounded ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message.text}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-3 font-semibold text-gray-700">Nome / E-mail</th>
              <th className="p-3 font-semibold text-gray-700">CPF</th>
              <th className="p-3 font-semibold text-gray-700">Perfil Atual</th>
              <th className="p-3 font-semibold text-gray-700 text-right">Ação</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <div className="font-medium text-gray-900">{user.participant?.fullName || 'Nome não cadastrado'}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="p-3 text-gray-600">
                    {user.participant?.cpf || '-'}
                  </td>
                  <td className="p-3">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="p-3 text-right">
                    {user.role === 'ADMIN' ? (
                      <span className="text-xs text-gray-400 italic">Administrador</span>
                    ) : (
                      <select
                        disabled={updatingId === user.id}
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                        className="text-sm border border-gray-300 rounded p-1 bg-white disabled:opacity-50"
                      >
                        <option value="PARTICIPANT">Tornar Participante</option>
                        <option value="COMMITTEE">Tornar Comissão</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
