const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const updated = await prisma.chatbot.updateMany({
        data: {
            responseMode: 'STRICT'
        }
    });
    console.log(`Updated ${updated.count} chatbots to STRICT mode.`);
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
