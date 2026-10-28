'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { RegistrationStatus } from '@prisma/client';
import { sendWorkRevisionEmail } from '@/lib/email';

async function checkAdmin() {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  const user = await prisma.user.findUnique({ where: { id: session.userId }});
  if (!user?.roles.includes('ADMIN')) throw new Error('Forbidden');
}

export async function updateRegistrationStatus(registrationId: string, status: RegistrationStatus) {
  await checkAdmin();

  try {
    const updatedReg = await prisma.registration.update({
      where: { id: registrationId },
      data: { status },
      include: { participant: true, category: true }
    });

    if (status === 'CONFIRMED' && (updatedReg.category.id === 'banca-int' || updatedReg.category.id === 'banca-ext')) {
      const user = await prisma.user.findUnique({ where: { id: updatedReg.participant.userId }});
      if (user && !user.roles.includes('EVALUATOR')) {
        await prisma.user.update({
          where: { id: user.id },
          data: { roles: { push: 'EVALUATOR' } }
        });
      }
    }

    revalidatePath('/admin/inscricoes');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Falha ao atualizar o status' };
  }
}

export async function evaluateWorkStage1(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  const user = await prisma.user.findUnique({ where: { id: session.userId }});
  if (!user?.roles.includes('ADMIN') && !user?.roles.includes('SCREENER')) throw new Error('Forbidden');

  const workId = formData.get('workId') as string;
  const decision = formData.get('decision') as string;
  const comments = formData.get('comments') as string;

  if (!workId || !decision) {
    return { error: 'Dados incompletos.' };
  }

  const work = await prisma.scientificWork.findUnique({
    where: { id: workId },
    include: {
      participant: {
        include: {
          user: true,
        },
      },
    },
  });
  if (!work) {
    return { error: 'Trabalho nÃ£o encontrado.' };
  }

  if (decision === 'APPROVE') {
    try {
      await prisma.scientificWork.update({
        where: { id: workId },
        data: { stage1Approved: true, status: 'UNDER_REVIEW' }
      });
      revalidatePath('/triagem');
      revalidatePath('/comissao/trabalhos');
      return { success: true };
    } catch (err) {
      console.error(err);
      return { error: 'Erro ao aprovar a triagem.' };
    }
  } else if (decision === 'REJECT') {
    if (!comments || comments.trim().length === 0) {
      return { error: 'Ao reprovar na triagem, Ã© obrigatÃ³rio preencher o motivo (ressalva).' };
    }

    try {
      await prisma.scientificWork.update({
        where: { id: workId },
        data: {
          status: 'REVISION_REQUESTED',
          reviewerComments: comments,
          stage1Approved: false
        }
      });

      if (work.participant?.user?.email) {
        try {
          await sendWorkRevisionEmail({
            to: work.participant.user.email,
            participantName: work.participant.fullName || 'Participante',
            workTitle: work.title,
            displayCode: work.displayCode || 'Trabalho Científico',
            comments: comments,
            workId: work.id,
          });

          await prisma.scientificWork.update({
            where: { id: workId },
            data: { revisionEmailSentAt: new Date() },
          });
        } catch (emailErr) {
          console.error('Falha ao enviar e-mail de ressalva (triagem):', emailErr);
        }
      }

      revalidatePath('/triagem');
      return { success: true };
    } catch (err) {
      console.error(err);
      return { error: 'Erro ao reprovar a triagem.' };
    }
  }

  return { error: 'DecisÃ£o invÃ¡lida.' };
}

