import 'dotenv/config';
import { prisma } from './src/lib/prisma';

const emails = [
  'lorenaribeirolaluce@gmail.com',
  'sofia.fujita@unesp.br',
  'hr.landim@unesp.br',
  'bianca.chiarioni@unesp.br',
  'barbara-borella.gon@unesp.br',
  'ana.eduarda@unesp.br',
  'Breno.pinheiro@unesp.br',
  'ga.caetano@unesp.br',
  'giulia.r.santos@unesp.br',
  'pacifico.nishio@unesp.br',
  'giovanna.l.fortunato@unesp.br',
  'amanda.g.lopes@unesp.br',
  'lucas.gregui@unesp.br',
  'amanda.rodrigues-araujo@unesp.br',
  'mh.almeida@unesp.br',
  'leonardo.a.morais@unesp.br',
  'vtes.morais@unesp.br',
  'mariana.s.afonseca@unesp.br',
  'ana.zonca@unesp.br',
  'giovanna.stephanie@unesp.br',
  'julia.bozolan@unesp.br',
  'caio.jesus@unesp.br',
  'ml.bartoli@unesp.br',
  'gabriele.amaral@unesp.br',
  'tatiane.garcia1@unesp.br',
  'Franhh48@gmail.com',
  'victor.sachi@unesp.br',
  'samuel.campos@unesp.br',
  'natalia.p.ribeiro@unesp.br',
  'sabrina.pontes@unesp.br',
  'vvs.nascimento@unesp.br',
  'm.vargas@unesp.br',
  'bruna.o.alves@unesp.br',
  'ana.nalin@unesp.br',
  'nd.duarte@unesp.br',
  'tatiely.silva@unesp.br',
  'ana.nobumoto@unesp.br',
  'almir.bolonhez@unesp.br',
  'beatriz.travalon@unesp.br',
  'alanna.mateus@unesp.br',
  'victor.bordim@unesp.br'
].map(e => e.toLowerCase().trim());

async function main() {
  console.log(`Corrigindo perfis para ${emails.length} usuários...`);

  for (const email of emails) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`[ERRO] Usuário não encontrado no banco: ${email}`);
      continue;
    }

    const currentRoles = new Set(user.roles);
    currentRoles.add('PARTICIPANT');
    currentRoles.add('EVALUATOR');
    currentRoles.add('COMMITTEE'); // Adiciona comissão para poder ver os trabalhos!

    await prisma.user.update({
      where: { id: user.id },
      data: { roles: Array.from(currentRoles) }
    });

    console.log(`[OK] ${email} -> Perfis atualizados: ${Array.from(currentRoles).join(', ')}`);
  }

  console.log('Finalizado com sucesso!');
}

main().catch(console.error);
