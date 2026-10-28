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
    return new NextResponse('Não autorizado. Faça login como admin/comissão ou forneça a chave secreta.', {
      status: 401,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  // Executar envio em streaming com feedback em tempo real no navegador
  (async () => {
    const write = async (html: string) => {
      await writer.write(encoder.encode(html));
    };

    try {
      await write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Disparo de E-mails - COFOA XV</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace; background: #0f172a; color: #f8fafc; padding: 24px; line-height: 1.6; }
          .title { color: #38bdf8; font-size: 18px; font-weight: 700; margin-bottom: 12px; }
          .log { font-size: 13px; margin: 4px 0; font-family: monospace; }
          .success { color: #4ade80; }
          .error { color: #f87171; }
          .warn { color: #fbbf24; }
          .summary { margin-top: 24px; padding: 16px; background: #1e293b; border-radius: 8px; border: 1px solid #334155; }
        </style>
      </head><body>`);
      await write(`<div class="title">🚀 COFOA XV — Disparo de E-mails para Trabalhos com Ressalvas</div>`);
      await write(`<p style="color: #94a3b8; font-size: 14px;">Buscando trabalhos pendentes no banco de dados...</p>`);

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

      await write(`<p style="color: #94a3b8; font-size: 14px;">Encontrados <strong>${works.length}</strong> trabalhos com ressalvas pendentes. Iniciando envios com intervalo seguro...</p><hr style="border: 0; border-top: 1px solid #334155; margin: 16px 0;" />`);

      let successCount = 0;
      let failCount = 0;
      let skippedCount = 0;

      for (let i = 0; i < works.length; i++) {
        const work = works[i];
        const email = work.participant?.user?.email;
        const participantName = work.participant?.fullName || 'Participante';
        const displayCode = work.displayCode || 'Trabalho Científico';
        const comments = work.reviewerComments || 'Favor verificar os apontamentos na plataforma.';

        if (!email) {
          skippedCount++;
          await write(`<div class="log warn">[${i + 1}/${works.length}] ⚠️ Sem e-mail cadastrado para ${displayCode}. Pulando.</div>`);
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

          successCount++;
          await write(`<div class="log success">[${i + 1}/${works.length}] ✅ Enviado para ${email} (${displayCode})</div>`);
        } catch (err: any) {
          failCount++;
          await write(`<div class="log error">[${i + 1}/${works.length}] ❌ Erro ao enviar para ${email} (${displayCode}): ${err.message}</div>`);
        }

        // Aguarda 800ms entre disparos
        await new Promise((res) => setTimeout(res, 800));
      }

      await write(`
        <div class="summary">
          <h3 style="margin-top: 0; color: #38bdf8;">🏁 Processamento Concluído!</h3>
          <p style="margin: 4px 0;">Total de trabalhos avaliados com ressalvas: <strong>${works.length}</strong></p>
          <p style="margin: 4px 0;">Enviados com sucesso: <strong style="color: #4ade80;">${successCount}</strong></p>
          <p style="margin: 4px 0;">Falhas no envio: <strong style="color: #f87171;">${failCount}</strong></p>
          <p style="margin: 4px 0;">Sem e-mail: <strong>${skippedCount}</strong></p>
        </div>
      </body></html>`);
    } catch (err: any) {
      await write(`<div class="log error">Erro fatal durante o processamento: ${err.message}</div>`);
    } finally {
      await writer.close();
    }
  })();

  return new NextResponse(responseStream.readable, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
