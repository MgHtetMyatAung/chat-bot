const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const knowledge = await prisma.knowledgeBase.findMany({
            where: { chatbotId: 'cmmtlyin7000pt6aohgka7ltd' }
        });
        console.log('Knowledge Items:', JSON.stringify(knowledge, null, 2));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

check();
