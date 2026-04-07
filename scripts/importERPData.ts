import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { ERPImportEngine } from '../src/lib/erpImportEngine.js';

const prisma = new PrismaClient();
const engine = new ERPImportEngine();

async function main() {
    console.log('🚀 Starting ERP Data Import...');

    const detransPath = path.resolve('ERP RAW DATA/DETRANS.TXT');
    const sttransPath = path.resolve('ERP RAW DATA/STTRANS.TXT');

    if (!fs.existsSync(detransPath) || !fs.existsSync(sttransPath)) {
        console.error('❌ Error: ERP RAW DATA files not found.');
        return;
    }

    console.log('📖 Reading DETRANS.TXT...');
    const detransContent = fs.readFileSync(detransPath, 'utf8');
    await engine.parseDetrans(detransContent);

    console.log('📖 Reading STTRANS.TXT...');
    const sttransContent = fs.readFileSync(sttransPath, 'utf8');
    await engine.parseSttrans(sttransContent);

    const data = engine.getProcessedData();

    console.log(`📊 Parsed: ${data.accounts.length} accounts, ${data.products.length} products, ${data.transactions.length} transactions.`);

    // 1. Sync Accounts
    console.log('👤 Syncing Accounts...');
    for (const account of data.accounts) {
        await prisma.account.upsert({
            where: { accountNo: account.accountNo },
            update: { currentName: account.currentName },
            create: account,
        });
    }

    // 2. Sync Products
    console.log('📦 Syncing Products...');
    for (const product of data.products) {
        await prisma.product.upsert({
            where: { stockNo: product.stockNo },
            update: { description: product.description },
            create: product,
        });
    }

    // 3. Sync SalesReps
    console.log('👥 Syncing SalesReps...');
    for (const rep of data.salesReps) {
        if (!rep.repCode) continue;
        await prisma.salesRep.upsert({
            where: { repCode: rep.repCode },
            update: { name: rep.name },
            create: rep,
        });
    }

    // 4. Sync Transactions (TransactionHeader)
    console.log('📝 Syncing Transactions...');
    const docToId = new Map<string, string>();

    // To avoid duplicate imports if run multiple times, we'd need a unique ERP row ID.
    // ERP data doesn't have one, so we'll just create. 
    // WARNING: Running this multiple times will duplicate data without a clear "Row ID".

    for (const tx of data.transactions) {
        const account = await prisma.account.findUnique({ where: { accountNo: tx.accountNo } });

        const createdTx = await prisma.transactionHeader.create({
            data: {
                ...tx,
                accountId: account?.id,
            }
        });

        // Store mapping for allocations
        docToId.set(tx.docNo, createdTx.id);
    }

    // 5. Sync Allocations (AllocationEvent)
    console.log('🔗 Syncing Allocations...');
    for (const alloc of data.allocations) {
        const sourceId = docToId.get(alloc.sourceDocNo);
        // Find a target invoice with this docNo
        const target = await prisma.transactionHeader.findFirst({
            where: { docNo: alloc.targetDocNo, entryType: 'Invoice' }
        });

        if (sourceId && target) {
            await prisma.allocationEvent.create({
                data: {
                    sourceId,
                    targetId: target.id,
                    amount: alloc.amount,
                    eventType: 'ALLOCATE',
                    allocationType: 'FULL',
                    matchMethod: 'AUTO_EXACT',
                }
            });
        }
    }

    console.log('✅ Import Complete!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
