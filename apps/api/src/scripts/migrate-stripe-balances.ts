/**
 * Script de Migração: Stripe → Wallet
 *
 * Este script migra os saldos existentes do sistema Stripe (Purchase + Withdrawal)
 * para o novo sistema de Wallet.
 *
 * Execução:
 * ```bash
 * npx ts-node src/scripts/migrate-stripe-balances.ts
 * ```
 *
 * Ou via pnpm:
 * ```bash
 * pnpm tsx src/scripts/migrate-stripe-balances.ts
 * ```
 *
 * IMPORTANTE:
 * - Execute em ambiente de staging primeiro
 * - Faça backup do banco antes de executar
 * - O script é idempotente (pode ser executado múltiplas vezes)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface MigrationStats {
  totalCreators: number;
  walletsCreated: number;
  walletsUpdated: number;
  totalMigrated: number;
  errors: string[];
}

async function migrateStripeBalancesToWallets(): Promise<MigrationStats> {
  console.log('🚀 Iniciando migração de saldos Stripe → Wallet...\n');

  const stats: MigrationStats = {
    totalCreators: 0,
    walletsCreated: 0,
    walletsUpdated: 0,
    totalMigrated: 0,
    errors: [],
  };

  try {
    // Buscar todos os criadores
    const creators = await prisma.user.findMany({
      where: { userType: 'creator' },
      select: {
        id: true,
        displayName: true,
        email: true,
      },
    });

    stats.totalCreators = creators.length;
    console.log(`📊 Encontrados ${creators.length} criadores para migrar\n`);

    for (const creator of creators) {
      try {
        console.log(`\n👤 Processando: ${creator.displayName || creator.email}`);

        // 1. Calcular total de ganhos das compras pagas
        const earnings = await prisma.purchase.aggregate({
          where: {
            creatorId: creator.id,
            status: 'paid',
          },
          _sum: { creatorEarnings: true },
        });

        const totalEarnings = earnings._sum.creatorEarnings || 0;
        console.log(`   💰 Total de ganhos: R$ ${(totalEarnings / 100).toFixed(2)}`);

        // 2. Calcular total de saques realizados
        const withdrawals = await prisma.withdrawal.aggregate({
          where: {
            creatorId: creator.id,
            status: 'completed',
          },
          _sum: { amount: true },
        });

        const totalWithdrawals = withdrawals._sum.amount || 0;
        console.log(`   📤 Total de saques: R$ ${(totalWithdrawals / 100).toFixed(2)}`);

        // 3. Calcular saldo atual
        const currentBalance = totalEarnings - totalWithdrawals;
        console.log(`   💵 Saldo atual: R$ ${(currentBalance / 100).toFixed(2)}`);

        // 4. Calcular saldo congelado (últimos 14 dias)
        const now = new Date();
        const frozenPurchases = await prisma.purchase.aggregate({
          where: {
            creatorId: creator.id,
            status: 'paid',
            availableAt: { gt: now },
          },
          _sum: { creatorEarnings: true },
        });

        const frozenBalance = frozenPurchases._sum.creatorEarnings || 0;
        const availableBalance = Math.max(0, currentBalance - frozenBalance);

        console.log(`   🧊 Saldo congelado: R$ ${(frozenBalance / 100).toFixed(2)}`);
        console.log(`   ✅ Saldo disponível: R$ ${(availableBalance / 100).toFixed(2)}`);

        // 5. Criar ou atualizar Wallet
        const existingWallet = await prisma.wallet.findUnique({
          where: { userId: creator.id },
        });

        if (existingWallet) {
          // Wallet já existe - atualizar se necessário
          if (
            existingWallet.currentBalance !== availableBalance ||
            existingWallet.frozenBalance !== frozenBalance
          ) {
            await prisma.wallet.update({
              where: { id: existingWallet.id },
              data: {
                currentBalance: availableBalance,
                frozenBalance: frozenBalance,
              },
            });
            console.log(`   🔄 Wallet atualizada`);
            stats.walletsUpdated++;
          } else {
            console.log(`   ⏭️  Wallet já está atualizada`);
          }
        } else {
          // Criar nova Wallet
          await prisma.wallet.create({
            data: {
              userId: creator.id,
              currentBalance: availableBalance,
              frozenBalance: frozenBalance,
            },
          });
          console.log(`   ✨ Wallet criada`);
          stats.walletsCreated++;
        }

        // 6. Criar LedgerEntry inicial (se houver saldo)
        if (currentBalance > 0 && !existingWallet) {
          await prisma.ledgerEntry.create({
            data: {
              wallet: { connect: { userId: creator.id } },
              type: 'CREDIT',
              transactionType: 'ADJUSTMENT',
              amount: currentBalance,
              balanceAfter: currentBalance,
              description: 'Migração de saldo Stripe',
              metadata: {
                migratedFrom: 'stripe',
                totalEarnings,
                totalWithdrawals,
                migrationDate: new Date().toISOString(),
              },
            },
          });
          console.log(`   📝 LedgerEntry de migração criado`);
        }

        stats.totalMigrated += currentBalance;
      } catch (error) {
        const errorMsg = `Erro ao migrar ${creator.email}: ${error}`;
        console.error(`   ❌ ${errorMsg}`);
        stats.errors.push(errorMsg);
      }
    }

    return stats;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('   MIGRAÇÃO DE SALDOS: STRIPE → WALLET');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const stats = await migrateStripeBalancesToWallets();

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('   RESULTADO DA MIGRAÇÃO');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`   📊 Total de criadores processados: ${stats.totalCreators}`);
  console.log(`   ✨ Wallets criadas: ${stats.walletsCreated}`);
  console.log(`   🔄 Wallets atualizadas: ${stats.walletsUpdated}`);
  console.log(`   💰 Total migrado: R$ ${(stats.totalMigrated / 100).toFixed(2)}`);

  if (stats.errors.length > 0) {
    console.log(`\n   ⚠️  Erros encontrados: ${stats.errors.length}`);
    stats.errors.forEach((err) => console.log(`      - ${err}`));
  } else {
    console.log(`\n   ✅ Migração concluída sem erros!`);
  }

  console.log('═══════════════════════════════════════════════════════════════\n');
}

main().catch((error) => {
  console.error('Erro fatal na migração:', error);
  process.exit(1);
});
