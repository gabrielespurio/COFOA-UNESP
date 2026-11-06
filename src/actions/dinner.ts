'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { createOrGetCustomer, createPayment, deletePayment, checkPaymentStatus } from '@/lib/asaas';
import crypto from 'crypto';

async function checkCommitteeOrAdmin() {
  const session = await getSession();
  if (!session) throw new Error('Não autenticado.');
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user?.roles.some(r => r === 'COMMITTEE' || r === 'ADMIN')) {
    throw new Error('Acesso negado.');
  }
  return session;
}

/**
 * Retorna o convite de acompanhante do participante logado
 */
export async function getMyCompanionDinnerTicket() {
  const session = await getSession();
  if (!session) return null;

  const participant = await prisma.participant.findUnique({
    where: { userId: session.userId },
    include: {
      companionDinnerTicket: true,
      registration: { select: { status: true } }
    }
  });

  if (!participant) return null;

  return {
    ticket: participant.companionDinnerTicket,
    participantName: participant.fullName,
    isParticipantConfirmed: participant.registration?.status === 'CONFIRMED'
  };
}

/**
 * Gera a cobrança no Asaas e cria o registro do convite de acompanhante (R$ 185,00)
 */
export async function purchaseCompanionDinnerTicket(companionName?: string) {
  const session = await getSession();
  if (!session) return { error: 'Usuário não autenticado.' };

  const participant = await prisma.participant.findUnique({
    where: { userId: session.userId },
    include: {
      user: true,
      companionDinnerTicket: true,
      registration: true
    }
  });

  if (!participant) {
    return { error: 'Participante não encontrado. Complete seu perfil antes de prosseguir.' };
  }

  // Regra: Apenas 1 por participante
  const existing = participant.companionDinnerTicket;
  if (existing) {
    if (existing.status === 'PAID') {
      return { error: 'Você já possui um convite de acompanhante confirmado!' };
    }

    // Se estiver pendente, verifica se quer atualizar o nome do acompanhante
    if (companionName && companionName.trim() !== (existing.companionName || '')) {
      await prisma.companionDinnerTicket.update({
        where: { id: existing.id },
        data: { companionName: companionName.trim() }
      });
    }

    if (existing.invoiceUrl) {
      return { success: true, invoiceUrl: existing.invoiceUrl };
    }
  }

  try {
    // 1. Criar ou obter cliente no Asaas
    const customer = await createOrGetCustomer(
      participant.fullName,
      participant.cpf,
      participant.user.email,
      participant.phone
    );

    // 2. Data de vencimento (3 dias a partir de hoje)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    // 3. Criar cobrança no Asaas (R$ 185,00 = 18500 centavos)
    const cleanCompanionName = companionName?.trim();
    const description = `COFOA XV - Jantar Acompanhante${cleanCompanionName ? ` (${cleanCompanionName})` : ''} - Resp: ${participant.fullName}`;

    const asaasPayment = await createPayment(
      customer.id,
      18500, // R$ 185,00
      description,
      dueDateStr
    );

    // 4. Gerar Token único de QR Code (ex: JNT-XXXXXXXX)
    const uniqueHash = crypto.randomBytes(4).toString('hex').toUpperCase();
    const qrCodeToken = `JNT-${uniqueHash}`;

    // 5. Salvar ou atualizar no banco
    if (existing) {
      await prisma.companionDinnerTicket.update({
        where: { id: existing.id },
        data: {
          companionName: cleanCompanionName || null,
          amount: 18500,
          status: 'PENDING',
          gatewayId: asaasPayment.id,
          invoiceUrl: asaasPayment.invoiceUrl,
          qrCodeToken: existing.qrCodeToken || qrCodeToken,
        }
      });
    } else {
      await prisma.companionDinnerTicket.create({
        data: {
          participantId: participant.id,
          companionName: cleanCompanionName || null,
          amount: 18500,
          status: 'PENDING',
          gatewayId: asaasPayment.id,
          invoiceUrl: asaasPayment.invoiceUrl,
          qrCodeToken: qrCodeToken,
        }
      });
    }

    revalidatePath('/area-participante');
    revalidatePath('/area-participante/jantar');
    return { success: true, invoiceUrl: asaasPayment.invoiceUrl };
  } catch (err: any) {
    console.error('Error purchasing companion dinner ticket:', err);
    return { error: err.message || 'Erro ao gerar cobrança do jantar.' };
  }
}

/**
 * Consulta o status do pagamento no Asaas e sincroniza
 */
export async function syncCompanionDinnerPayment() {
  const session = await getSession();
  if (!session) return { error: 'Não autenticado.' };

  const participant = await prisma.participant.findUnique({
    where: { userId: session.userId },
    include: { companionDinnerTicket: true }
  });

  const ticket = participant?.companionDinnerTicket;
  if (!ticket || !ticket.gatewayId) {
    return { error: 'Nenhum convite pendente encontrado.' };
  }

  if (ticket.status === 'PAID') {
    return { success: true, isPaid: true, message: 'O convite já está confirmado!' };
  }

  try {
    const asaasData = await checkPaymentStatus(ticket.gatewayId);
    const isPaid = asaasData.status === 'RECEIVED' || asaasData.status === 'CONFIRMED' || asaasData.status === 'RECEIVED_IN_CASH';

    if (isPaid) {
      await prisma.companionDinnerTicket.update({
        where: { id: ticket.id },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          gatewayResponse: asaasData as any
        }
      });

      revalidatePath('/area-participante');
      revalidatePath('/area-participante/jantar');
      return { success: true, isPaid: true, message: 'Pagamento confirmado com sucesso!' };
    }

    return { success: true, isPaid: false, message: 'Pagamento ainda não compensado pelo banco.' };
  } catch (err: any) {
    console.error('Error syncing dinner payment:', err);
    return { error: err.message || 'Erro ao sincronizar pagamento.' };
  }
}

