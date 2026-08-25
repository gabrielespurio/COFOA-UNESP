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
  const identifiedFile = formData.get('identifiedFile') as File | null;
  const unidentifiedFile = formData.get('unidentifiedFile') as File | null;
  const enrollmentProof = formData.get('enrollmentProof') as File | null;

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

  if (!identifiedFile || identifiedFile.size === 0 || 
      !unidentifiedFile || unidentifiedFile.size === 0 || 
      !enrollmentProof || enrollmentProof.size === 0) {
    return { error: 'É obrigatório anexar os 3 arquivos PDF (identificado, não identificado e comprovante).' };
  }

  if (identifiedFile.size > 10 * 1024 * 1024 || 
      unidentifiedFile.size > 10 * 1024 * 1024 || 
      enrollmentProof.size > 10 * 1024 * 1024) {
    return { error: 'Cada arquivo deve ter no máximo 10MB.' };
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const timestamp = Date.now();
    
    // Helper to upload a single file
    const uploadFile = async (file: File, suffix: string) => {
      const fileExt = file.name.split('.').pop() || 'pdf';
      const fileName = `${participant.id}-work-${suffix}-${timestamp}.${fileExt}`;
      const filePath = `works/${fileName}`;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await supabaseAdmin.storage
        .from('trabalhos')
        .upload(filePath, buffer, {
          contentType: file.type || 'application/pdf',
        });

      if (uploadError) {
        throw new Error(`Upload falhou para ${suffix}`);
      }

      const { data: publicUrlData } = supabaseAdmin.storage
        .from('trabalhos')
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    };

    const identifiedFileUrl = await uploadFile(identifiedFile, 'id');
    const unidentifiedFileUrl = await uploadFile(unidentifiedFile, 'unid');
    const enrollmentProofUrl = await uploadFile(enrollmentProof, 'proof');

    const crypto = require('crypto');
    const displayCode = `TRB-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    await prisma.scientificWork.create({
      data: {
        participantId: participant.id,
        displayCode,
        title,
        abstract: abstractText,
        categoryArea,
        modality,
        advisor,
        presenter,
        authors: authorsStr,
        identifiedFileUrl,
        unidentifiedFileUrl,
        enrollmentProofUrl,
        status: 'SUBMITTED',
        submittedAt: new Date()
      }
    });

    revalidatePath('/area-participante/trabalhos');
  } catch (err: any) {
    console.error('Error submitting work:', err);
    return { error: err.message || 'Ocorreu um erro ao submeter o trabalho. Tente novamente.' };
  }

  redirect('/area-participante/trabalhos');
}
