import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { sendWorkRevisionEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  const session = await getSession();

  const isAuthorized =
    (secret && secret === process.env.JWT_SECRET) ||
    (session && (session.roles.includes('ADMIN') || session.roles.includes('COMMITTEE')));

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const works = await prisma.scientificWork.findMany({
      where: {
        status: 'REVISION_REQUESTED',
      },
      include: {
        participant: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'asc',
      },
    });

    const results = {
      total: works.length,
      successCount: 0,
      failCount: 0,
      skippedCount: 0,
      details: [] as Array<{
        code: string;
        email: string;
        status: 'sent' | 'failed' | 'skipped';
        error?: string;
      }>,
    };

    for (const work of works) {
      const email = work.participant?.user?.email;
      const participantName = work.participant?.fullName || 'Participante';
      const displayCode = work.displayCode || 'Trabalho Científico';
      const comments = work.reviewerComments || 'Favor verificar os apontamentos na plataforma.';

      if (!email) {
        results.skippedCount++;
        results.details.push({
          code: displayCode,
          email: 'N/A',
          status: 'skipped',
        });
        continue;
      }

      try {
        await sendWorkRevisionEmail({
          to: email,
          participantName,
          workTitle: work.title,
          displayCode,
          comments,
          workId: work.id,
        });

        results.successCount++;
        results.details.push({
          code: displayCode,
          email,
          status: 'sent',
        });

        // Espera 800ms entre envios para respeitar taxa do SMTP
        await new Promise((res) => setTimeout(res, 800));
      } catch (err: any) {
        results.failCount++;
        results.details.push({
          code: displayCode,
          email,
          status: 'failed',
          error: err.message,
        });
      }
    }

    return NextResponse.json({
      message: 'Processamento de disparos retroativos concluído.',
      results,
    });
  } catch (error: any) {
    console.error('Erro na rota notify-revisions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
