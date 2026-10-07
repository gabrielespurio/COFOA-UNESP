import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { roles: { has: 'COMMITTEE' } }
    });

    let migrated = 0;
    for (const user of users) {
      if (user.roles.includes('ADMIN')) continue;

      const newRoles = user.roles.filter((r: string) => r !== 'COMMITTEE');
      newRoles.push('EVALUATOR');

      await prisma.user.update({
        where: { id: user.id },
        data: { roles: newRoles }
      });
      migrated++;
    }

    return NextResponse.json({ success: true, migrated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
