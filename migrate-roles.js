const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  for (const user of users) {
    if (user.role) {
      await prisma.user.update({
        where: { id: user.id },
        data: { roles: [user.role] }
      });
    }
  }
  console.log('Migrated ' + users.length + ' users');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
