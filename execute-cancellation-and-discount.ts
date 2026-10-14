import 'dotenv/config';
import { prisma } from './src/lib/prisma';
import { createOrGetCustomer, createPayment, deletePayment, checkPaymentStatus } from './src/lib/asaas';

interface TargetConfig {
  name: string;
  batchId: string; // Batch they registered in
  baseAmount: number; // in cents
  discountAmount: number; // in cents
}

const targets: TargetConfig[] = [
  {
    name: 'Louyse Vitória Oliveira Andreo',
    batchId: 'cmt4t2ls90003xkv1no6b5ta5', // 1º Lote
    baseAmount: 18500,
    discountAmount: 10000
  },
  {
    name: 'Giovanna Montilha de Flavis',
    batchId: 'cmt4t2ls90003xkv1no6b5ta5', // 1º Lote
    baseAmount: 18500,
    discountAmount: 10000
  },
  {
    name: 'Ana Laura Gavaldão Santana Moreira',
    batchId: 'cmt4t2ls90003xkv1no6b5ta5', // 1º Lote
    baseAmount: 18500,
    discountAmount: 10000
  },
  {
    name: 'Dyovana Souza Silva',
    batchId: 'cmt4t2ls80002xkv148mlz0p2', // Lote Promocional
    baseAmount: 17500,
    discountAmount: 10000
  },
  {
    name: 'Nilton Miguel do Espírito Santo Pereira',
    batchId: 'cmt4t2ls80002xkv148mlz0p2', // Lote Promocional
    baseAmount: 17500,
    discountAmount: 10000
  },
  {
    name: 'Maria Eduarda Gil',
    batchId: 'cmt4t2ls90003xkv1no6b5ta5', // 1º Lote
    baseAmount: 18500,
    discountAmount: 10000
  }
];

