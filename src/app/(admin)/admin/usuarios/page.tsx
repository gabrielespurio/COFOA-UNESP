import { prisma } from '@/lib/prisma';
import { UsersTable } from './UsersTable';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';

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
      <SectionHeading 
        title="Gestão de Usuários e Perfis" 
      />

      <UsersTable initialUsers={users} />
    </div>
  );
}
