const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const knowledge = await prisma.knowledgeBase.findMany({
            where: { chatbotId: 'cmmxrvl4l0015t6x47a8py0f2' },
            orderBy: { createdAt: 'desc' }
        });
        console.log(`Knowledge for hma:`);
        knowledge.forEach(k => {
            console.log(`- [${k.type}] Title: ${k.title}, Length: ${k.content?.length || 0}`);
            if (k.content) {
                console.log(`  Snippet: ${k.content.substring(0, 200)}...`);
            }
        });
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

check();
