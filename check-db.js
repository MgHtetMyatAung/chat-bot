const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const chatbots = await prisma.chatbot.findMany({
            include: {
                knowledge: true
            }
        });
        
        console.log('--- Chatbots and Knowledge Base ---');
        chatbots.forEach(bot => {
            console.log(`Chatbot: ${bot.name} (id: ${bot.id}) (apiKey: ${bot.apiKey})`);
            console.log(`Knowledge count: ${bot.knowledge.length}`);
            bot.knowledge.forEach(kb => {
                console.log(`  - Title: ${kb.title}`);
                console.log(`    Content snippet: ${kb.content?.substring(0, 50)}...`);
            });
            console.log('-----------------------------------');
        });
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

check();
