async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: 'b4f034a4-cdfb-4d24-a3ae-ccc10ced97f4', 
        messages: [{role: 'user', content: 'What is an ERP according to your knowledge?'}]
      })
    });
    console.log('Status:', res.status);
    
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let text = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      text += chunk;
      process.stdout.write(chunk);
    }
    console.log('\n--- End of Response ---');
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
