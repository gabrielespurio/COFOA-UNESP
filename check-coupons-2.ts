import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function main() {
  const queries = [
    'Maria Vitória',
    'Isabele Rodrigues',
    'Nilton Miguel',
    'Nicoly cordeiro',
    'Giovanna Montilha',
    'Louyse Vitória',
    'Dyovana Souza',
    'Ana Laura Gavaldão'
  ];

  for (const q of queries) {
    const p = await prisma.participant.findFirst({
      where: { fullName: { contains: q, mode: 'insensitive' } },
      include: { registration: { include: { coupon: true } } }
    });

    if (p) {
      if (p.registration) {
        if (p.registration.coupon) {
          console.log(`- ${p.fullName}: Cupom APLICADO (${p.registration.coupon.code})`);
        } else {
          console.log(`- ${p.fullName}: Inscrito, mas SEM cupom aplicado (R$ ${p.registration.amount / 100})`);
        }
      } else {
        console.log(`- ${p.fullName}: Cadastro criado, mas NÃO iniciou a inscrição.`);
      }
    } else {
      console.log(`- Busca por "${q}": Nenhum usuário encontrado no sistema.`);
    }
  }
}

main().catch(console.error);
