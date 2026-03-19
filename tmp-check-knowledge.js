const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const knowledge = await prisma.knowledgeBase.findMany({
            include: { chatbot: true },
            orderBy: { createdAt: 'desc' },
            take: 10
        });
        console.log('Recent Knowledge Items:');
        knowledge.forEach(k => {
            console.log(`- ID: ${k.id}, Title: ${k.title}, Type: ${k.type}, Chatbot: ${k.chatbot?.name}, Content length: ${k.content?.length || 0}`);
            if (k.content) {
                console.log(`  Snippet: ${k.content.substring(0, 100)}...`);
            }
        });
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

check();
