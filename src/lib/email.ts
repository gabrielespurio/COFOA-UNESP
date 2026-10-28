import nodemailer from 'nodemailer';

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendPasswordResetEmail(to: string, code: string) {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"COFOA XV" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Redefinição de Senha - COFOA XV',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0b1a30; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">COFOA XV</h1>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
          <h2 style="color: #333333; font-size: 20px; margin-top: 0;">Redefinição de Senha</h2>
          <p style="color: #555555; line-height: 1.6;">Você solicitou a redefinição da sua senha. Utilize o código de 6 dígitos abaixo para criar uma nova senha e desbloquear sua conta (caso esteja bloqueada).</p>
          <div style="background-color: #f5f7fb; border: 1px dashed #0099ff; padding: 15px; text-align: center; margin: 25px 0; border-radius: 6px;">
            <span style="font-size: 32px; font-weight: bold; color: #0099ff; letter-spacing: 5px;">${code}</span>
          </div>
          <p style="color: #777777; font-size: 14px;">Este código expira em 30 minutos.</p>
          <p style="color: #555555; line-height: 1.6; margin-bottom: 0;">Se você não solicitou isso, pode ignorar este e-mail com segurança.</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export interface WorkRevisionEmailParams {
  to: string;
  participantName: string;
  workTitle: string;
  displayCode: string;
  comments: string;
  workId: string;
}

export async function sendWorkRevisionEmail({
  to,
  participantName,
  workTitle,
  displayCode,
  comments,
  workId,
}: WorkRevisionEmailParams) {
  const transporter = createTransporter();

  const baseUrl =
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://cofoa.com.br';

  const editUrl = `${baseUrl}/area-participante/trabalhos/${workId}/editar`;

  const mailOptions = {
    from: `"COFOA XV — Comissão Científica" <${process.env.SMTP_USER || 'comissao@cofoa.com.br'}>`,
    to,
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
            <p style="margin: 0; font-size: 15px; color: #1e293b; font-weight: 600; line-height: 1.4;">${workTitle}</p>
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

  await transporter.sendMail(mailOptions);
}