export async function adminCancelRegistration({
  registrationId,
  mode,
  cancelAsaas = true,
  removeCoupon = false,
}: {
  registrationId: string;
  mode: 'DELETE' | 'MARK_CANCELLED';
  cancelAsaas?: boolean;
  removeCoupon?: boolean;
}) {
  await checkAdmin();

  try {
    const reg = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        payment: true,
        coupon: true,
        participant: true,
      }
    });

    if (!reg) {
      return { error: 'InscriÃ§Ã£o nÃ£o encontrada.' };
    }

    // 1. Cancel Asaas invoice if requested and exists
    if (cancelAsaas && reg.payment?.gatewayId) {
      try {
        const { deletePayment } = await import('@/lib/asaas');
        await deletePayment(reg.payment.gatewayId);
      } catch (asaasErr: any) {
        console.warn('Aviso: Falha ao deletar fatura no Asaas:', asaasErr.message);
      }
    }

    // 2. Coupon handling
    if (reg.couponId) {
      if (removeCoupon) {
        await prisma.coupon.update({
          where: { id: reg.couponId },
          data: { active: false, usedCount: { decrement: 1 } }
        }).catch(console.error);
      } else {
        await prisma.coupon.update({
          where: { id: reg.couponId },
          data: { usedCount: { decrement: 1 } }
        }).catch(console.error);
      }
    }

    if (mode === 'DELETE') {
      if (reg.payment) {
        await prisma.payment.delete({ where: { id: reg.payment.id } }).catch(console.error);
      }
      await prisma.registration.delete({
        where: { id: registrationId }
      });
    } else {
      await prisma.registration.update({
        where: { id: registrationId },
        data: { status: 'CANCELLED' }
      });
      if (reg.payment) {
        await prisma.payment.update({
          where: { id: reg.payment.id },
          data: { status: 'CANCELLED' }
        }).catch(console.error);
      }
    }

    revalidatePath('/admin/inscricoes');
    revalidatePath('/admin/participantes');
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    console.error('Error in adminCancelRegistration:', error);
    return { error: error.message || 'Erro ao cancelar inscriÃ§Ã£o.' };
  }
}

export async function adminChangeCategory({
  registrationId,
  newCategoryId,
  customAmountCents,
}: {
  registrationId: string;
  newCategoryId: string;
  customAmountCents?: number;
}) {
  await checkAdmin();

  try {
    const category = await prisma.registrationCategory.findUnique({
      where: { id: newCategoryId }
    });
    if (!category) {
      return { error: 'Categoria selecionada nÃ£o existe.' };
    }

    const reg = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: { payment: true }
    });
    if (!reg) {
      return { error: 'InscriÃ§Ã£o nÃ£o encontrada.' };
    }

    const dataToUpdate: any = {
      categoryId: newCategoryId,
    };

    if (typeof customAmountCents === 'number' && !isNaN(customAmountCents)) {
      dataToUpdate.amount = customAmountCents;
    }

    await prisma.registration.update({
      where: { id: registrationId },
      data: dataToUpdate
    });

    if (dataToUpdate.amount !== undefined && reg.payment) {
      await prisma.payment.update({
        where: { id: reg.payment.id },
        data: { amount: dataToUpdate.amount }
      }).catch(console.error);
    }

    revalidatePath('/admin/inscricoes');
    revalidatePath('/admin/participantes');
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    console.error('Error in adminChangeCategory:', error);
    return { error: error.message || 'Erro ao alterar categoria.' };
  }
}

export async function adminUpdateParticipantData({
  participantId,
  fullName,
  email,
  cpf,
  phone,
  institution,
  city,
  state,
  course,
  croNumber,
}: {
  participantId: string;
  fullName: string;
  email: string;
  cpf: string;
  phone?: string | null;
  institution?: string | null;
  city?: string | null;
  state?: string | null;
  course?: string | null;
  croNumber?: string | null;
}) {
  await checkAdmin();

  try {
    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
      include: { user: true }
    });

    if (!participant) {
      return { error: 'Participante nÃ£o encontrado.' };
    }

    if (email && email.toLowerCase() !== participant.user.email.toLowerCase()) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });
      if (existingEmail && existingEmail.id !== participant.userId) {
        return { error: 'Este e-mail jÃ¡ estÃ¡ sendo utilizado por outro usuÃ¡rio.' };
      }
    }

    if (cpf && cpf !== participant.cpf) {
      const existingCpf = await prisma.participant.findUnique({
        where: { cpf }
      });
      if (existingCpf && existingCpf.id !== participantId) {
        return { error: 'Este CPF jÃ¡ estÃ¡ sendo utilizado por outro participante.' };
      }
    }

    await prisma.user.update({
      where: { id: participant.userId },
      data: { email: email.toLowerCase() }
    });

    await prisma.participant.update({
      where: { id: participantId },
      data: {
        fullName,
        cpf,
        phone: phone || null,
        institution: institution || null,
        city: city || null,
        state: state || null,
        course: course || null,
        croNumber: croNumber || null,
      }
    });

    revalidatePath('/admin/participantes');
    revalidatePath('/admin/inscricoes');
    revalidatePath('/admin/usuarios');
    return { success: true };
  } catch (error: any) {
    console.error('Error in adminUpdateParticipantData:', error);
    return { error: error.message || 'Erro ao atualizar dados do participante.' };
  }
}