/**
 * Cancela a cobrança pendente do convite de acompanhante
 */
export async function cancelCompanionDinnerTicket() {
  const session = await getSession();
  if (!session) return { error: 'Não autenticado.' };

  const participant = await prisma.participant.findUnique({
    where: { userId: session.userId },
    include: { companionDinnerTicket: true }
  });

  const ticket = participant?.companionDinnerTicket;
  if (!ticket || ticket.status === 'PAID') {
    return { error: 'Nenhum convite pendente para cancelar.' };
  }

  try {
    if (ticket.gatewayId) {
      try {
        await deletePayment(ticket.gatewayId);
      } catch (e) {
        console.warn('Warning: Could not delete payment in Asaas:', e);
      }
    }

    await prisma.companionDinnerTicket.delete({
      where: { id: ticket.id }
    });

    revalidatePath('/area-participante');
    revalidatePath('/area-participante/jantar');
    return { success: true };
  } catch (err: any) {
    console.error('Error cancelling dinner ticket:', err);
    return { error: err.message || 'Erro ao cancelar convite.' };
  }
}

/**
 * Validação e Check-in na portaria do jantar (Uso Único)
 */
export async function scanDinnerTicket(token: string) {
  const session = await checkCommitteeOrAdmin();

  const cleanToken = token.trim();
  if (!cleanToken) {
    return { error: 'Código inválido.' };
  }

  // 1. Procurar por token de convite de acompanhante
  const companionTicket = await prisma.companionDinnerTicket.findFirst({
    where: {
      OR: [
        { qrCodeToken: cleanToken },
        { id: cleanToken }
      ]
    },
    include: {
      participant: {
        select: {
          id: true,
          fullName: true,
          cpf: true,
          user: { select: { email: true } }
        }
      }
    }
  });

  if (companionTicket) {
    if (companionTicket.status !== 'PAID') {
      return { 
        error: 'Convite NÃO confirmado (o pagamento ainda não foi concluído).',
        status: companionTicket.status
      };
    }

    // REGRA DE USO ÚNICO
    if (companionTicket.checkedInAt) {
      return {
        alreadyCheckedIn: true,
        error: 'ESTE CONVITE JÁ FOI UTILIZADO!',
        checkedInAt: companionTicket.checkedInAt.toISOString(),
        companionName: companionTicket.companionName || 'Acompanhante',
        participantName: companionTicket.participant.fullName,
      };
    }

    // Marca como utilizado na hora
    const updated = await prisma.companionDinnerTicket.update({
      where: { id: companionTicket.id },
      data: {
        checkedInAt: new Date(),
        scannedByUserId: session.userId,
      }
    });

    revalidatePath('/comissao/jantar');

    return {
      success: true,
      type: 'ACOMPANHANTE' as const,
      companionName: companionTicket.companionName || 'Acompanhante',
      participantName: companionTicket.participant.fullName,
      participantEmail: companionTicket.participant.user.email,
      checkedInAt: updated.checkedInAt?.toISOString(),
      message: 'Entrada de Acompanhante autorizada com sucesso!'
    };
  }

  // 2. Se não encontrou convite de acompanhante, verifica se é o crachá do próprio congressista
  const participant = await prisma.participant.findFirst({
    where: {
      OR: [
        { id: cleanToken },
        { cpf: cleanToken.replace(/\D/g, '') }
      ]
    },
    include: {
      registration: {
        include: { category: true }
      },
      user: { select: { email: true } }
    }
  });

  if (participant) {
    if (participant.registration?.status !== 'CONFIRMED') {
      return {
        error: `Inscrição do congressista ${participant.fullName} não está confirmada no evento.`
      };
    }

    return {
      success: true,
      type: 'CONGRESSISTA' as const,
      participantName: participant.fullName,
      participantEmail: participant.user.email,
      categoryName: participant.registration.category.name,
      message: 'Congressista inscrito com direito ao jantar (Acesso Liberado).'
    };
  }

  return { error: 'Código ou QR Code não encontrado no sistema.' };
}

/**
 * Lista de convidados e estatísticas do jantar para a comissão
 */
export async function getDinnerGuestList() {
  await checkCommitteeOrAdmin();

  const tickets = await prisma.companionDinnerTicket.findMany({
    include: {
      participant: {
        select: {
          fullName: true,
          cpf: true,
          phone: true,
          user: { select: { email: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const totalPaid = tickets.filter(t => t.status === 'PAID').length;
  const totalCheckedIn = tickets.filter(t => t.status === 'PAID' && t.checkedInAt).length;
  const totalPending = tickets.filter(t => t.status === 'PENDING').length;

  return {
    tickets,
    stats: {
      totalPaid,
      totalCheckedIn,
      totalPending,
      totalRevenue: totalPaid * 185
    }
  };
}
