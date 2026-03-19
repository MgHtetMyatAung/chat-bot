const axios = require('axios');

async function test() {
    const url = 'https://hma-portfolio.vercel.app/';
    const jinaUrl = `https://r.jina.ai/${url}`;
    try {
        console.log(`Fetching via Jina: ${jinaUrl}`);
        const { data } = await axios.get(jinaUrl, {
            headers: {
                'X-Return-Format': 'markdown'
            }
        });
        console.log('Success! Data length:', data.length);
        console.log('Snippet:', data.substring(0, 500));
    } catch (err) {
        console.error('Jina failed:', err.message);
    }
}

test();