export async function adminManualConfirm({
  registrationId,
  isExempt = false,
}: {
  registrationId: string;
  isExempt?: boolean;
}) {
  await checkAdmin();

  try {
    const reg = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: { payment: true, category: true, participant: true }
    });

    if (!reg) {
      return { error: 'InscriÃ§Ã£o nÃ£o encontrada.' };
    }

    await prisma.registration.update({
      where: { id: registrationId },
      data: {
        status: 'CONFIRMED',
        ...(isExempt ? { amount: 0 } : {})
      }
    });

    if (reg.payment) {
      await prisma.payment.update({
        where: { id: reg.payment.id },
        data: {
          status: 'PAID',
          ...(isExempt ? { amount: 0 } : {})
        }
      });
    }

    if (reg.category.id === 'banca-int' || reg.category.id === 'banca-ext') {
      const user = await prisma.user.findUnique({ where: { id: reg.participant.userId } });
      if (user && !user.roles.includes('EVALUATOR')) {
        await prisma.user.update({
          where: { id: user.id },
          data: { roles: { push: 'EVALUATOR' } }
        });
      }
    }

    revalidatePath('/admin/inscricoes');
    revalidatePath('/admin/participantes');
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    console.error('Error in adminManualConfirm:', error);
    return { error: error.message || 'Erro ao confirmar inscriÃ§Ã£o.' };
  }
}

export async function adminSyncAsaasPayment({ registrationId }: { registrationId: string }) {
  await checkAdmin();

  try {
    const reg = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: { payment: true, category: true, participant: true }
    });

    if (!reg) {
      return { error: 'InscriÃ§Ã£o nÃ£o encontrada.' };
    }

    if (!reg.payment?.gatewayId) {
      return { error: 'Esta inscriÃ§Ã£o nÃ£o possui fatura gerada no Asaas.' };
    }

    const { checkPaymentStatus } = await import('@/lib/asaas');
    const asaasData = await checkPaymentStatus(reg.payment.gatewayId);

    const isPaid = asaasData.status === 'RECEIVED' || asaasData.status === 'CONFIRMED' || asaasData.status === 'RECEIVED_IN_CASH';

    if (isPaid) {
      await prisma.registration.update({
        where: { id: registrationId },
        data: { status: 'CONFIRMED' }
      });

      await prisma.payment.update({
        where: { id: reg.payment.id },
        data: { status: 'PAID', gatewayResponse: asaasData as any }
      });

      if (reg.category.id === 'banca-int' || reg.category.id === 'banca-ext') {
        const user = await prisma.user.findUnique({ where: { id: reg.participant.userId } });
        if (user && !user.roles.includes('EVALUATOR')) {
          await prisma.user.update({
            where: { id: user.id },
            data: { roles: { push: 'EVALUATOR' } }
          });
        }
      }

      revalidatePath('/admin/inscricoes');
      revalidatePath('/admin/participantes');
      revalidatePath('/admin');
      return { 
        success: true, 
        isPaid: true,
        message: `Pagamento CONFIRMADO no Asaas (R$ ${asaasData.value?.toFixed(2) || '0.00'} via ${asaasData.billingType || 'Asaas'}). A inscriÃ§Ã£o agora estÃ¡ Confirmada!`
      };
    } else {
      await prisma.payment.update({
        where: { id: reg.payment.id },
        data: { gatewayResponse: asaasData as any }
      });

      revalidatePath('/admin/inscricoes');
      return { 
        success: true, 
        isPaid: false,
        message: `Consulta realizada no Asaas: o status atual da fatura Ã© "${asaasData.status}". Ainda nÃ£o consta como paga.`
      };
    }
  } catch (error: any) {
    console.error('Error in adminSyncAsaasPayment:', error);
    return { error: error.message || 'Erro ao sincronizar com Asaas.' };
  }
}

