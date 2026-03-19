const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const chatbots = await prisma.chatbot.findMany({
            include: {
                _count: {
                    select: { knowledge: true }
                }
            }
        });
        console.log('Chatbots and Knowledge Base Counts:');
        chatbots.forEach(cb => {
            console.log(`- Name: ${cb.name}, ID: ${cb.id}, Knowledge count: ${cb._count.knowledge}`);
        });

        const lkItems = await prisma.knowledgeBase.findMany({
            where: {
                OR: [{ type: 'LINK' }, { type: 'CRAWL' }]
            },
            include: { chatbot: true },
            take: 10
        });

        console.log('\nLINK/CRAWL knowledge items:');
        lkItems.forEach(k => {
            console.log(`- [${k.type}] Bot: ${k.chatbot?.name}, Title: ${k.title}, Content length: ${k.content?.length || 0}`);
            if (k.content) {
                console.log(`  Snippet: ${k.content.substring(0, 150)}...`);
            }
        });
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

check();
