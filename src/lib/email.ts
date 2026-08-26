import nodemailer from 'nodemailer';

export async function sendPasswordResetEmail(to: string, code: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

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
