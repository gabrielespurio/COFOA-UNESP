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
      let cleanExt = (file.fileExt || 'pdf').toLowerCase().trim().replace(/[^a-z0-9]/g, '') || 'pdf';
      if (!['pdf', 'png', 'jpg', 'jpeg'].includes(cleanExt)) {
        cleanExt = 'pdf';
      }

      const fileName = `${participant.id}-work-${file.suffix}-${timestamp}.${cleanExt}`;
      const filePath = `works/${fileName}`;

      const { data, error } = await supabaseAdmin.storage
        .from('trabalhos')
        .createSignedUploadUrl(filePath, { upsert: true });

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

export async function uploadWorkFileServer(formData: FormData) {
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

  const file = formData.get('file') as File | null;
  const suffix = (formData.get('suffix') as string) || 'file';

  if (!file || file.size === 0) {
    return { error: 'Arquivo não selecionado ou vazio.' };
  }

  if (file.size > 12 * 1024 * 1024) {
    return { error: 'O arquivo excede o limite máximo permitido de 10MB.' };
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const timestamp = Date.now();

    let ext = 'pdf';
    if (file.name && file.name.includes('.')) {
      ext = file.name.split('.').pop()?.toLowerCase().trim().replace(/[^a-z0-9]/g, '') || 'pdf';
    }
    const cleanExt = ['pdf', 'png', 'jpg', 'jpeg'].includes(ext) ? ext : 'pdf';

    const fileName = `${participant.id}-work-${suffix}-${timestamp}.${cleanExt}`;
    const filePath = `works/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from('trabalhos')
      .upload(filePath, buffer, {
        upsert: true,
        contentType: file.type || 'application/pdf',
      });

    if (uploadError) {
      console.error('Supabase server-side upload error:', uploadError);
      return { error: `Erro no armazenamento do arquivo (${suffix}): ${uploadError.message}` };
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from('trabalhos')
      .getPublicUrl(filePath);

    return { publicUrl: publicUrlData.publicUrl };
  } catch (err: any) {
    console.error('Server upload fallback exception:', err);
    return { error: err.message || 'Erro inesperado no servidor ao processar o arquivo.' };
  }
}
