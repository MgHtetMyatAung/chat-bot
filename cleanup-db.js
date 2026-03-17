const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
    try {
        const deleted = await prisma.knowledgeBase.deleteMany({
            where: {
                OR: [
                    { content: "" },
                    { content: null }
                ]
            }
        });
        console.log(`Deleted ${deleted.count} empty knowledge items.`);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

cleanup();
