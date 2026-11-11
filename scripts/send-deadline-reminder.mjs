import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

// Carregar variáveis do .env caso existam
const envPath = fs.existsSync('.env') ? '.env' : path.resolve(process.cwd(), 'cofoa-xv/.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.substring(0, idx).trim();
        let val = trimmed.substring(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.substring(1, val.length - 1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  });
}

// Suporte a argumentos via CLI: --user=... --pass=... --dry-run
const args = process.argv.slice(2);
args.forEach(arg => {
  if (arg.startsWith('--user=')) process.env.SMTP_USER = arg.split('=')[1];
  if (arg.startsWith('--pass=')) process.env.SMTP_PASS = arg.split('=')[1];
});
const isDryRun = args.includes('--dry-run');

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('ERRO: DATABASE_URL não definida.');
  process.exit(1);
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

const smtpHost = process.env.SMTP_HOST || 'smtp.hostinger.com';
const smtpPort = Number(process.env.SMTP_PORT) || 465;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

if (!isDryRun && (!smtpUser || !smtpPass)) {
  console.error('ERRO: SMTP_USER ou SMTP_PASS não configurados.');
  console.error('Passe via linha de comando: node scripts/send-deadline-reminder.mjs --user=email@hostinger.com --pass=senha');
  console.error('Ou defina SMTP_USER e SMTP_PASS no arquivo .env.');
  console.error('(Para apenas testar sem enviar e-mails de verdade, use --dry-run)');
  process.exit(1);
}

const transporter = !isDryRun ? nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: true,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
}) : null;

