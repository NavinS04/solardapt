/*
 * Seed script — templates, a default nurture sequence and editable Content
 * defaults (BUILD_SPEC §11). Run with `pnpm db:seed` against a real database.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.template.upsert({
    where: { key: 'lead-confirmation' },
    update: {},
    create: {
      key: 'lead-confirmation',
      channel: 'EMAIL',
      subject: 'Your Solardapt strategy call',
      body: 'Hi {{name}}, thanks for reaching out. We will confirm your free strategy call shortly.',
    },
  });

  await prisma.template.upsert({
    where: { key: 'lead-confirmation-sms' },
    update: {},
    create: {
      key: 'lead-confirmation-sms',
      channel: 'SMS',
      body: 'Solardapt: thanks {{name}}! We will text to confirm your strategy call shortly. Reply STOP to opt out.',
    },
  });

  const sequence = await prisma.sequence.upsert({
    where: { id: 'default-nurture' },
    update: {},
    create: { id: 'default-nurture', name: 'New lead nurture', active: true },
  });

  await prisma.sequenceStep.createMany({
    data: [
      { sequenceId: sequence.id, order: 0, channel: 'EMAIL', templateId: 'lead-confirmation', delayHours: 0 },
      { sequenceId: sequence.id, order: 1, channel: 'SMS', templateId: 'lead-confirmation-sms', delayHours: 1 },
    ],
    skipDuplicates: true,
  });

  await prisma.content.upsert({
    where: { key_locale: { key: 'calculator-defaults', locale: 'en' } },
    update: {},
    create: { key: 'calculator-defaults', locale: 'en', value: { GBP: 8000, USD: 12000, AED: 35000 } },
  });

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
