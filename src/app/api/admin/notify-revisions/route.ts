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

  // Permite controlar o tamanho do lote pela URL (default: 20 por execução para respeitar o limite da Hostinger)
  const limitParam = request.nextUrl.searchParams.get('limit');
  const limit = limitParam ? Math.max(1, parseInt(limitParam, 10)) : 20;

  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  // Executar envio em streaming com feedback em tempo real no navegador
  (async () => {
    const write = async (html: string) => {
      await writer.write(encoder.encode(html));
    };

    try {
      await write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Disparo em Lotes - COFOA XV</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace; background: #0f172a; color: #f8fafc; padding: 24px; line-height: 1.6; }
          .title { color: #38bdf8; font-size: 18px; font-weight: 700; margin-bottom: 8px; }
          .subtitle { color: #94a3b8; font-size: 14px; margin-bottom: 16px; }
          .log { font-size: 13px; margin: 6px 0; font-family: monospace; }
          .success { color: #4ade80; }
          .error { color: #f87171; }
          .warn { color: #fbbf24; }
          .summary { margin-top: 24px; padding: 18px; background: #1e293b; border-radius: 8px; border: 1px solid #334155; }
          .btn-retry { display: inline-block; margin-top: 12px; padding: 10px 20px; background: #0284c7; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; }
        </style>
      </head><body>`);
      await write(`<div class="title">🚀 COFOA XV — Disparo de E-mails com Proteção de Cota</div>`);
      await write(`<div class="subtitle">Buscando trabalhos pendentes que ainda NÃO receberam notificação...</div>`);

      // 1. Contar quantos ainda faltam no total
      const totalPendingCount = await prisma.scientificWork.count({
        where: {
          status: 'REVISION_REQUESTED',
          revisionEmailSentAt: null,
        },
      });

      // 2. Buscar lote para envio seguro
      const works = await prisma.scientificWork.findMany({
        where: {
          status: 'REVISION_REQUESTED',
          revisionEmailSentAt: null,
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
        take: limit,
      });

      if (works.length === 0) {
        await write(`
          <div class="summary" style="border-color: #22c55e;">
            <h3 style="margin-top: 0; color: #4ade80;">🎉 Todos os trabalhos já foram notificados!</h3>
            <p>Não há nenhum trabalho com ressalva pendente sem e-mail enviado no momento.</p>
          </div>
        </body></html>`);
        return;
      }

      await write(`<p style="color: #94a3b8; font-size: 14px;">
        Total pendente no sistema: <strong>${totalPendingCount}</strong> | 
        Processando lote seguro atual de: <strong>${works.length}</strong> (pausa de 3s entre envios)
      </p><hr style="border: 0; border-top: 1px solid #334155; margin: 16px 0;" />`);

      let successCount = 0;
      let failCount = 0;
      let skippedCount = 0;
      let rateLimitHit = false;

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

          // Marca imediatamente no banco de dados como enviado com sucesso
          await prisma.scientificWork.update({
            where: { id: work.id },
            data: { revisionEmailSentAt: new Date() },
          });

          successCount++;
          await write(`<div class="log success">[${i + 1}/${works.length}] ✅ Enviado para ${email} (${displayCode}) - Salvo no banco!</div>`);
        } catch (err: any) {
          failCount++;
          const isRateLimit = err?.message?.toLowerCase().includes('ratelimit') || err?.message?.includes('451');

          if (isRateLimit) {
            rateLimitHit = true;
            await write(`<div class="log error">[${i + 1}/${works.length}] 🛑 Cota da Hostinger atingida (${err.message}). Interrompendo envio do lote para não sobrecarregar.</div>`);
            break; // Interrompe para não tentar em vão
          } else {
            await write(`<div class="log error">[${i + 1}/${works.length}] ❌ Erro ao enviar para ${email} (${displayCode}): ${err.message}</div>`);
          }
        }

        // Intervalo de 3 segundos entre envios para respeitar o limite de rajada da Hostinger
        await new Promise((res) => setTimeout(res, 3000));
      }

      const remainingAfterBatch = totalPendingCount - successCount;

      await write(`
        <div class="summary">
          <h3 style="margin-top: 0; color: #38bdf8;">🏁 Resumo da Execução</h3>
          <p style="margin: 4px 0;">Enviados com sucesso e marcados no banco: <strong style="color: #4ade80;">${successCount}</strong></p>
          <p style="margin: 4px 0;">Falhas nesta rodada: <strong style="color: #f87171;">${failCount}</strong></p>
          <p style="margin: 4px 0;">Restantes para as próximas rodadas: <strong style="color: #fbbf24;">${Math.max(0, remainingAfterBatch)}</strong></p>
          ${
            rateLimitHit
              ? `<div style="margin-top: 14px; padding: 12px; background: #451a03; border-radius: 6px; border: 1px solid #78350f; color: #fde68a;">
                  ⚠️ <strong>Aviso da Hostinger:</strong> O limite de envio por hora do seu provedor de e-mail foi acionado temporariamente.<br/>
                  Todos os ${successCount} e-mails enviados foram salvos e <strong>não serão repetidos</strong>.<br/>
                  Aguarde cerca de 30 a 60 minutos para a Hostinger renovar sua cota e clique no botão abaixo para continuar de onde parou:
                </div>`
              : remainingAfterBatch > 0
              ? `<p style="margin-top: 12px; color: #38bdf8;">Para disparar o próximo lote seguro, clique no botão abaixo:</p>`
              : ''
          }
          ${
            remainingAfterBatch > 0
              ? `<a href="?secret=${secret || ''}&limit=${limit}" class="btn-retry">➡️ Enviar Próximo Lote (${Math.min(limit, remainingAfterBatch)} trabalhos)</a>`
              : `<p style="color: #4ade80; font-weight: 700; margin-top: 12px;">✅ Todos os trabalhos com ressalvas já foram notificados!</p>`
          }
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
