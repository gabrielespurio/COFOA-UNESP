'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function updateProfile(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session) {
    return { error: 'Usuário não autenticado.' };
  }

  const fullName = formData.get('fullName') as string;
  const cpf = formData.get('cpf') as string;
  const phone = formData.get('phone') as string;
  const birthDateStr = formData.get('birthDate') as string;
  
  // Optional fields
  const institution = formData.get('institution') as string || null;
  const city = formData.get('city') as string || null;
  const state = formData.get('state') as string || null;
  const course = formData.get('course') as string || null;

  if (!fullName || !cpf || !phone || !birthDateStr) {
    return { error: 'Por favor, preencha todos os campos obrigatórios (Nome, CPF, Celular, Data de Nascimento).' };
  }

  try {
    const birthDate = new Date(birthDateStr);
    
    // Check if CPF is already used by someone else
    const existingCpf = await prisma.participant.findUnique({
      where: { cpf }
    });
    
    if (existingCpf && existingCpf.userId !== session.userId) {
      return { error: 'Este CPF já está cadastrado em outra conta.' };
    }

    // Upsert participant record
    await prisma.participant.upsert({
      where: { userId: session.userId },
      update: {
        fullName,
        cpf,
        phone,
        birthDate,
        institution,
        city,
        state,
        course,
      },
      create: {
        userId: session.userId,
        fullName,
        cpf,
        phone,
        birthDate,
        institution,
        city,
        state,
        course,
      }
    });

    revalidatePath('/area-participante');
  } catch (error) {
    console.error('Update profile error:', error);
    return { error: 'Ocorreu um erro ao salvar seu perfil. Tente novamente.' };
  }
  
  redirect('/area-participante');
}

export async function createRegistration(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: 'Usuário não autenticado.' };

  const participant = await prisma.participant.findUnique({ where: { userId: session.userId } });
  if (!participant) return { error: 'Perfil incompleto. Preencha seus dados antes de se inscrever.' };

  const existing = await prisma.registration.findFirst({ where: { participantId: participant.id } });
  if (existing) return { error: 'Você já possui uma inscrição registrada.' };

  const categoryId = formData.get('categoryId') as string;
  const file = formData.get('file') as File | null;
  let proofUrl = null;

  if (!categoryId) {
    return { error: 'Categoria não informada.' };
  }

  try {
    if (file && file.size > 0) {
      const supabaseAdmin = getSupabaseAdmin();
      const fileExt = file.name.split('.').pop();
      const fileName = `${participant.id}-${Date.now()}.${fileExt}`;
      const filePath = `comprovantes/${fileName}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await supabaseAdmin.storage
        .from('comprovantes')
        .upload(filePath, buffer, {
          contentType: file.type,
        });

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        return { error: 'Falha ao fazer upload do comprovante.' };
      }

      const { data: publicUrlData } = supabaseAdmin.storage
        .from('comprovantes')
        .getPublicUrl(filePath);

      proofUrl = publicUrlData.publicUrl;
    }

    if (proofUrl) {
      await prisma.participant.update({
        where: { id: participant.id },
        data: { studentProofUrl: proofUrl }
      });
    }

    // Usually we would calculate the amount based on the category and active batch.
    let batch = await prisma.registrationBatch.findFirst({
      orderBy: { createdAt: 'asc' }
    });

    if (!batch) {
      batch = await prisma.registrationBatch.create({
        data: {
          name: 'Lote Atual',
          status: 'ACTIVE',
          priceStandard: 19500,
          priceOnlineTier1: 8000,
          priceOnlineTier2: 10000,
        }
      });
    }

    await prisma.registration.create({
      data: {
        participantId: participant.id,
        categoryId,
        batchId: batch.id,
        status: 'PENDING',
        amount: 0,
      }
    });
    revalidatePath('/area-participante');
  } catch (err) {
    console.error(err);
    return { error: 'Erro ao processar sua inscrição. Tente novamente.' };
  }
  redirect('/area-participante');
}
