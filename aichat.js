// ============================================================
//  SIZZLE AI CHATBOT WIDGET  —  aiChat.js
//  Injects a floating chat bubble on any page
//  Requires: ai.js loaded first
// ============================================================

(function () {
  const STYLES = `
    #sizzle-chat-btn {
      position: fixed; bottom: 28px; left: 28px; z-index: 9999;
      width: 58px; height: 58px; border-radius: 50%;
      background: #000; border: 3px solid antiquewhite;
      color: antiquewhite; font-size: 26px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 18px rgba(255,235,205,0.25);
      transition: transform 0.2s, box-shadow 0.2s;
      font-family: cursive;
    }
    #sizzle-chat-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 0 28px rgba(255,235,205,0.45);
    }
    #sizzle-chat-panel {
      position: fixed; bottom: 100px; left: 28px; z-index: 9999;
      width: 340px; max-height: 480px;
      background: rgba(10,10,10,0.92);
      border: 2px solid antiquewhite; border-radius: 28px;
      display: flex; flex-direction: column;
      font-family: cursive; color: antiquewhite;
      backdrop-filter: blur(12px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.6);
      transform: scale(0); transform-origin: bottom left;
      transition: transform 0.25s cubic-bezier(.34,1.56,.64,1);
    }
    #sizzle-chat-panel.open {
      transform: scale(1);
    }
    #sizzle-chat-header {
      padding: 14px 18px; border-bottom: 1px solid rgba(255,235,205,0.2);
      font-size: 16px; font-weight: bold; display: flex;
      align-items: center; gap: 8px;
    }
    #sizzle-chat-messages {
      flex: 1; overflow-y: auto; padding: 14px;
      display: flex; flex-direction: column; gap: 10px;
      max-height: 300px;
      scrollbar-width: thin; scrollbar-color: antiquewhite transparent;
    }
    .chat-msg {
      max-width: 80%; padding: 10px 14px; border-radius: 18px;
      font-size: 14px; line-height: 1.5; animation: msgPop 0.2s ease;
    }
    @keyframes msgPop { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }
    .chat-msg.user {
      align-self: flex-end; background: antiquewhite; color: #000;
      border-bottom-right-radius: 4px;
    }
    .chat-msg.ai {
      align-self: flex-start; background: rgba(255,235,205,0.12);
      border: 1px solid rgba(255,235,205,0.3); color: antiquewhite;
      border-bottom-left-radius: 4px;
    }
    .chat-msg.typing { opacity: 0.6; font-style: italic; }
    #sizzle-chat-input-row {
      display: flex; gap: 8px; padding: 12px;
      border-top: 1px solid rgba(255,235,205,0.2);
    }
    #sizzle-chat-input {
      flex: 1; background: rgba(255,235,205,0.08);
      border: 1px solid rgba(255,235,205,0.3); border-radius: 20px;
      padding: 8px 14px; color: antiquewhite; font-family: cursive;
      font-size: 13px; outline: none;
    }
    #sizzle-chat-input::placeholder { color: rgba(255,235,205,0.4); }
    #sizzle-chat-send {
      background: antiquewhite; color: #000; border: none;
      border-radius: 50%; width: 36px; height: 36px; cursor: pointer;
      font-size: 16px; display: flex; align-items: center; justify-content: center;
      transition: transform 0.15s;
    }
    #sizzle-chat-send:hover { transform: scale(1.1); }
  `;

  // Inject styles
  const style = document.createElement("style");
  style.textContent = STYLES;
  document.head.appendChild(style);

  // Build HTML
  const btn = document.createElement("button");
  btn.id = "sizzle-chat-btn";
  btn.title = "Ask SIZZLE AI Chef";
  btn.textContent = "🍳";

  const panel = document.createElement("div");
  panel.id = "sizzle-chat-panel";
  panel.innerHTML = `
    <div id="sizzle-chat-header">🤖 SIZZLE AI Chef</div>
    <div id="sizzle-chat-messages">
      <div class="chat-msg ai">Hey! 👨‍🍳 Ask me anything about cooking, recipes, or ingredients!</div>
    </div>
    <div id="sizzle-chat-input-row">
      <input id="sizzle-chat-input" placeholder="Ask the chef..." />
      <button id="sizzle-chat-send">➤</button>
    </div>
  `;

  document.body.appendChild(btn);
  document.body.appendChild(panel);

  // State
  let isOpen = false;
  let history = [];

  btn.addEventListener("click", () => {
    isOpen = !isOpen;
    panel.classList.toggle("open", isOpen);
    btn.textContent = isOpen ? "✕" : "🍳";
    if (isOpen) document.getElementById("sizzle-chat-input").focus();
  });

  const messagesEl = document.getElementById("sizzle-chat-messages");
  const inputEl = document.getElementById("sizzle-chat-input");
  const sendBtn = document.getElementById("sizzle-chat-send");

  function addMessage(text, role) {
    const div = document.createElement("div");
    div.className = `chat-msg ${role}`;
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text) return;

    inputEl.value = "";
    addMessage(text, "user");
    history.push({ role: "user", content: text });

    const typingEl = addMessage("Thinking... 🍲", "ai typing");
    sendBtn.disabled = true;

    try {
      const reply = await SIZZLE_AI.chat(history.slice(-6), text);
      typingEl.remove();
      addMessage(reply, "ai");
      history.push({ role: "assistant", content: reply });
    } catch (err) {
      typingEl.textContent = "⚠️ Couldn't reach the chef right now.";
      typingEl.classList.remove("typing");
    } finally {
      sendBtn.disabled = false;
    }
  }

  sendBtn.addEventListener("click", sendMessage);
  inputEl.addEventListener("keydown", e => { if (e.key === "Enter") sendMessage(); });
})();
