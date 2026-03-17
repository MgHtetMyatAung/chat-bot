(function() {
  const currentScript = document.currentScript;
  const apiKey = currentScript.getAttribute('data-chatbot-key');
  const apiUrl = currentScript.getAttribute('data-api-url') || (window.location.host === 'localhost:3000' || window.location.host === '127.0.0.1:3000' ? (window.location.origin + '/api') : 'http://localhost:3000/api');

  if (!apiKey) {
    console.error('Nexus AI Widget: Missing data-chatbot-key');
    return;
  }

  const state = {
    isOpen: false,
    config: null,
    messages: []
  };

  async function init() {
    try {
      const res = await fetch(`${apiUrl}/widget/${apiKey}`);
      if (!res.ok) throw new Error('Invalid API Key');
      state.config = await res.json();
      render();
    } catch (e) {
      console.error('Nexus AI Widget Error:', e);
    }
  }

  function render() {
    if (!document.getElementById('nexus-ai-styles')) {
      const style = document.createElement('style');
      style.id = 'nexus-ai-styles';
      style.innerHTML = `
        :root { --nexus-theme: ${state.config.theme || '#3b82f6'}; }
        #nexus-ai-root { position: fixed; bottom: 24px; right: 24px; z-index: 999999; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
        
        .nexus-btn { position: relative; z-index: 10; width: 64px; height: 64px; border-radius: 32px; background: var(--nexus-theme); color: white; border: none; box-shadow: 0 8px 32px rgba(0,0,0,0.2); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .nexus-btn:hover { transform: scale(1.1) rotate(5deg); }
        .nexus-btn svg { width: 32px; height: 32px; fill: currentColor; }
        
        .nexus-window { display: none; position: absolute; bottom: 110px; right: 0; width: 400px; height: 600px; max-height: calc(100vh - 200px); background: #ffffff; border-radius: 24px; box-shadow: 0 20px 50px rgba(0,0,0,0.15); overflow: hidden; flex-direction: column; transform-origin: bottom right; transform: scale(0.9) translateY(20px); opacity: 0; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); z-index: 20; }
        .nexus-window.open { display: flex; transform: scale(1) translateY(0); opacity: 1; border: 1px solid rgba(0,0,0,0.05); }
        
        .nexus-header { background: var(--nexus-theme); color: white; padding: 24px; text-align: left; display: flex; align-items: center; gap: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 10; }
        .nexus-header h3 { margin: 0; font-size: 18px; font-weight: 700; letter-spacing: -0.01em; }
        
        .nexus-chat { flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; background: #f8f9fa; scroll-behavior: smooth; }
        
        /* Custom Scrollbar Styles */
        .nexus-chat::-webkit-scrollbar { width: 5px; }
        .nexus-chat::-webkit-scrollbar-track { background: transparent; }
        .nexus-chat::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
        .nexus-chat::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.2); }

        .nexus-msg { max-width: 85%; padding: 12px 18px; border-radius: 20px; font-size: 15px; line-height: 1.5; color: #1f2937; animation: nexusFadeIn 0.3s ease-out forwards; }
        @keyframes nexusFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .nexus-msg.bot { background: white; border: 1px solid #e9ecef; align-self: flex-start; border-bottom-left-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.03); }
        .nexus-msg.user { background: var(--nexus-theme); color: white; align-self: flex-end; border-bottom-right-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        
        .nexus-input { padding: 20px; background: white; border-top: 1px solid #e9ecef; display: flex; gap: 12px; align-items: center; }
        .nexus-input input { flex: 1; border: 1px solid #dee2e6; padding: 12px 18px; border-radius: 24px; font-size: 15px; outline: none; transition: all 0.2s; background: #f8f9fa; color: #1f2937; }
        .nexus-input input:focus { border-color: var(--nexus-theme); background: white; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
        .nexus-input button { background: var(--nexus-theme); color: white; border: none; width: 48px; height: 48px; border-radius: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .nexus-input button:hover { transform: scale(1.05); filter: brightness(1.1); }
        .nexus-input button:active { transform: scale(0.95); }
        .nexus-input button:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .nexus-thinking { font-size: 12px; color: #6c757d; align-self: flex-start; margin-left: 10px; display: none; padding: 4px 12px; background: rgba(0,0,0,0.03); border-radius: 12px; margin-top: -8px; }
        .nexus-thinking.show { display: block; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
        
        @media (prefers-color-scheme: dark) {
          .nexus-window { background: #121212; border: 1px solid rgba(255,255,255,0.08); }
          .nexus-chat { background: #0a0a0a; }
          .nexus-chat::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
          .nexus-chat::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
          .nexus-msg { color: #e0e0e0; }
          .nexus-msg.bot { background: #1e1e1e; border-color: #2c2c2c; }
          .nexus-input { background: #121212; border-top-color: #2c2c2c; }
          .nexus-input input { background: #1e1e1e; border-color: #2c2c2c; color: white; }
          .nexus-input input:focus { background: #242424; }
          .nexus-thinking { background: rgba(255,255,255,0.05); color: #999; }
        }
      `;
      document.head.appendChild(style);
    }

    const root = document.createElement('div');
    root.id = 'nexus-ai-root';
    
    root.innerHTML = `
      <div class="nexus-window" id="nexus-window">
        <div class="nexus-header">
          <div style="width:32px;height:32px;background:rgba(255,255,255,0.2);border-radius:10px;display:flex;align-items:center;justify-content:center;">
            <svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:white"><path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2z"/></svg>
          </div>
          <h3>${state.config.name}</h3>
        </div>
        <div class="nexus-chat" id="nexus-chat">
          <div class="nexus-msg bot">Hi there! How can I help you today?</div>
        </div>
        <div class="nexus-thinking" id="nexus-thinking">AI is typing...</div>
        <form class="nexus-input" id="nexus-form">
          <input type="text" id="nexus-text" placeholder="Type a message..." autocomplete="off">
          <button type="submit" id="nexus-send">
            <svg viewBox="0 0 24 24" style="width:20px;height:20px"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </form>
      </div>
      <button class="nexus-btn" id="nexus-toggle">
        <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
      </button>
    `;

    document.body.appendChild(root);

    const toggleBtn = document.getElementById('nexus-toggle');
    const windowEl = document.getElementById('nexus-window');
    const formEl = document.getElementById('nexus-form');
    const inputEl = document.getElementById('nexus-text');
    const chatEl = document.getElementById('nexus-chat');
    const thinkingEl = document.getElementById('nexus-thinking');
    const sendBtn = document.getElementById('nexus-send');

    const iconMsg = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>';
    const iconClose = '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';

    toggleBtn.addEventListener('click', () => {
      state.isOpen = !state.isOpen;
      windowEl.classList.toggle('open', state.isOpen);
      toggleBtn.innerHTML = state.isOpen ? iconClose : iconMsg;
      if (state.isOpen) {
        inputEl.focus();
        chatEl.scrollTop = chatEl.scrollHeight;
      }
    });

    formEl.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = inputEl.value.trim();
      if (!text) return;

      addMessage(text, 'user');
      inputEl.value = '';
      sendBtn.disabled = true;
      
      state.messages.push({ role: 'user', content: text });
      
      thinkingEl.classList.add('show');
      chatEl.scrollTop = chatEl.scrollHeight;

      try {
        const response = await fetch(`${apiUrl}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: state.messages, apiKey })
        });

        if (!response.ok) throw new Error('API Error');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let botText = '';
        
        const msgDiv = document.createElement('div');
        msgDiv.className = 'nexus-msg bot';
        msgDiv.innerText = '';
        chatEl.appendChild(msgDiv);
        thinkingEl.classList.remove('show');

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          
          botText += chunk;
          msgDiv.innerText = botText;
          chatEl.scrollTop = chatEl.scrollHeight;
        }

        state.messages.push({ role: 'assistant', content: botText });
      } catch (err) {
        console.error(err);
        addMessage('Sorry, I encountered an error. Please try again.', 'bot');
        thinkingEl.classList.remove('show');
      } finally {
        sendBtn.disabled = false;
        inputEl.focus();
      }
    });

    function addMessage(text, role) {
      const msgDiv = document.createElement('div');
      msgDiv.className = `nexus-msg ${role}`;
      msgDiv.innerText = text;
      chatEl.appendChild(msgDiv);
      chatEl.scrollTop = chatEl.scrollHeight;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
