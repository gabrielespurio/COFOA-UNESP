import { Metadata } from 'next';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { AdminCouponsList } from './AdminCouponsList';

export const metadata: Metadata = {
  title: 'Gerenciar Cupons - Admin',
};

export default async function AdminCouponsPage() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    redirect('/login');
  }

  // Fetch all coupons with user details
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          email: true,
          participant: {
            select: { fullName: true }
          }
        }
      }
    }
  });

  // Fetch users for the dropdown
  const users = await prisma.user.findMany({
    where: { roles: { has: 'PARTICIPANT' } },
    select: {
      id: true,
      email: true,
      participant: {
        select: { fullName: true }
      }
    },
    orderBy: { email: 'asc' }
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--color-primary)' }}>Gerenciar Cupons</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>Visualize e crie cupons de desconto para os participantes.</p>
        </div>
      </div>

      <AdminCouponsList initialCoupons={coupons as any} users={users} />
    </div>
  );
}
