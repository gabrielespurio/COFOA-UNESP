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
    where: { userId: session.userId },
    include: { registration: true, scientificWorks: true }
  });

  if (!participant) {
    return { error: 'Perfil de participante não encontrado.' };
  }

  if (!participant.registration || participant.registration.status !== 'CONFIRMED') {
    return { error: 'Você precisa confirmar o pagamento da sua inscrição para submeter trabalhos.' };
  }

  const title = formData.get('title') as string;
  const abstractText = formData.get('abstract') as string;
  const categoryArea = formData.get('categoryArea') as string;
  const modality = formData.get('modality') as string;
  const advisor = formData.get('advisor') as string;
  const presenter = formData.get('presenter') as string;
  const authorsStr = formData.get('authors') as string;
  const identifiedFileUrl = formData.get('identifiedFileUrl') as string | null;
  const unidentifiedFileUrl = formData.get('unidentifiedFileUrl') as string | null;
  const enrollmentProofUrl = formData.get('enrollmentProofUrl') as string | null;

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

  if (!identifiedFileUrl || !unidentifiedFileUrl || !enrollmentProofUrl) {
    return { error: 'O upload de um ou mais arquivos não foi concluído.' };
  }

  try {
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
        status: 'UNDER_REVIEW',
        submittedAt: new Date()
      }
    });

    revalidatePath('/area-participante/trabalhos');
  } catch (err: any) {
    console.error('Error submitting work:', err);
    return { error: err.message || 'Ocorreu um erro ao salvar o trabalho. Tente novamente.' };
  }

  redirect('/area-participante/trabalhos');
}

export async function resubmitWork(formData: FormData) {
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

  const workId = formData.get('workId') as string;
  if (!workId) {
    return { error: 'ID do trabalho não informado.' };
  }

  const existingWork = await prisma.scientificWork.findUnique({
    where: { id: workId }
  });

  if (!existingWork || existingWork.participantId !== participant.id) {
    return { error: 'Trabalho não encontrado ou sem permissão.' };
  }

  const title = formData.get('title') as string;
  const abstractText = formData.get('abstract') as string;
  const categoryArea = formData.get('categoryArea') as string;
  const modality = formData.get('modality') as string;
  const advisor = formData.get('advisor') as string;
  const presenter = formData.get('presenter') as string;
  const authorsStr = formData.get('authors') as string;
  
  // These will only be present if new files were uploaded
  const newIdentifiedFileUrl = formData.get('identifiedFileUrl') as string | null;
  const newUnidentifiedFileUrl = formData.get('unidentifiedFileUrl') as string | null;
  const newEnrollmentProofUrl = formData.get('enrollmentProofUrl') as string | null;

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

  try {
    let identifiedFileUrl = existingWork.identifiedFileUrl;
    let unidentifiedFileUrl = existingWork.unidentifiedFileUrl;
    let enrollmentProofUrl = existingWork.enrollmentProofUrl;

    if (newIdentifiedFileUrl) identifiedFileUrl = newIdentifiedFileUrl;
    if (newUnidentifiedFileUrl) unidentifiedFileUrl = newUnidentifiedFileUrl;
    if (newEnrollmentProofUrl) enrollmentProofUrl = newEnrollmentProofUrl;

    await prisma.scientificWork.update({
      where: { id: workId },
      data: {
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
        status: 'UNDER_REVIEW', // Voltar para avaliação
        submittedAt: new Date()
      }
    });

    revalidatePath('/area-participante/trabalhos');
  } catch (err: any) {
    console.error('Error resubmitting work:', err);
    return { error: err.message || 'Ocorreu um erro ao reenviar o trabalho. Tente novamente.' };
  }

  redirect('/area-participante/trabalhos');
}
