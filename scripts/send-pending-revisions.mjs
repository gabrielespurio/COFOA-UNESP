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

if (!smtpUser || !smtpPass) {
  console.error('ERRO: SMTP_USER ou SMTP_PASS não configurados nas variáveis de ambiente.');
  console.error('Por favor, defina SMTP_USER e SMTP_PASS no arquivo .env ou no ambiente da Hostinger.');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: true,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://cofoa.com.br';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log('--- Iniciando Disparo Retroativo de E-mails de Ressalva ---');
  console.log(`Conectando ao banco Neon e SMTP (${smtpHost}:${smtpPort}) com remetente: ${smtpUser}`);

  try {
    await transporter.verify();
    console.log('✅ Conexão SMTP autenticada com sucesso!\n');
  } catch (smtpErr) {
    console.error('❌ Falha ao autenticar no servidor SMTP:', smtpErr.message);
    process.exit(1);
  }

  // Buscar apenas trabalhos com ressalvas que ainda NÃO foram notificados
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
  });

  console.log(`Encontrados ${works.length} trabalhos com ressalvas pendentes de notificação.\n`);

  if (works.length === 0) {
    console.log('🎉 Todos os trabalhos já foram notificados anteriormente!');
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
    const comments = work.reviewerComments || 'Favor verificar os apontamentos na plataforma.';
    const editUrl = `${baseUrl}/area-participante/trabalhos/${work.id}/editar`;

    if (!email) {
      console.warn(`[${i + 1}/${works.length}] ⚠️ Sem e-mail cadastrado para o trabalho ${displayCode} (ID: ${work.id}). Pulando.`);
      skippedCount++;
      continue;
    }

    console.log(`[${i + 1}/${works.length}] Enviando para ${email} | ${displayCode} - "${work.title.slice(0, 40)}..."`);

    const mailOptions = {
      from: `"COFOA XV — Comissão Científica" <${smtpUser}>`,
      to: email,
      subject: `Parecer da Avaliação: Trabalho Aprovado com Ressalvas (${displayCode}) - COFOA XV`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; background-color: #f8fafc;">
          <div style="background-color: #0b1a30; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">COFOA XV</h1>
            <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px;">15º Congresso da Faculdade de Odontologia de Araçatuba</p>
          </div>
          
          <div style="padding: 30px; background-color: #ffffff;">
            <div style="display: inline-block; padding: 6px 12px; background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 20px; color: #b45309; font-weight: 700; font-size: 13px; margin-bottom: 20px;">
              ⚠️ Aprovado com Ressalvas
            </div>

            <h2 style="color: #0f172a; font-size: 18px; margin: 0 0 12px 0;">Olá, ${participantName}!</h2>
            <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
              A avaliação do seu trabalho científico submetido ao <strong>COFOA XV</strong> foi realizada e ele foi <strong>Aprovado com Ressalvas</strong>.
            </p>

            <div style="background-color: #f1f5f9; border-left: 4px solid #0284c7; padding: 14px 16px; border-radius: 6px; margin-bottom: 22px;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600;">Identificação do Trabalho</p>
              <p style="margin: 0 0 4px 0; font-size: 14px; color: #0284c7; font-weight: 700;">${displayCode}</p>
              <p style="margin: 0; font-size: 15px; color: #1e293b; font-weight: 600; line-height: 1.4;">${work.title}</p>
            </div>

            <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 18px; margin-bottom: 26px;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #92400e; font-weight: 700;">📝 Parecer / Apontamentos do Avaliador:</p>
              <div style="color: #78350f; font-size: 14px; line-height: 1.6; white-space: pre-wrap; font-style: italic; background-color: #ffffff; padding: 12px; border-radius: 6px; border: 1px dashed #fcd34d;">${comments}</div>
            </div>

            <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
              Por favor, ajuste os pontos indicados pela banca avaliadora e reenvie a nova versão do arquivo na sua Área do Participante para que o trabalho possa ser aprovado definitivamente.
            </p>

            <div style="text-align: center; margin: 30px 0 20px 0;">
              <a href="${editUrl}" target="_blank" rel="noopener noreferrer" style="background-color: #0b1a30; color: #ffffff; padding: 14px 28px; border-radius: 6px; font-weight: 700; text-decoration: none; font-size: 15px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                Corrigir e Reenviar Trabalho
              </a>
            </div>

            <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 20px; line-height: 1.4;">
              Caso o botão não funcione, acesse diretamente o link abaixo:<br/>
              <a href="${editUrl}" style="color: #0284c7; word-break: break-all;">${editUrl}</a>
            </p>
          </div>

          <div style="padding: 16px; background-color: #0b1a30; text-align: center; color: #94a3b8; font-size: 12px;">
            COFOA XV — Faculdade de Odontologia de Araçatuba (FOA UNESP)<br/>
            Este é um e-mail automático enviado pela Comissão Científica.
          </div>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);

      // Marca no banco
      await prisma.scientificWork.update({
        where: { id: work.id },
        data: { revisionEmailSentAt: new Date() },
      });

      successCount++;
      console.log(`   -> ✅ Enviado e registrado no banco de dados.`);
    } catch (err) {
      failCount++;
      console.error(`   -> ❌ Erro ao enviar para ${email}:`, err.message);

      if (err?.message?.toLowerCase().includes('ratelimit') || err?.message?.includes('451')) {
        console.warn('\n⚠️ LIMITE DA HOSTINGER ATINGIDO. Interrompendo envio do lote.');
        break;
      }
    }

    // Intervalo de 3 segundos entre disparos para respeitar os limites da Hostinger
    await sleep(3000);
  }

  console.log('\n================ RESUMO DO DISPARO ================');
  console.log(`Sucessos marcados no banco: ${successCount}`);
  console.log(`Falhas: ${failCount}`);
  console.log(`Ignorados (sem e-mail): ${skippedCount}`);
  console.log('====================================================\n');
}

main()
  .catch(err => {
    console.error('Erro fatal durante o processo:', err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
