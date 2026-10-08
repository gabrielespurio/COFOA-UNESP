import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function main() {
  const coupons = await prisma.coupon.findMany();
  console.log(coupons);
}
main();
