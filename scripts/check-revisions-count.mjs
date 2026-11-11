import fs from 'fs';
import path from 'path';
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

// Carregar .env
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.substring(0, idx).trim();
        let val = trimmed.substring(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.substring(1, val.length - 1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  });
}

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const works = await prisma.scientificWork.findMany({
    where: { status: 'REVISION_REQUESTED' },
    select: {
      id: true,
      displayCode: true,
      revisionEmailSentAt: true,
      updatedAt: true,
    },
  });

  const neverSent = works.filter(w => !w.revisionEmailSentAt).length;
  const alreadySent = works.filter(w => !!w.revisionEmailSentAt).length;

  console.log(JSON.stringify({
    total: works.length,
    neverSent,
    alreadySent,
    sampleAlreadySent: works.filter(w => !!w.revisionEmailSentAt).slice(0, 3),
  }, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