const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://cofoa.com.br';
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log('================================================================');
  console.log('🚨 DISPARO DE LEMBRETE DE PRAZO FINAL (23h59 de hoje) — COFOA XV');
  console.log('================================================================');

  if (isDryRun) {
    console.log('🔍 MODO SIMULAÇÃO (DRY RUN): Nenhum e-mail será enviado de fato.\n');
  } else {
    console.log(`Conectando ao SMTP (${smtpHost}:${smtpPort}) como remetente: ${smtpUser}`);
    try {
      await transporter.verify();
      console.log('✅ Conexão SMTP autenticada com sucesso!\n');
    } catch (smtpErr) {
      console.error('❌ Falha ao autenticar no servidor SMTP:', smtpErr.message);
      process.exit(1);
    }
  }

  // Buscar todos os trabalhos com status REVISION_REQUESTED
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
  });

  console.log(`Encontrados ${works.length} trabalhos com ressalvas pendentes de envio da correção.\n`);

  if (works.length === 0) {
    console.log('🎉 Nenhum trabalho com ressalva pendente!');
    return;
  }

  let successCount = 0;
  let failCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < works.length; i++) {
    const work = works[i];
    const email = work.participant?.user?.email;
    const participantName = work.participant?.fullName || 'Participante';
    const displayCode = work.displayCode || 'Trabalho Científico';
    const editUrl = `${baseUrl}/area-participante/trabalhos/${work.id}/editar`;

    if (!email) {
      console.warn(`[${i + 1}/${works.length}] ⚠️ Sem e-mail para ${displayCode}. Pulando.`);
      skippedCount++;
      continue;
    }

    console.log(`[${i + 1}/${works.length}] ${isDryRun ? '[SIMULANDO]' : 'Enviando para'} ${email} | ${displayCode} - "${work.title.slice(0, 35)}..."`);

    const mailOptions = {
      from: `"COFOA XV — Comissão Organizadora" <${smtpUser}>`,
      to: email,
      subject: `[URGENTE] Prazo Final para Correção de Trabalho Científico (${displayCode}) - COFOA XV`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; background-color: #f8fafc;">
          <div style="background-color: #0b1a30; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">COFOA XV</h1>
            <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px;">15º Congresso da Faculdade de Odontologia de Araçatuba</p>
          </div>
          
          <div style="padding: 30px; background-color: #ffffff;">
            <div style="display: inline-block; padding: 6px 14px; background-color: #fef2f2; border: 1px solid #ef4444; border-radius: 20px; color: #b91c1c; font-weight: 700; font-size: 13px; margin-bottom: 20px;">
              ⏰ PRAZO FINAL: HOJE ATÉ 23h59
            </div>

            <h2 style="color: #0f172a; font-size: 17px; margin: 0 0 14px 0;">Prezados(as), boa tarde!</h2>
            
            <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 14px 0;">
              A Comissão Organizadora do 15º Congresso da Faculdade de Odontologia de Araçatuba (15º COFOA) agradece a todos pelas submissões de trabalhos científicos e pela participação em nosso evento.
            </p>

            <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 14px 0;">
              Reforçamos que, para os trabalhos aprovados com ressalvas, as correções solicitadas deverão ser realizadas e enviadas impreterivelmente <strong>até às 23h59 de hoje (11/11/2026)</strong>.
            </p>

            <div style="background-color: #f8fafc; border-left: 4px solid #0284c7; padding: 14px 16px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600;">Identificação do Trabalho</p>
              <p style="margin: 0 0 4px 0; font-size: 14px; color: #0284c7; font-weight: 700;">${displayCode}</p>
              <p style="margin: 0; font-size: 14px; color: #1e293b; font-weight: 600; line-height: 1.4;">${work.title}</p>
            </div>

            <div style="text-align: center; margin: 24px 0 24px 0;">
              <a href="${editUrl}" target="_blank" rel="noopener noreferrer" style="background-color: #0b1a30; color: #ffffff; padding: 14px 28px; border-radius: 6px; font-weight: 700; text-decoration: none; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                Corrigir e Reenviar Trabalho
              </a>
            </div>

            <p style="color: #b91c1c; font-size: 13px; font-weight: 600; line-height: 1.5; margin: 0 0 16px 0;">
              Ressaltamos que, após esse prazo, não serão aceitos novos envios de correções.
            </p>

            <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
              Agradecemos novamente a participação e a colaboração de todos!
            </p>

            <p style="color: #475569; font-size: 13px; line-height: 1.6; margin: 0;">
              Atenciosamente,<br/>
              <strong>Comissão Organizadora</strong><br/>
              15º COFOA – FOA/UNESP
            </p>

            <p style="color: #94a3b8; font-size: 11px; text-align: center; margin-top: 24px; line-height: 1.4;">
              Caso o botão não funcione, acesse diretamente:<br/>
              <a href="${editUrl}" style="color: #0284c7; word-break: break-all;">${editUrl}</a>
            </p>
          </div>

          <div style="padding: 16px; background-color: #0b1a30; text-align: center; color: #94a3b8; font-size: 12px;">
            COFOA XV — Faculdade de Odontologia de Araçatuba (FOA UNESP)<br/>
            Este é um comunicado oficial da Comissão Organizadora.
          </div>
        </div>
      `,
    };

    if (!isDryRun) {
      try {
        await transporter.sendMail(mailOptions);
        successCount++;
        console.log(`   -> ✅ Enviado com sucesso.`);
      } catch (err) {
        failCount++;
        console.error(`   -> ❌ Erro ao enviar para ${email}:`, err.message);

        if (err?.message?.toLowerCase().includes('ratelimit') || err?.message?.includes('451')) {
          console.warn('\n⚠️ COTA DA HOSTINGER ATINGIDA. Interrompendo envio do lote.');
          break;
        }
      }
      await sleep(2500); // 2.5s de intervalo para proteger cota
    } else {
      successCount++;
    }
  }

  console.log('\n================ RESUMO DO DISPARO ================');
  console.log(`Total de trabalhos processados: ${works.length}`);
  console.log(`Sucessos: ${successCount}`);
  console.log(`Falhas: ${failCount}`);
  console.log(`Ignorados: ${skippedCount}`);
  console.log('====================================================\n');
}

main()
  .catch(err => {
    console.error('Erro fatal:', err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
