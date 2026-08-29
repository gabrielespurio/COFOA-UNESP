import { prisma } from '@/lib/prisma';
import { UsersTable } from './UsersTable';

export const metadata = {
  title: 'Gestão de Usuários | Admin COFOA',
};

export default async function UsuariosPage() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      participant: {
        select: {
          fullName: true,
          cpf: true,
          phone: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestão de Usuários e Perfis</h1>
      </div>
      <p className="text-gray-600 mb-6">
        Nesta página você pode visualizar todos os usuários cadastrados e gerenciar suas permissões no sistema (ex: promover para Comissão).
      </p>

      <UsersTable initialUsers={users} />
    </div>
  );
}
