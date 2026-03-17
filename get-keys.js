const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const chatbots = await prisma.chatbot.findMany();
        console.log('Chatbots:', JSON.stringify(chatbots, null, 2));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

check();
