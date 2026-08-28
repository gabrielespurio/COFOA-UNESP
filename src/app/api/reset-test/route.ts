import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const registrations = await prisma.registration.findMany({
      include: { category: true }
    });

    let deleted = 0;
    for (const reg of registrations) {
      if (reg.category.name.toLowerCase().includes('teste')) {
        await prisma.registration.delete({
          where: { id: reg.id }
        });
        deleted++;
      }
    }

    return NextResponse.json({ success: true, deleted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
