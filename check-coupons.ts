import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function main() {
  const names = [
    'Maria Vitória Domingos Perosso', 
    'Isabele Rodrigues de Castilho', 
    'Nilton Miguel do Espírito Santo Pereira', 
    'Nicoly cordeiro basilio', 
    'Giovanna Montilha de Flavis', 
    'Louyse Vitória Oliveira Andreo', 
    'Dyovana Souza Silva', 
    'Ana Laura Gavaldão Santana Moreira'
  ]; 
  
  const participants = await prisma.participant.findMany({ 
    include: { registration: { include: { coupon: true, payment: true } } } 
  }); 

  // Filtrar em JS pra evitar case sensitivity issues
  const filtered = participants.filter(p => 
    names.some(n => p.fullName.toLowerCase() === n.toLowerCase())
  );

  console.log(`Encontrados: ${filtered.length}`);

  filtered.forEach(p => {
    let status = 'Sem inscrição';
    if (p.registration) {
      if (p.registration.coupon) {
        status = `Cupom aplicado (${p.registration.coupon.code}) - R$ ${p.registration.amount / 100}`;
      } else {
        status = `Inscrito, mas SEM cupom aplicado - R$ ${p.registration.amount / 100}`;
      }
    }
    console.log(`- ${p.fullName}: ${status}`);
  });
} 

main().catch(console.error);
