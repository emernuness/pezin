import { PrismaClient } from '@prisma/client';
import {
  createDemoCreator,
  createDemoBuyer,
  createPack,
  createPackPreviews,
  createPackFiles,
  createPurchase,
  createWithdrawal,
  createDownloadLogs,
  DEMO_PASSWORD,
} from './factories';
import { generateAllAssets } from './generate-assets';
import * as fs from 'node:fs';
import * as path from 'node:path';

const prisma = new PrismaClient();

const ASSETS_DIR = path.join(__dirname, '..', 'seed-assets');

async function checkAssets(): Promise<boolean> {
  const previewsDir = path.join(ASSETS_DIR, 'previews');
  const avatarsDir = path.join(ASSETS_DIR, 'avatars');
  const coversDir = path.join(ASSETS_DIR, 'covers');

  if (!fs.existsSync(previewsDir) || !fs.existsSync(avatarsDir) || !fs.existsSync(coversDir)) {
    return false;
  }

  const previews = fs.readdirSync(previewsDir).filter((f) => f.endsWith('.jpg'));
  const avatars = fs.readdirSync(avatarsDir).filter((f) => f.endsWith('.jpg'));
  const covers = fs.readdirSync(coversDir).filter((f) => f.endsWith('.jpg'));

  return previews.length >= 30 && avatars.length >= 10 && covers.length >= 10;
}

async function seedUsers() {
  console.log('\n📝 Seeding users...');

  const creators: Array<{ id: string; slug: string }> = [];
  const buyers: Array<{ id: string; email: string }> = [];

  // Create 12 creators
  for (let i = 0; i < 12; i++) {
    const data = createDemoCreator(i);

    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: data,
    });

    creators.push({ id: user.id, slug: user.slug! });
    console.log(`  ✓ Creator: ${data.displayName} (${data.email})`);
  }

  // Create 12 buyers
  for (let i = 0; i < 12; i++) {
    const data = createDemoBuyer(i);

    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: data,
    });

    buyers.push({ id: user.id, email: user.email });
    console.log(`  ✓ Buyer: ${data.displayName} (${data.email})`);
  }

  console.log(`  Total: ${creators.length} creators, ${buyers.length} buyers`);
  return { creators, buyers };
}

async function seedPacks(creatorIds: string[]) {
  console.log('\n📦 Seeding packs...');

  const packs: Array<{ id: string; creatorId: string; price: number; status: string }> = [];

  // Create 15 published packs (distributed among creators)
  for (let i = 0; i < 15; i++) {
    const creatorId = creatorIds[i % creatorIds.length];
    const packData = createPack(creatorId, i, 'published');

    // Check if pack with this title for this creator exists
    const existingPack = await prisma.pack.findFirst({
      where: { creatorId, title: packData.title },
    });

    if (existingPack) {
      packs.push({
        id: existingPack.id,
        creatorId: existingPack.creatorId,
        price: existingPack.price,
        status: existingPack.status,
      });
      console.log(`  ○ Pack exists: ${packData.title}`);
      continue;
    }

    const pack = await prisma.pack.create({
      data: packData,
    });

    // Create previews for published packs
    const previewsData = createPackPreviews(pack.id, i);
    await prisma.packPreview.createMany({
      data: previewsData,
    });

    // Create files for published packs
    const filesData = createPackFiles(pack.id, i);
    await prisma.packFile.createMany({
      data: filesData,
    });

    packs.push({
      id: pack.id,
      creatorId: pack.creatorId,
      price: pack.price,
      status: pack.status,
    });

    console.log(
      `  ✓ Pack: ${pack.title} - R$ ${(pack.price / 100).toFixed(2)} (${previewsData.length} previews, ${filesData.length} files)`
    );
  }

  // Create 5 draft packs
  for (let i = 0; i < 5; i++) {
    const creatorId = creatorIds[i % creatorIds.length];
    const packData = createPack(creatorId, i + 15, 'draft');

    const existingPack = await prisma.pack.findFirst({
      where: { creatorId, title: packData.title },
    });

    if (existingPack) {
      console.log(`  ○ Draft exists: ${packData.title}`);
      continue;
    }

    const pack = await prisma.pack.create({
      data: packData,
    });

    // Drafts have fewer files (not ready to publish)
    const filesData = createPackFiles(pack.id, i + 15).slice(0, 2);
    if (filesData.length > 0) {
      await prisma.packFile.createMany({
        data: filesData,
      });
    }

    console.log(`  ✓ Draft: ${pack.title} (${filesData.length} files, not publishable)`);
  }

  console.log(`  Total: ${packs.length} published packs + 5 drafts`);
  return packs;
}

