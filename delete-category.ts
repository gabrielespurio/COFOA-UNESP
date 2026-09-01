import { prisma } from './src/lib/prisma';

async function main() {
  console.log('Buscando categoria "teste"...');
  
  const category = await prisma.registrationCategory.findFirst({
    where: { name: { contains: 'teste', mode: 'insensitive' } }
  });

  if (!category) {
    console.log('Categoria não encontrada.');
    return;
  }

  console.log('Deletando inscrições vinculadas a esta categoria...');
  await prisma.registration.deleteMany({
    where: { categoryId: category.id }
  });

  console.log('Deletando categoria...');
  await prisma.registrationCategory.delete({
    where: { id: category.id }
  });

  console.log('Categoria deletada com sucesso!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
