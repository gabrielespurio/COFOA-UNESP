'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase';
import { createOrGetCustomer, createPayment } from '@/lib/asaas';
import { getCurrentDate, getBatchStatus } from '@/lib/dateUtils';

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

  const participant = await prisma.participant.findUnique({ 
    where: { userId: session.userId },
    include: { user: true }
  });
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

    // Fetch Category to determine price tier
    const category = await prisma.registrationCategory.findUnique({ where: { id: categoryId } });
    if (!category) return { error: 'Categoria inválida.' };

    // Get Active Batch based on date
    const currentDate = await getCurrentDate();
    const batches = await prisma.registrationBatch.findMany();
    let batch = batches.find(b => getBatchStatus(b.startDate?.toISOString() || null, b.endDate?.toISOString() || null, currentDate) === 'ACTIVE');
    
    // Fallback to first batch if none is ACTIVE (just as fallback)
    if (!batch) {
      batch = batches[0];
    }
    if (!batch) {
      return { error: 'Não há lotes disponíveis para inscrição.' };
    }

    let finalAmount = 0;
    switch(category.priceTier) {
      case 'PRESENCIAL_TIER1': finalAmount = batch.pricePresencialTier1; break;
      case 'PRESENCIAL_TIER2': finalAmount = batch.pricePresencialTier2; break;
      case 'PRESENCIAL_TIER3': finalAmount = batch.pricePresencialTier3; break;
      case 'ONLINE_TIER1': finalAmount = batch.priceOnlineTier1; break;
      case 'ONLINE_TIER2': finalAmount = batch.priceOnlineTier2; break;
    }

    // 1. Create/Get Asaas Customer
    const asaasCustomer = await createOrGetCustomer(
      participant.fullName,
      participant.cpf,
      participant.user.email,
      participant.phone
    );

    // 2. Set Due Date (3 days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    // 3. Create Payment in Asaas
    const asaasPayment = await createPayment(
      asaasCustomer.id,
      finalAmount,
      `Inscrição COFOA XV - ${category.name}`,
      dueDateStr
    );

    // 4. Save Registration and Payment to DB
    const registration = await prisma.registration.create({
      data: {
        participantId: participant.id,
        categoryId,
        batchId: batch.id,
        status: 'PENDING',
        amount: finalAmount,
      }
    });

    await prisma.payment.create({
      data: {
        registrationId: registration.id,
        amount: finalAmount,
        gatewayId: asaasPayment.id,
        gatewayResponse: asaasPayment as any,
      }
    });

    revalidatePath('/area-participante');
  } catch (err) {
    console.error(err);
    return { error: 'Erro ao processar sua inscrição ou comunicação com gateway falhou.' };
  }
  
  redirect('/area-participante/pagamento');
}
