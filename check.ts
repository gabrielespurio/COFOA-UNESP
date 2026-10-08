import dotenv from 'dotenv';
dotenv.config();
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';
neonConfig.webSocketConstructor = ws;

async function run() {
  const { prisma } = await import('./src/lib/prisma');
  // Delete any existing registration first
  const u = await prisma.user.findUnique({where: {email: 'gabrielespurio@hotmail.com'}, include: {participant: true}});
  if(u?.participant) {
    await prisma.registration.deleteMany({where: {participantId: u.participant.id}});
  }

  // Set up mock session
  const auth = await import('./src/lib/auth');
  auth.getSession = async () => ({ userId: u!.id, role: 'PARTICIPANT' } as any);

  const { createRegistration } = await import('./src/actions/participant');
  
  const fd = new FormData();
  fd.append('categoryId', 'grad-pos-foa');
  
  console.log('Calling createRegistration...');
  const res = await createRegistration(fd);
  console.log('Result:', res);

  const reg = await prisma.registration.findFirst({
    where: { participantId: u!.participant!.id }
  });
  console.log('Created Registration:', reg);

  await prisma.$disconnect();
}
run();
