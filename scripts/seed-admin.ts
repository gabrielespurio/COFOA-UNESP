import { config } from 'dotenv';
config();
import { PrismaClient, Role } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = 'admin@cofoa.com.br';
  const password = 'admin'; // Temporary easy password

  const existingAdmin = await prisma.user.findUnique({
    where: { email }
  });

  if (existingAdmin) {
    console.log('Admin user already exists.');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: Role.ADMIN,
      participant: {
        create: {
          fullName: 'Administrador Supremo',
          cpf: '00000000000',
          phone: '11999999999',
          birthDate: new Date('1990-01-01'),
        }
      }
    }
  });

  console.log('✅ Admin user created!');
  console.log('Email:', email);
  console.log('Password:', password);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
