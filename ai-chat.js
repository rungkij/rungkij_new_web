/* ============================================================
   RUNGKIJ AI Chat — ผู้ช่วยค้นหาโครงการ
   Powered by Google Gemini API
   Liquid Glass Design · Self-contained
   ============================================================ */
(function (global) {
  'use strict';

  /* ── CONFIG ─────────────────────────────────────────────── */
  // ⚠️ ใส่ API Key ของ Google Gemini ที่นี่
  // รับ API Key ได้ที่: https://aistudio.google.com/app/apikey
  var GEMINI_API_KEY = 'AIzaSyD7mIkOB0SxWNZfft9siYQixCuu55Zb9aE';
  var GEMINI_MODEL   = 'gemini-2.0-flash';
  var GEMINI_URL     = 'https://generativelanguage.googleapis.com/v1beta/models/'
                     + GEMINI_MODEL + ':generateContent?key=' + GEMINI_API_KEY;

  /* ── PROJECT DATA (from projects-data.js) ──────────────── */
  function getProjectContext() {
    if (typeof RK_PROJECTS === 'undefined') return '';
    var lines = RK_PROJECTS.map(function (p) {
      return '- ' + p.name + ' | ประเภท: ' + p.type + ' | ทำเล: ' + p.location
           + ' | เขต: ' + p.district + ' | ใกล้: ' + p.nearby.join(', ')
           + ' | ราคา: ' + p.price + ' | จำนวน: ' + p.units + ' ยูนิต'
           + ' | สถานะ: ' + (p.status === 'open' ? 'เปิดขาย' : p.status === 'soon' ? 'เร็วๆ นี้' : 'ขายหมด')
           + (p.badge ? ' | ' + p.badge : '')
           + ' | ลิงก์: ' + p.url;
    });
    return lines.join('\n');
  }

  var SYSTEM_PROMPT = 'คุณคือ "น้องรุ่งกิจ" ผู้ช่วย AI ของบริษัท รุ่งกิจ วี.เอส.เค. เอสเตท '
    + 'ผู้พัฒนาอสังหาริมทรัพย์ในกรุงเทพฯ และปริมณฑล\n\n'
    + '## หน้าที่ของคุณ\n'
    + '- แนะนำโครงการบ้านที่เหมาะสมกับไลฟ์สไตล์และความต้องการของลูกค้า\n'
    + '- ตอบคำถามเกี่ยวกับโครงการ ราคา ทำเล สิ่งอำนวยความสะดวก\n'
    + '- ถ้ายังไม่มีข้อมูลเพียงพอ ให้ถามลูกค้าเพิ่ม เช่น งบประมาณ, ทำเลที่สนใจ, ขนาดครอบครัว, ต้องการบ้านเดี่ยวหรือทาวน์โฮม\n'
    + '- พูดเป็นมิตร สุภาพ ใช้ภาษาไทย ใช้ครับ/ค่ะ\n'
    + '- เมื่อแนะนำโครงการ ให้บอกจุดเด่น เหตุผลที่เหมาะกับลูกค้า และราคาเริ่มต้น\n'
    + '- ถ้าลูกค้าสนใจ แนะนำให้โทร 02-540-7999 หรือนัดเยี่ยมชมโครงการ\n'
    + '- ตอบกระชับ ไม่ยาวเกิน 3-4 ประโยค ยกเว้นลูกค้าถามรายละเอียดมาก\n\n'
    + '## ข้อมูลโครงการปัจจุบัน\n'
    + getProjectContext() + '\n\n'
    + '## ข้อมูลบริษัท\n'
    + '- ชื่อ: รุ่งกิจ วี.เอส.เค. เอสเตท\n'
    + '- ประสบการณ์: มากกว่า 20 ปี\n'
    + '- โทร: 02-540-7999\n'
    + '- เวลาทำการ: จ-ศ 9:00-18:00 | ส-อา 9:00-17:00\n'
    + '- Facebook: rungkijcorp | LINE: @rungkij';

  /* ── CSS ─────────────────────────────────────────────────── */
  var CSS = `
/* ---- AI Chat Root ---- */
#aiOverlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0);
  z-index: 10000;
  pointer-events: none;
  transition: background 0.30s ease;
}
#aiOverlay.open {
  background: rgba(0,0,0,0.45);
  pointer-events: auto;
  backdrop-filter: blur(2px);
}

/* ---- Panel ---- */
#aiPanel {
  position: fixed;
  bottom: 90px;
  right: 24px;
  width: 400px;
  max-width: calc(100vw - 32px);
  height: 540px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  z-index: 10001;
  border-radius: 22px;
  overflow: hidden;

  background: rgba(12, 20, 40, 0.88);
  -webkit-backdrop-filter: blur(32px) saturate(180%);
  backdrop-filter: blur(32px) saturate(180%);
  border: 1px solid rgba(185,154,91,0.30);
  box-shadow: 0 24px 64px rgba(0,0,0,0.50), 0 8px 24px rgba(0,0,0,0.30),
              0 0 0 0.5px rgba(185,154,91,0.15) inset,
              0 1px 0 rgba(255,255,255,0.08) inset;

  transform: translateY(28px) scale(0.96);
  opacity: 0;
  pointer-events: none;
  transition: transform 0.36s cubic-bezier(0.34,1.36,0.64,1),
              opacity 0.28s ease;
}
#aiPanel.open {
  transform: translateY(0) scale(1);
  opacity: 1;
  pointer-events: auto;
}

/* Specular */
#aiPanel::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 50%;
  background: linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 100%);
  border-radius: 22px 22px 0 0;
  pointer-events: none;
  z-index: 1;
}

/* ---- Header ---- */
#aiHeader {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px 14px;
  background: linear-gradient(135deg, rgba(185,154,91,0.18) 0%, rgba(185,154,91,0.05) 100%);
  border-bottom: 1px solid rgba(185,154,91,0.20);
  flex-shrink: 0;
}
.ai-avatar {
  width: 40px; height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #b99a5b 0%, #e8c96d 50%, #b99a5b 100%);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  box-shadow: 0 0 0 3px rgba(185,154,91,0.20), 0 4px 12px rgba(185,154,91,0.25);
}
.ai-header-info { flex: 1; min-width: 0; }
.ai-header-name {
  font-family: 'Noto Sans Thai', 'Noto Sans', sans-serif;
  font-size: 14px; font-weight: 600;
  color: #e8c96d;
}
.ai-header-status {
  font-size: 11px;
  color: rgba(255,255,255,0.55);
  display: flex; align-items: center; gap: 5px;
}
.ai-status-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: #4ade80;
  animation: aiPulse 2s infinite;
  flex-shrink: 0;
}
@keyframes aiPulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(74,222,128,0.6); }
  50%      { box-shadow: 0 0 0 4px rgba(74,222,128,0); }
}
#aiCloseBtn {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.70);
  font-size: 16px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.18s, color 0.18s;
  flex-shrink: 0;
}
#aiCloseBtn:hover { background: rgba(255,255,255,0.16); color: #fff; }

/* ---- Body ---- */
#aiBody {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px 16px 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  z-index: 2;
}
#aiBody::-webkit-scrollbar { width: 5px; }
#aiBody::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); }
#aiBody::-webkit-scrollbar-thumb { background: rgba(185,154,91,0.40); border-radius: 3px; }

/* ---- Messages ---- */
.ai-msg {
  max-width: 85%;
  padding: 10px 14px;
  font-family: 'Noto Sans Thai', 'Noto Sans', sans-serif;
  font-size: 13.5px;
  line-height: 1.65;
  border-radius: 16px;
  animation: aiBubbleIn 0.30s cubic-bezier(0.34,1.2,0.64,1) both;
  word-wrap: break-word;
}
@keyframes aiBubbleIn {
  from { opacity: 0; transform: translateY(8px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.ai-msg--bot {
  align-self: flex-start;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.10);
  color: rgba(255,255,255,0.90);
  border-radius: 4px 16px 16px 16px;
}
.ai-msg--bot b, .ai-msg--bot strong { color: #e8c96d; font-weight: 600; }

.ai-msg--user {
  align-self: flex-end;
  background: linear-gradient(135deg, rgba(185,154,91,0.30) 0%, rgba(185,154,91,0.15) 100%);
  border: 1px solid rgba(185,154,91,0.35);
  color: #fff;
  border-radius: 16px 4px 16px 16px;
}

/* ---- Quick Chips ---- */
.ai-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 2px;
  align-self: flex-start;
}
.ai-chip {
  padding: 6px 12px;
  border-radius: 18px;
  background: rgba(185,154,91,0.10);
  border: 1px solid rgba(185,154,91,0.28);
  color: #e8c96d;
  font-family: 'Noto Sans Thai', 'Noto Sans', sans-serif;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.18s, border-color 0.18s, transform 0.12s;
  white-space: nowrap;
}
.ai-chip:hover {
  background: rgba(185,154,91,0.22);
  border-color: rgba(185,154,91,0.55);
  transform: translateY(-1px);
}

/* ---- Project Card (inline) ---- */
.ai-project-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  margin-top: 6px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(185,154,91,0.20);
  border-radius: 12px;
  text-decoration: none;
  color: #fff;
  transition: background 0.18s;
}
.ai-project-card:hover { background: rgba(185,154,91,0.12); }
.ai-project-card img {
  width: 50px; height: 50px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}
.ai-project-card-info { flex: 1; min-width: 0; }
.ai-project-card-name {
  font-size: 13px; font-weight: 600; color: #fff;
  margin: 0 0 2px 0;
}
.ai-project-card-loc {
  font-size: 11px; color: rgba(255,255,255,0.50);
  margin: 0;
}
.ai-project-card-price {
  font-size: 12px; font-weight: 600; color: #e8c96d;
}

/* ---- Typing indicator ---- */
.ai-typing {
  align-self: flex-start;
  display: flex;
  gap: 4px;
  padding: 12px 18px;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.10);
  border-radius: 4px 16px 16px 16px;
}
.ai-typing span {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: rgba(185,154,91,0.60);
  animation: aiDot 1.4s infinite both;
}
.ai-typing span:nth-child(2) { animation-delay: 0.2s; }
.ai-typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes aiDot {
  0%,80%,100% { transform: scale(0.6); opacity: 0.4; }
  40%         { transform: scale(1);    opacity: 1; }
}

/* ---- Input area ---- */
#aiInputArea {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px 16px;
  border-top: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
  position: relative;
  z-index: 2;
}
#aiInput {
  flex: 1;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.14);
  border-radius: 20px;
  padding: 10px 16px;
  color: rgba(255,255,255,0.92);
  font-family: 'Noto Sans Thai', 'Noto Sans', sans-serif;
  font-size: 13.5px;
  outline: none;
  transition: border-color 0.18s, background 0.18s;
  -webkit-appearance: none;
}
#aiInput::placeholder { color: rgba(255,255,255,0.30); }
#aiInput:focus {
  border-color: rgba(185,154,91,0.50);
  background: rgba(255,255,255,0.09);
}
#aiSendBtn {
  width: 40px; height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #b99a5b 0%, #c8a85e 100%);
  border: none;
  color: #0D1B2E;
  font-size: 15px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: transform 0.14s, box-shadow 0.18s;
  box-shadow: 0 2px 10px rgba(185,154,91,0.35);
  flex-shrink: 0;
}
#aiSendBtn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(185,154,91,0.50);
}
#aiSendBtn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* ---- Mobile ---- */
@media (max-width: 480px) {
  #aiPanel {
    bottom: 0; right: 0; left: 0;
    width: 100%; max-width: 100%;
    height: 92vh; max-height: 92vh;
    border-radius: 22px 22px 0 0;
  }
  #aiPanel.open { transform: translateY(0) scale(1); }
  #aiPanel:not(.open) { transform: translateY(100%) scale(1); }
}
`;

  /* ── HTML ─────────────────────────────────────────────────── */
  var HTML = `
<div id="aiOverlay"></div>
<div id="aiPanel" role="dialog" aria-modal="true" aria-label="AI ผู้ช่วยค้นหาโครงการ">
  <div id="aiHeader">
    <div class="ai-avatar">✨</div>
    <div class="ai-header-info">
      <div class="ai-header-name">น้องรุ่งกิจ AI</div>
      <div class="ai-header-status">
        <span class="ai-status-dot"></span>
        <span>ผู้ช่วยค้นหาโครงการ</span>
      </div>
    </div>
    <button id="aiCloseBtn" aria-label="ปิด">✕</button>
  </div>
  <div id="aiBody"></div>
  <div id="aiInputArea">
    <input type="text" id="aiInput" placeholder="พิมพ์คำถามที่นี่..." autocomplete="off">
    <button id="aiSendBtn" aria-label="ส่ง"><i class="fas fa-paper-plane"></i></button>
  </div>
</div>
`;

  /* ── STATE ────────────────────────────────────────────────── */
  var isOpen   = false;
  var injected = false;
  var history  = []; // Gemini chat history
  var isSending = false;

  /* ── INJECT ──────────────────────────────────────────────── */
  function inject() {
    if (injected) return;
    injected = true;

    var style = document.createElement('style');
    style.id = 'ai-chat-styles';
    style.textContent = CSS;
    document.head.appendChild(style);

    var wrapper = document.createElement('div');
    wrapper.id = 'ai-chat-root';
    wrapper.innerHTML = HTML;
    document.body.appendChild(wrapper);

    // Bind
    document.getElementById('aiCloseBtn').addEventListener('click', close);
    document.getElementById('aiOverlay').addEventListener('click', close);
    document.getElementById('aiSendBtn').addEventListener('click', sendMessage);
    document.getElementById('aiInput').addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) close();
    });
  }

  /* ── RENDER HELPERS ──────────────────────────────────────── */
  function getBody() { return document.getElementById('aiBody'); }

  function scrollToBottom() {
    var body = getBody();
    if (body) {
      requestAnimationFrame(function () {
        body.scrollTop = body.scrollHeight;
      });
    }
  }

  function addBotMessage(text) {
    var body = getBody();
    var div = document.createElement('div');
    div.className = 'ai-msg ai-msg--bot';
    div.innerHTML = formatMessage(text);
    body.appendChild(div);
    scrollToBottom();

    // Attach project card links
    attachProjectCards(div);
  }

  function addUserMessage(text) {
    var body = getBody();
    var div = document.createElement('div');
    div.className = 'ai-msg ai-msg--user';
    div.textContent = text;
    body.appendChild(div);
    scrollToBottom();
  }

  function showTyping() {
    var body = getBody();
    var div = document.createElement('div');
    div.className = 'ai-typing';
    div.id = 'aiTyping';
    div.innerHTML = '<span></span><span></span><span></span>';
    body.appendChild(div);
    scrollToBottom();
  }

  function hideTyping() {
    var el = document.getElementById('aiTyping');
    if (el) el.remove();
  }

  function addChips(chips) {
    var body = getBody();
    var container = document.createElement('div');
    container.className = 'ai-chips';
    chips.forEach(function (label) {
      var btn = document.createElement('button');
      btn.className = 'ai-chip';
      btn.textContent = label;
      btn.addEventListener('click', function () {
        container.remove();
        submitUserText(label);
      });
      container.appendChild(btn);
    });
    body.appendChild(container);
    scrollToBottom();
  }

  // Simple markdown → HTML (bold, links, line breaks)
  function formatMessage(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  // Render project card if bot mentions a project name
  function attachProjectCards(msgEl) {
    if (typeof RK_PROJECTS === 'undefined') return;
    var text = msgEl.textContent || '';
    var found = [];
    RK_PROJECTS.forEach(function (p) {
      if (p.status === 'sold') return;
      if (text.indexOf(p.name) !== -1 && found.indexOf(p.name) === -1) {
        found.push(p.name);
        var card = document.createElement('a');
        card.className = 'ai-project-card';
        card.href = p.url;
        card.innerHTML =
          '<img src="' + p.image + '" alt="' + p.name + '">' +
          '<div class="ai-project-card-info">' +
            '<p class="ai-project-card-name">' + p.name + '</p>' +
            '<p class="ai-project-card-loc"><i class="fas fa-map-marker-alt" style="margin-right:3px;color:#b99a5b;font-size:10px"></i>' + p.location + '</p>' +
            '<span class="ai-project-card-price">' + p.price + '</span>' +
          '</div>';
        msgEl.appendChild(card);
      }
    });
  }

  /* ── GEMINI API ──────────────────────────────────────────── */
  function callGemini(userText, callback) {
    // Build contents with history
    var contents = [];

    // System instruction (first turn)
    contents.push({
      role: 'user',
      parts: [{ text: SYSTEM_PROMPT + '\n\n---\n\nลูกค้าเปิดแชทใหม่ ทักทายลูกค้าได้เลย' }]
    });
    contents.push({
      role: 'model',
      parts: [{ text: history.length > 0 ? history[0].botReply : 'สวัสดีครับ' }]
    });

    // Append conversation history
    for (var i = 0; i < history.length; i++) {
      contents.push({ role: 'user',  parts: [{ text: history[i].user }] });
      contents.push({ role: 'model', parts: [{ text: history[i].botReply }] });
    }

    // Current user message
    contents.push({ role: 'user', parts: [{ text: userText }] });

    var payload = {
      contents: contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
        topP: 0.9
      }
    };

    fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(function (res) { return res.json(); })
    .then(function (data) {
      var text = '';
      try {
        text = data.candidates[0].content.parts[0].text;
      } catch (e) {
        text = 'ขออภัยครับ ระบบขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้ง หรือโทร 02-540-7999 เพื่อติดต่อทีมงานโดยตรงครับ';
      }
      callback(text);
    })
    .catch(function () {
      callback('ขออภัยครับ ไม่สามารถเชื่อมต่อได้ในขณะนี้ กรุณาลองใหม่ หรือโทร 02-540-7999 ครับ');
    });
  }

  /* ── SEND MESSAGE ────────────────────────────────────────── */
  function submitUserText(text) {
    if (isSending || !text.trim()) return;
    isSending = true;

    var input = document.getElementById('aiInput');
    var btn   = document.getElementById('aiSendBtn');
    input.value = '';
    btn.disabled = true;

    addUserMessage(text);
    showTyping();

    callGemini(text, function (reply) {
      hideTyping();
      addBotMessage(reply);

      // Store in history
      history.push({ user: text, botReply: reply });

      isSending = false;
      btn.disabled = false;
      input.focus();
    });
  }

  function sendMessage() {
    var input = document.getElementById('aiInput');
    var text = input.value.trim();
    if (text) submitUserText(text);
  }

  /* ── GREETING ────────────────────────────────────────────── */
  function showGreeting() {
    var body = getBody();
    if (body.children.length > 0) return; // already has messages

    addBotMessage(
      'สวัสดีครับ 👋 ผมคือ <strong>น้องรุ่งกิจ</strong> ผู้ช่วย AI ค้นหาโครงการบ้านที่ใช่สำหรับคุณ\n\n'
      + 'บอกผมได้เลยครับว่าคุณกำลังมองหาบ้านแบบไหน หรือเลือกจากตัวเลือกด้านล่างก็ได้ครับ'
    );

    addChips([
      '🏠 อยากได้บ้านเดี่ยว',
      '🏘 สนใจทาวน์โฮม',
      '📍 ใกล้สนามบิน',
      '💰 งบไม่เกิน 3 ล้าน'
    ]);
  }

  /* ── OPEN / CLOSE ────────────────────────────────────────── */
  function open() {
    inject();
    if (isOpen) return;
    isOpen = true;

    requestAnimationFrame(function () {
      document.getElementById('aiOverlay').classList.add('open');
      document.getElementById('aiPanel').classList.add('open');
    });

    showGreeting();

    setTimeout(function () {
      document.getElementById('aiInput').focus();
    }, 400);
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    document.getElementById('aiPanel').classList.remove('open');
    document.getElementById('aiOverlay').classList.remove('open');
  }

  /* ── PUBLIC API ──────────────────────────────────────────── */
  global.AiChat = {
    open: open,
    close: close,
    toggle: function () { isOpen ? close() : open(); }
  };

})(window);
