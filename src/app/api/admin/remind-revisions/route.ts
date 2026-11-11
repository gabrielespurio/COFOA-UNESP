import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { sendRevisionDeadlineReminderEmail } from '@/lib/email';
import { REVISION_DEADLINE_CONFIG } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  const dryRun = request.nextUrl.searchParams.get('dryRun') === 'true';
  const session = await getSession();

  const isAuthorized =
    (secret && secret === process.env.JWT_SECRET) ||
    (session && (session.roles.includes('ADMIN') || session.roles.includes('COMMITTEE')));

  if (!isAuthorized) {
    return new NextResponse('Não autorizado. Faça login como admin/comissão ou forneça a chave secreta (?secret=...).', {
      status: 401,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const limitParam = request.nextUrl.searchParams.get('limit');
  const limit = limitParam ? Math.max(1, parseInt(limitParam, 10)) : 200;

  const delayParam = request.nextUrl.searchParams.get('delay');
  const delayMs = delayParam ? Math.max(500, parseInt(delayParam, 10)) : 2500;

  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  (async () => {
    const write = async (html: string) => {
      await writer.write(encoder.encode(html));
    };

    try {
      await write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Disparo Lembrete Prazo Final - COFOA XV</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace; background: #0f172a; color: #f8fafc; padding: 24px; line-height: 1.6; }
          .title { color: #38bdf8; font-size: 20px; font-weight: 700; margin-bottom: 8px; }
          .subtitle { color: #94a3b8; font-size: 14px; margin-bottom: 16px; }
          .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700; margin-bottom: 12px; }
          .badge-warn { background: #fef3c7; color: #b45309; }
          .badge-info { background: #e0f2fe; color: #0369a1; }
          .log { font-size: 13px; margin: 6px 0; font-family: monospace; }
          .success { color: #4ade80; }
          .error { color: #f87171; }
          .warn { color: #fbbf24; }
          .summary { margin-top: 24px; padding: 18px; background: #1e293b; border-radius: 8px; border: 1px solid #334155; }
        </style>
      </head><body>`);
      await write(`<div class="title">🚨 COFOA XV — Disparo de Lembrete de Prazo Final</div>`);
      await write(`<div class="subtitle">Prazo configurado: <strong>${REVISION_DEADLINE_CONFIG.deadlineDisplay}</strong></div>`);
      if (dryRun) {
        await write(`<div class="badge badge-warn">MODO DE SIMULAÇÃO (DRY RUN) — Nenhum e-mail será enviado de fato</div>`);
      }

      // Buscar todos os trabalhos com ressalvas ainda não enviados
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
          createdAt: 'asc',
        },
        take: limit,
      });

      await write(`<p style="color: #94a3b8; font-size: 14px;">
        Total de trabalhos pendentes de correção: <strong>${works.length}</strong> | 
        Intervalo de segurança entre envios: <strong>${delayMs}ms</strong>
      </p><hr style="border: 0; border-top: 1px solid #334155; margin: 16px 0;" />`);

      if (works.length === 0) {
        await write(`
          <div class="summary" style="border-color: #22c55e;">
            <h3 style="margin-top: 0; color: #4ade80;">🎉 Nenhum trabalho com ressalva pendente!</h3>
            <p>Todos os participantes já enviaram suas correções ou não há trabalhos em revisão.</p>
          </div>
        </body></html>`);
        return;
      }

      let successCount = 0;
      let failCount = 0;
      let skippedCount = 0;
      let rateLimitHit = false;

      for (let i = 0; i < works.length; i++) {
        const work = works[i];
        const email = work.participant?.user?.email;
        const participantName = work.participant?.fullName || 'Participante';
        const displayCode = work.displayCode || 'Trabalho Científico';

        if (!email) {
          skippedCount++;
          await write(`<div class="log warn">[${i + 1}/${works.length}] ⚠️ Sem e-mail cadastrado para ${displayCode}. Pulando.</div>`);
          continue;
        }

        try {
          if (!dryRun) {
            await sendRevisionDeadlineReminderEmail({
              to: email,
              participantName,
              workTitle: work.title,
              displayCode,
              workId: work.id,
              deadlineDisplay: REVISION_DEADLINE_CONFIG.deadlineDisplay,
            });
          }

          successCount++;
          await write(`<div class="log success">[${i + 1}/${works.length}] ${dryRun ? '🔍 [SIMULADO]' : '✅ Enviado para'} ${email} (${displayCode} - "${work.title.slice(0, 35)}...")</div>`);
        } catch (err: any) {
          failCount++;
          const isRateLimit = err?.message?.toLowerCase().includes('ratelimit') || err?.message?.includes('451');

          if (isRateLimit) {
            rateLimitHit = true;
            await write(`<div class="log error">[${i + 1}/${works.length}] 🛑 Cota da Hostinger atingida (${err.message}). Interrompendo envio.</div>`);
            break;
          } else {
            await write(`<div class="log error">[${i + 1}/${works.length}] ❌ Erro ao enviar para ${email} (${displayCode}): ${err.message}</div>`);
          }
        }

        if (!dryRun && i < works.length - 1) {
          await new Promise((res) => setTimeout(res, delayMs));
        }
      }

      await write(`
        <div class="summary">
          <h3 style="margin-top: 0; color: #38bdf8;">🏁 Resumo do Disparo de Lembrete</h3>
          <p style="margin: 4px 0;">E-mails enviados com sucesso: <strong style="color: #4ade80;">${successCount}</strong></p>
          <p style="margin: 4px 0;">Falhas: <strong style="color: #f87171;">${failCount}</strong></p>
          <p style="margin: 4px 0;">Ignorados (sem e-mail): <strong style="color: #fbbf24;">${skippedCount}</strong></p>
          ${
            rateLimitHit
              ? `<div style="margin-top: 14px; padding: 12px; background: #451a03; border-radius: 6px; border: 1px solid #78350f; color: #fde68a;">
                  ⚠️ O limite de envio do servidor foi atingido. Aguarde alguns minutos antes de tentar novamente.
                </div>`
              : `<p style="color: #4ade80; font-weight: 700; margin-top: 12px;">✅ Processo concluído com sucesso!</p>`
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