async function main() {
  console.log('================================================================');
  console.log('EXECUÇÃO: CANCELAMENTO DE BOLETO E APLICAÇÃO DE DESCONTO');
  console.log('================================================================\n');

  const results: any[] = [];

  for (const target of targets) {
    console.log(`\n------------------------------------------------------------`);
    console.log(`Processando: ${target.name}...`);

    const firstWord = target.name.split(' ')[0];
    const lastWord = target.name.split(' ')[target.name.split(' ').length - 1];

    const participants = await prisma.participant.findMany({
      where: {
        OR: [
          { fullName: { contains: firstWord, mode: 'insensitive' } },
          { fullName: { contains: lastWord, mode: 'insensitive' } }
        ]
      },
      include: {
        user: { include: { coupons: true } },
        registration: { include: { payment: true, category: true, batch: true } }
      }
    });

    const p = participants.find(part => {
      const pName = part.fullName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const tName = target.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return pName.includes(firstWord.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')) &&
             pName.includes(lastWord.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
    });

    if (!p || !p.user) {
      console.error(`❌ Participante não encontrado: ${target.name}`);
      results.push({ name: target.name, success: false, error: 'Participante não encontrado' });
      continue;
    }

    console.log(`Encontrado: ${p.fullName} (ID: ${p.id}, Email: ${p.user.email})`);

    // 1. CANCELAR BOLETO ATUAL NO ASAAS
    const reg = p.registration;
    let oldPaymentCancelled = false;
    let oldGatewayId = reg?.payment?.gatewayId;

    if (oldGatewayId) {
      console.log(`Verificando pagamento atual no Asaas (ID: ${oldGatewayId})...`);
      try {
        const asaasCheck = await checkPaymentStatus(oldGatewayId);
        if (asaasCheck.status === 'RECEIVED' || asaasCheck.status === 'CONFIRMED') {
          console.error(`⚠️ ATENÇÃO: Boleto ${oldGatewayId} já consta como PAGO no Asaas! Cancelamento abortado por segurança.`);
          results.push({ name: target.name, success: false, error: `Boleto já pago (${asaasCheck.status})` });
          continue;
        }

        console.log(`Boleto no Asaas com status "${asaasCheck.status}". Cancelando cobrança no Asaas...`);
        const delRes = await deletePayment(oldGatewayId);
        console.log(`✅ Boleto ${oldGatewayId} cancelado com sucesso no Asaas:`, delRes);
        oldPaymentCancelled = true;
      } catch (err: any) {
        console.warn(`⚠️ Aviso ao cancelar no Asaas: ${err.message}`);
      }
    } else {
      console.log(`Nenhum gatewayId encontrado na inscrição atual.`);
    }

    // 2. EXCLUIR INSCRIÇÃO ANTIGA NO BANCO (Cascata exclui o Payment associado)
    if (reg) {
      console.log(`Excluindo inscrição anterior pendente (ID: ${reg.id})...`);
      await prisma.registration.delete({
        where: { id: reg.id }
      });
      console.log(`✅ Inscrição antiga excluída.`);
    }

    // 3. CONSOLIDAR CUPOM DE DESCONTO DE R$ 100
    // Manter apenas 1 cupom limpo para o usuário
    const firstName = p.fullName.split(' ')[0].toUpperCase().normalize('NFD').replace(/[^A-Z]/g, '');
    const cleanCouponCode = `COFOA-${firstName}-100-${p.id.slice(-4).toUpperCase()}`;

    // Desativar ou deletar cupons anteriores para evitar duplicatas e confusão
    if (p.user.coupons && p.user.coupons.length > 0) {
      for (const oldCoupon of p.user.coupons) {
        if (oldCoupon.code !== cleanCouponCode) {
          await prisma.coupon.delete({ where: { id: oldCoupon.id } }).catch(async () => {
            await prisma.coupon.update({ where: { id: oldCoupon.id }, data: { active: false } });
          });
        }
      }
    }

    const coupon = await prisma.coupon.upsert({
      where: { code: cleanCouponCode },
      update: {
        discountValue: target.discountAmount,
        discountType: 'FIXED',
        active: true,
        userId: p.user.id,
        maxUses: 1,
        usedCount: 1 // Já será usado na nova inscrição abaixo
      },
      create: {
        code: cleanCouponCode,
        discountValue: target.discountAmount,
        discountType: 'FIXED',
        active: true,
        userId: p.user.id,
        maxUses: 1,
        usedCount: 1
      }
    });
    console.log(`✅ Cupom consolidado: ${coupon.code} (Desconto: R$ ${coupon.discountValue/100})`);

    // 4. CRIAR NOVA COBRANÇA NO ASAAS COM O DESCONTO APLICADO
    const finalAmount = Math.max(0, target.baseAmount - target.discountAmount);
    console.log(`Valor base: R$ ${target.baseAmount/100} | Desconto: R$ ${target.discountAmount/100} | Valor final: R$ ${finalAmount/100}`);

    // Cliente no Asaas
    const asaasCustomer = await createOrGetCustomer(
      p.fullName,
      p.cpf,
      p.user.email,
      p.phone
    );

    // Vencimento: 4 dias a partir de hoje
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 4);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    const category = await prisma.registrationCategory.findUnique({
      where: { id: 'grad-pos-foa' }
    });

    const categoryName = category?.name || 'Graduandos e Pós-Graduandos da FOA UNESP';

    console.log(`Criando nova cobrança com desconto no Asaas (R$ ${finalAmount/100})...`);
    const newAsaasPayment = await createPayment(
      asaasCustomer.id,
      finalAmount,
      `Inscrição COFOA XV - ${categoryName}`,
      dueDateStr
    );
    console.log(`✅ Nova cobrança criada no Asaas! ID: ${newAsaasPayment.id} | Url: ${newAsaasPayment.invoiceUrl}`);

    // 5. REGISTRAR NOVA INSCRIÇÃO E NOVO PAGAMENTO NO BANCO
    const newRegistration = await prisma.registration.create({
      data: {
        participantId: p.id,
        categoryId: 'grad-pos-foa',
        batchId: target.batchId,
        couponId: coupon.id,
        status: 'PENDING',
        amount: finalAmount
      }
    });

    const newPayment = await prisma.payment.create({
      data: {
        registrationId: newRegistration.id,
        amount: finalAmount,
        gatewayId: newAsaasPayment.id,
        gatewayResponse: newAsaasPayment as any,
        status: 'PENDING'
      }
    });

    console.log(`✅ Nova inscrição registrada com sucesso! ID: ${newRegistration.id} | Pagamento DB ID: ${newPayment.id}`);

    results.push({
      name: p.fullName,
      email: p.user.email,
      oldBoletoId: oldGatewayId || 'N/A',
      newBoletoId: newAsaasPayment.id,
      newAmount: `R$ ${(finalAmount / 100).toFixed(2)}`,
      invoiceUrl: newAsaasPayment.invoiceUrl,
      couponCode: coupon.code,
      registrationId: newRegistration.id,
      success: true
    });
  }

  console.log(`\n============================================================`);
  console.log(`RESUMO FINAL DA OPERAÇÃO:`);
  console.log(`============================================================`);
  console.table(results);

  await prisma.$disconnect();
}

main().catch(console.error);
