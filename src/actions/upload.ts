'use server';

import { getSupabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function generateUploadUrls(filesToUpload: { suffix: string, fileExt: string }[]) {
  const session = await getSession();
  if (!session) {
    return { error: 'Usuário não autenticado.' };
  }

  const participant = await prisma.participant.findUnique({
    where: { userId: session.userId }
  });

  if (!participant) {
    return { error: 'Perfil de participante não encontrado.' };
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const timestamp = Date.now();
    const urls = [];

    for (const file of filesToUpload) {
      const fileName = `${participant.id}-work-${file.suffix}-${timestamp}.${file.fileExt}`;
      const filePath = `works/${fileName}`;

      const { data, error } = await supabaseAdmin.storage
        .from('trabalhos')
        .createSignedUploadUrl(filePath);

      if (error || !data) {
        console.error('Error generating signed URL:', error);
        throw new Error('Falha ao gerar URL de upload para ' + file.suffix);
      }

      urls.push({
        suffix: file.suffix,
        filePath,
        token: data.token,
        signedUrl: data.signedUrl
      });
    }

    return { urls };
  } catch (err: any) {
    console.error('Error in generateUploadUrls:', err);
    return { error: 'Erro ao preparar o upload. Tente novamente.' };
  }
}