export async function adminChangeRegistrationStatus({
  registrationId,
  status,
}: {
  registrationId: string;
  status: RegistrationStatus;
}) {
  await checkAdmin();

  try {
    const reg = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: { payment: true, category: true, participant: true }
    });

    if (!reg) {
      return { error: 'InscriÃ§Ã£o nÃ£o encontrada.' };
    }

    await prisma.registration.update({
      where: { id: registrationId },
      data: { status }
    });

    if (reg.payment) {
      const paymentStatus = status === 'CONFIRMED' ? 'PAID' : status === 'CANCELLED' ? 'CANCELLED' : 'PENDING';
      await prisma.payment.update({
        where: { id: reg.payment.id },
        data: { status: paymentStatus }
      }).catch(console.error);
    }

    if (status === 'CONFIRMED' && (reg.category.id === 'banca-int' || reg.category.id === 'banca-ext')) {
      const user = await prisma.user.findUnique({ where: { id: reg.participant.userId } });
      if (user && !user.roles.includes('EVALUATOR')) {
        await prisma.user.update({
          where: { id: user.id },
          data: { roles: { push: 'EVALUATOR' } }
        });
      }
    }

    revalidatePath('/admin/inscricoes');
    revalidatePath('/admin/participantes');
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    console.error('Error in adminChangeRegistrationStatus:', error);
    return { error: error.message || 'Erro ao alterar status da inscriÃ§Ã£o.' };
  }
}

export async function adminSyncAllPendingPayments() {
  await checkAdmin();

  try {
    const regsToCheck = await prisma.registration.findMany({
      where: {
        payment: {
          gatewayId: { not: null }
        },
        OR: [
          { status: { not: 'CONFIRMED' } },
          { payment: { status: { not: 'PAID' } } }
        ]
      },
      include: { payment: true }
    });

    if (regsToCheck.length === 0) {
      return { success: true, message: 'Todas as inscriÃ§Ãµes com faturas jÃ¡ estÃ£o sincronizadas e em dia.' };
    }

    const { checkPaymentStatus } = await import('@/lib/asaas');
    let updatedCount = 0;

    for (const reg of regsToCheck) {
      if (!reg.payment?.gatewayId) continue;

      try {
        const asaasData = await checkPaymentStatus(reg.payment.gatewayId);
        const isPaid = asaasData.status === 'RECEIVED' || asaasData.status === 'CONFIRMED' || asaasData.status === 'RECEIVED_IN_CASH';

        if (isPaid && (reg.status !== 'CONFIRMED' || reg.payment.status !== 'PAID')) {
          await prisma.registration.update({
            where: { id: reg.id },
            data: { status: 'CONFIRMED' }
          });

          await prisma.payment.update({
            where: { id: reg.payment.id },
            data: { status: 'PAID', gatewayResponse: asaasData as any }
          });

          updatedCount++;
        }
      } catch (err: any) {
        console.warn(`Erro ao checar pagamento ${reg.payment.gatewayId}:`, err.message);
      }
    }

    revalidatePath('/admin/inscricoes');
    revalidatePath('/admin/participantes');
    revalidatePath('/admin');

    return {
      success: true,
      message: `Varredura concluÃ­da! ${regsToCheck.length} fatura(s) verificadas no Asaas. ${updatedCount} inscriÃ§Ã£o(Ãµes) foram confirmadas.`
    };
  } catch (error: any) {
    console.error('Error in adminSyncAllPendingPayments:', error);
    return { error: error.message || 'Erro ao sincronizar todas as faturas.' };
  }
}