async function seedPurchases(
  buyers: Array<{ id: string; email: string }>,
  packs: Array<{ id: string; creatorId: string; price: number; status: string }>
) {
  console.log('\n💳 Seeding purchases...');

  const publishedPacks = packs.filter((p) => p.status === 'published');
  let purchaseCount = 0;

  // Ensure demo buyer has multiple purchases
  const demoBuyer = buyers[0];
  for (let i = 0; i < 5; i++) {
    const pack = publishedPacks[i % publishedPacks.length];

    // Skip if buyer already purchased this pack
    const existingPurchase = await prisma.purchase.findFirst({
      where: { userId: demoBuyer.id, packId: pack.id },
    });

    if (existingPurchase) {
      console.log(`  ○ Purchase exists for demo buyer`);
      continue;
    }

    const purchaseData = createPurchase(demoBuyer.id, pack.id, pack.creatorId, pack.price, i);

    await prisma.purchase.create({
      data: purchaseData,
    });

    purchaseCount++;
    console.log(`  ✓ Demo buyer purchased pack #${i + 1}`);
  }

  // Distribute purchases among other buyers
  for (let i = 0; i < 20; i++) {
    const buyer = buyers[(i % (buyers.length - 1)) + 1]; // Skip demo buyer
    const pack = publishedPacks[i % publishedPacks.length];

    // Skip if buyer is also the creator (shouldn't happen but safety check)
    if (buyer.id === pack.creatorId) continue;

    // Skip if already purchased
    const existingPurchase = await prisma.purchase.findFirst({
      where: { userId: buyer.id, packId: pack.id },
    });

    if (existingPurchase) continue;

    const purchaseData = createPurchase(buyer.id, pack.id, pack.creatorId, pack.price, i + 5);

    await prisma.purchase.create({
      data: purchaseData,
    });

    purchaseCount++;
  }

  console.log(`  Total: ${purchaseCount} purchases created`);
  return purchaseCount;
}

async function seedWithdrawals(creatorIds: string[]) {
  console.log('\n💰 Seeding withdrawals...');

  let withdrawalCount = 0;
  let skippedCount = 0;

  // Create withdrawals for first 6 creators (those with Stripe connected)
  for (let i = 0; i < 6; i++) {
    const creatorId = creatorIds[i];

    // Check existing withdrawals count for this creator
    const existingCount = await prisma.withdrawal.count({
      where: { creatorId },
    });

    // Skip if already has withdrawals
    if (existingCount > 0) {
      skippedCount += 1 + (i % 3);
      continue;
    }

    // 1-3 withdrawals per creator
    const numWithdrawals = 1 + (i % 3);

    for (let j = 0; j < numWithdrawals; j++) {
      const withdrawalData = createWithdrawal(creatorId, i * 3 + j);

      await prisma.withdrawal.create({
        data: withdrawalData,
      });

      withdrawalCount++;
    }
  }

  if (skippedCount > 0) {
    console.log(`  ○ Skipped ${skippedCount} withdrawals (already exist)`);
  }
  console.log(`  Total: ${withdrawalCount} withdrawals created`);
  return withdrawalCount;
}

