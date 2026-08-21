'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function submitWork(formData: FormData) {
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

  const title = formData.get('title') as string;
  const abstractText = formData.get('abstract') as string;
  const categoryArea = formData.get('categoryArea') as string;
  const modality = formData.get('modality') as string;
  const advisor = formData.get('advisor') as string;
  const presenter = formData.get('presenter') as string;
  const authorsStr = formData.get('authors') as string;
  const file = formData.get('file') as File | null;

  if (!title || !abstractText || !categoryArea || !modality || !advisor || !presenter || !authorsStr) {
    return { error: 'Por favor, preencha todos os campos obrigatórios.' };
  }

  let authors = [];
  try {
    authors = JSON.parse(authorsStr);
    if (!Array.isArray(authors) || authors.length === 0) {
      return { error: 'É obrigatório informar ao menos um autor.' };
    }
  } catch (e) {
    return { error: 'Erro ao processar lista de autores.' };
  }

  if (!file || file.size === 0) {
    return { error: 'É obrigatório anexar o PDF do trabalho.' };
  }

  if (file.size > 10 * 1024 * 1024) {
    return { error: 'O arquivo excede o limite de 10MB.' };
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const fileExt = file.name.split('.').pop() || 'pdf';
    const fileName = `${participant.id}-work-${Date.now()}.${fileExt}`;
    const filePath = `works/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from('trabalhos')
      .upload(filePath, buffer, {
        contentType: file.type || 'application/pdf',
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return { error: 'Falha ao fazer upload do arquivo do trabalho.' };
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from('trabalhos')
      .getPublicUrl(filePath);

    const fileUrl = publicUrlData.publicUrl;

    await prisma.scientificWork.create({
      data: {
        participantId: participant.id,
        title,
        abstract: abstractText,
        categoryArea,
        modality,
        advisor,
        presenter,
        authors: authorsStr, // Stores JSON as string/JSON type depending on Prisma mapping
        fileUrl,
        status: 'SUBMITTED',
        submittedAt: new Date()
      }
    });

    revalidatePath('/area-participante/trabalhos');
  } catch (err) {
    console.error('Error submitting work:', err);
    return { error: 'Ocorreu um erro ao submeter o trabalho. Tente novamente.' };
  }

  redirect('/area-participante/trabalhos');
}