async function seedDownloadLogs(
  buyers: Array<{ id: string; email: string }>,
  packs: Array<{ id: string; creatorId: string; price: number; status: string }>
) {
  console.log('\n📥 Seeding download logs...');

  const publishedPacks = packs.filter((p) => p.status === 'published');
  let logCount = 0;

  // Get files from first few packs
  for (let i = 0; i < 5; i++) {
    const pack = publishedPacks[i];
    if (!pack) continue;

    const files = await prisma.packFile.findMany({
      where: { packId: pack.id },
      take: 3,
    });

    // Find buyers who purchased this pack
    const purchases = await prisma.purchase.findMany({
      where: { packId: pack.id, status: 'paid' },
      take: 3,
    });

    for (const purchase of purchases) {
      for (const file of files) {
        // Determine scenario
        let scenario: 'normal' | 'limit' | 'at_limit' = 'normal';
        if (logCount % 10 === 8) scenario = 'limit';
        if (logCount % 15 === 14) scenario = 'at_limit';

        const logs = createDownloadLogs(purchase.userId, file.id, pack.id, scenario);

        for (const log of logs) {
          // Use upsert based on unique constraint
          await prisma.downloadLog.upsert({
            where: {
              userId_fileId_dateKey: {
                userId: log.userId,
                fileId: log.fileId,
                dateKey: log.dateKey,
              },
            },
            update: { count: log.count },
            create: log,
          });
          logCount++;
        }
      }
    }
  }

  console.log(`  Total: ${logCount} download logs created`);
  return logCount;
}

async function seedStripeEvents() {
  console.log('\n🔔 Seeding Stripe events (demo)...');

  const events = [
    {
      id: 'evt_demo_checkout_1',
      type: 'checkout.session.completed',
      processed: true,
      processedAt: new Date(),
      payload: JSON.stringify({ demo: true, session_id: 'cs_demo_1' }),
    },
    {
      id: 'evt_demo_checkout_2',
      type: 'checkout.session.completed',
      processed: true,
      processedAt: new Date(),
      payload: JSON.stringify({ demo: true, session_id: 'cs_demo_2' }),
    },
    {
      id: 'evt_demo_payout_1',
      type: 'payout.paid',
      processed: true,
      processedAt: new Date(),
      payload: JSON.stringify({ demo: true, payout_id: 'po_demo_1' }),
    },
  ];

  for (const event of events) {
    await prisma.stripeEvent.upsert({
      where: { id: event.id },
      update: {},
      create: event,
    });
  }

  console.log(`  Total: ${events.length} Stripe events created`);
}

async function main() {
  console.log('🌱 Pack do Pezin - Database Seeder');
  console.log('=====================================');

  // Check if we need to generate assets
  const hasAssets = await checkAssets();
  if (!hasAssets) {
    console.log('\n🎨 Generating image assets...');
    await generateAllAssets();
  } else {
    console.log('\n✅ Image assets already exist');
  }

  // Seed users
  const { creators, buyers } = await seedUsers();

  // Seed packs
  const packs = await seedPacks(creators.map((c) => c.id));

  // Seed purchases
  await seedPurchases(buyers, packs);

  // Seed withdrawals
  await seedWithdrawals(creators.map((c) => c.id));

  // Seed download logs
  await seedDownloadLogs(buyers, packs);

  // Seed Stripe events
  await seedStripeEvents();

  console.log('\n=====================================');
  console.log('✅ Seeding completed successfully!');
  console.log('\n📋 Demo Credentials:');
  console.log('-------------------------------------');
  console.log(`  Buyer:   buyer_demo@local.test / ${DEMO_PASSWORD}`);
  console.log(`  Creator: creator_demo@local.test / ${DEMO_PASSWORD}`);
  console.log('-------------------------------------');
  console.log('\n📊 Summary:');
  console.log(`  - ${creators.length} creators`);
  console.log(`  - ${buyers.length} buyers`);
  console.log(`  - ${packs.length}+ packs (published + drafts)`);
  console.log('  - Multiple purchases, withdrawals, and download logs');
  console.log('\n🔗 Access points:');
  console.log('  - Vitrine: /packs');
  console.log('  - Creator profile: /c/sofia-bela-1');
  console.log('  - Dashboard: /dashboard (login as creator)');
  console.log('  - My purchases: /me/purchases (login as buyer)');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
