/* ============================================================
   RUNGKIJ Chat Widget — Floating Chat Plugin
   Liquid Glass Design · iOS 26 Aesthetic · Self-contained
   ============================================================ */
(function (global) {
  'use strict';

  /* ── CSS ─────────────────────────────────────────────────── */
  var CSS = `
/* ---- Chat Widget Root ---- */
:root {
  --cw-gold:      #C9A84C;
  --cw-gold2:     #E8C96D;
  --cw-navy:      #0D1B2E;
  --cw-navy2:     #162236;
  --cw-glass-bg:  rgba(13,27,46,0.72);
  --cw-glass-br:  rgba(201,168,76,0.30);
  --cw-blur:      blur(32px) saturate(180%);
  --cw-radius:    22px;
  --cw-shadow:    0 24px 64px rgba(0,0,0,0.45), 0 8px 24px rgba(0,0,0,0.30);
  --cw-z:         9999;
}

/* ---- Overlay ---- */
#cwOverlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0);
  z-index: calc(var(--cw-z) - 1);
  pointer-events: none;
  transition: background 0.30s ease;
}
#cwOverlay.open {
  background: rgba(0,0,0,0.40);
  pointer-events: auto;
  backdrop-filter: blur(2px);
}

/* ---- Panel ---- */
#cwPanel {
  position: fixed;
  bottom: 90px;
  right: 24px;
  width: 380px;
  max-width: calc(100vw - 32px);
  max-height: 86vh;
  display: flex;
  flex-direction: column;
  z-index: var(--cw-z);
  border-radius: var(--cw-radius);
  overflow: hidden;

  /* Liquid Glass */
  background: var(--cw-glass-bg);
  -webkit-backdrop-filter: var(--cw-blur);
  backdrop-filter: var(--cw-blur);
  border: 1px solid var(--cw-glass-br);
  box-shadow: var(--cw-shadow),
              0 0 0 0.5px rgba(201,168,76,0.15) inset,
              0 1px 0 rgba(255,255,255,0.10) inset;

  /* Entrance animation */
  transform: translateY(28px) scale(0.96);
  opacity: 0;
  pointer-events: none;
  transition: transform 0.36s cubic-bezier(0.34,1.36,0.64,1),
              opacity 0.28s ease;
}
#cwPanel.open {
  transform: translateY(0) scale(1);
  opacity: 1;
  pointer-events: auto;
}

/* Specular highlight */
#cwPanel::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 50%;
  background: linear-gradient(180deg, rgba(255,255,255,0.07) 0%, transparent 100%);
  border-radius: var(--cw-radius) var(--cw-radius) 0 0;
  pointer-events: none;
  z-index: 1;
}

/* ---- Header ---- */
#cwHeader {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 20px 16px;
  background: linear-gradient(135deg, rgba(201,168,76,0.18) 0%, rgba(201,168,76,0.06) 100%);
  border-bottom: 1px solid rgba(201,168,76,0.20);
  flex-shrink: 0;
}
.cw-avatar {
  width: 42px; height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--cw-gold) 0%, #f0dc8a 50%, var(--cw-gold) 100%);
  display: flex; align-items: center; justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
  box-shadow: 0 0 0 3px rgba(201,168,76,0.20), 0 4px 12px rgba(201,168,76,0.30);
}
.cw-header-info { flex: 1; min-width: 0; }
.cw-header-name {
  font-family: 'Prompt', 'Noto Sans Thai', sans-serif;
  font-size: 14px; font-weight: 600;
  color: var(--cw-gold2);
  line-height: 1.3;
}
.cw-header-status {
  font-size: 11px;
  color: rgba(255,255,255,0.55);
  display: flex; align-items: center; gap: 5px;
}
.cw-status-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: #4ade80;
  animation: cwPulse 2s infinite;
  flex-shrink: 0;
}
@keyframes cwPulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(74,222,128,0.6); }
  50%      { box-shadow: 0 0 0 4px rgba(74,222,128,0); }
}
#cwCloseBtn {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.70);
  font-size: 16px; line-height: 1;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.18s, color 0.18s;
  flex-shrink: 0;
}
#cwCloseBtn:hover { background: rgba(255,255,255,0.16); color: #fff; }

/* ---- Body (scroll area) ---- */
#cwBody {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px 20px 8px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  z-index: 2;
}
#cwBody::-webkit-scrollbar { width: 6px; }
#cwBody::-webkit-scrollbar-track { background: rgba(255,255,255,0.04); border-radius: 3px; }
#cwBody::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.45); border-radius: 3px; }
#cwBody::-webkit-scrollbar-thumb:hover { background: rgba(201,168,76,0.75); }
/* Firefox */
#cwBody { scrollbar-width: thin; scrollbar-color: rgba(201,168,76,0.45) rgba(255,255,255,0.04); }

/* ---- Greeting bubble ---- */
.cw-bubble {
  align-self: flex-start;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.10);
  border-radius: 4px 16px 16px 16px;
  padding: 12px 14px;
  font-family: 'Prompt', 'Noto Sans Thai', sans-serif;
  font-size: 13.5px;
  color: rgba(255,255,255,0.88);
  line-height: 1.6;
  max-width: 88%;
  animation: cwBubbleIn 0.40s cubic-bezier(0.34,1.2,0.64,1) both;
}
.cw-bubble + .cw-bubble { animation-delay: 0.12s; }
.cw-bubble b { color: var(--cw-gold2); font-weight: 600; }
@keyframes cwBubbleIn {
  from { opacity: 0; transform: translateY(10px) scale(0.95); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* ---- Quick-reply chips ---- */
.cw-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}
.cw-chip {
  padding: 7px 14px;
  border-radius: 20px;
  background: rgba(201,168,76,0.10);
  border: 1px solid rgba(201,168,76,0.30);
  color: var(--cw-gold2);
  font-family: 'Prompt', 'Noto Sans Thai', sans-serif;
  font-size: 12.5px;
  cursor: pointer;
  transition: background 0.18s, border-color 0.18s, transform 0.12s;
  white-space: nowrap;
  -webkit-tap-highlight-color: transparent;
}
.cw-chip:hover {
  background: rgba(201,168,76,0.22);
  border-color: rgba(201,168,76,0.55);
  transform: translateY(-1px);
}
.cw-chip:active { transform: translateY(0); }
.cw-chip.used {
  background: rgba(201,168,76,0.22);
  border-color: var(--cw-gold);
  pointer-events: none;
}

/* ---- Form ---- */
.cw-form { display: flex; flex-direction: column; gap: 12px; }
.cw-field-label {
  font-family: 'Prompt', 'Noto Sans Thai', sans-serif;
  font-size: 11.5px;
  color: rgba(255,255,255,0.50);
  margin-bottom: 4px;
  display: block;
}
.cw-input, .cw-textarea {
  width: 100%;
  box-sizing: border-box;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.14);
  border-radius: 12px;
  padding: 11px 14px;
  color: rgba(255,255,255,0.90);
  font-family: 'Prompt', 'Noto Sans Thai', sans-serif;
  font-size: 13.5px;
  outline: none;
  transition: border-color 0.18s, background 0.18s;
  -webkit-appearance: none;
}
.cw-input::placeholder, .cw-textarea::placeholder {
  color: rgba(255,255,255,0.30);
}
.cw-input:focus, .cw-textarea:focus {
  border-color: rgba(201,168,76,0.55);
  background: rgba(255,255,255,0.09);
}
.cw-input.error, .cw-textarea.error {
  border-color: rgba(239,68,68,0.65);
  animation: cwShake 0.40s ease;
}
@keyframes cwShake {
  0%,100% { transform: translateX(0); }
  20%     { transform: translateX(-6px); }
  40%     { transform: translateX(6px); }
  60%     { transform: translateX(-4px); }
  80%     { transform: translateX(4px); }
}
.cw-textarea { resize: none; min-height: 72px; }

/* ---- Select (โครงการที่สนใจ) ---- */
.cw-select {
  width: 100%;
  box-sizing: border-box;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.14);
  border-radius: 12px;
  padding: 11px 36px 11px 14px;
  color: rgba(255,255,255,0.90);
  font-family: 'Prompt', 'Noto Sans Thai', sans-serif;
  font-size: 13.5px;
  outline: none;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  transition: border-color 0.18s, background 0.18s;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(201,168,76,0.7)' stroke-width='1.8' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
}
.cw-select option {
  background: #0D1B2E;
  color: rgba(255,255,255,0.88);
}
.cw-select:focus {
  border-color: rgba(201,168,76,0.55);
  background-color: rgba(255,255,255,0.09);
}
.cw-select.error { border-color: rgba(239,68,68,0.65); animation: cwShake 0.40s ease; }
.cw-select option[value=''] { color: rgba(255,255,255,0.35); }

/* ---- Send button ---- */
.cw-send-btn {
  width: 100%;
  padding: 13px 20px;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--cw-gold) 0%, #e0b84a 50%, var(--cw-gold) 100%);
  background-size: 200% 100%;
  border: none;
  color: var(--cw-navy);
  font-family: 'Prompt', 'Noto Sans Thai', sans-serif;
  font-size: 14px; font-weight: 700;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: background-position 0.40s, transform 0.14s, box-shadow 0.20s;
  box-shadow: 0 4px 16px rgba(201,168,76,0.35);
  margin-top: 4px;
  -webkit-tap-highlight-color: transparent;
}
.cw-send-btn:hover {
  background-position: 100% 0;
  box-shadow: 0 6px 22px rgba(201,168,76,0.50);
  transform: translateY(-1px);
}
.cw-send-btn:active { transform: translateY(0); }
.cw-send-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* ---- Success state ---- */
#cwSuccess {
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 32px 24px;
  gap: 14px;
  min-height: 220px;
}
#cwSuccess.show { display: flex; }
.cw-success-icon {
  width: 64px; height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(201,168,76,0.25) 0%, rgba(201,168,76,0.08) 100%);
  border: 1.5px solid rgba(201,168,76,0.40);
  display: flex; align-items: center; justify-content: center;
  font-size: 28px;
  animation: cwSuccessPop 0.5s cubic-bezier(0.34,1.5,0.64,1) both;
}
@keyframes cwSuccessPop {
  from { transform: scale(0) rotate(-10deg); opacity: 0; }
  to   { transform: scale(1) rotate(0deg);  opacity: 1; }
}
.cw-success-title {
  font-family: 'Prompt', 'Noto Sans Thai', sans-serif;
  font-size: 17px; font-weight: 700;
  color: var(--cw-gold2);
}
.cw-success-sub {
  font-family: 'Prompt', 'Noto Sans Thai', sans-serif;
  font-size: 13px;
  color: rgba(255,255,255,0.60);
  line-height: 1.6;
}
.cw-social-row {
  display: flex; gap: 12px; margin-top: 6px;
}
.cw-social-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 18px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.14);
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.80);
  font-family: 'Prompt', 'Noto Sans Thai', sans-serif;
  font-size: 13px;
  text-decoration: none;
  transition: background 0.18s;
  cursor: pointer;
}
.cw-social-btn:hover { background: rgba(255,255,255,0.12); }
.cw-social-btn.fb { border-color: rgba(24,119,242,0.30); }
.cw-social-btn.line { border-color: rgba(0,195,0,0.30); }

/* ---- Footer ---- */
#cwFooter {
  padding: 12px 20px 18px;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
  border-top: 1px solid rgba(255,255,255,0.06);
}
.cw-footer-note {
  text-align: center;
  font-size: 11px;
  color: rgba(255,255,255,0.28);
  font-family: 'Prompt', 'Noto Sans Thai', sans-serif;
}
.cw-footer-note a {
  color: rgba(201,168,76,0.55);
  text-decoration: none;
}

/* ---- Mobile ---- */
@media (max-width: 480px) {
  #cwPanel {
    bottom: 0;
    right: 0;
    left: 0;
    width: 100%;
    max-width: 100%;
    border-radius: 24px 24px 0 0;
    max-height: 90vh;
  }
  #cwPanel.open { transform: translateY(0) scale(1); }
  #cwPanel:not(.open) { transform: translateY(100%) scale(1); }
}
`;

  /* ── HTML Template ────────────────────────────────────────── */
  var HTML = `
<div id="cwOverlay"></div>
<div id="cwPanel" role="dialog" aria-modal="true" aria-label="แชทกับเรา">

  <!-- Header -->
  <div id="cwHeader">
    <div class="cw-avatar">🏠</div>
    <div class="cw-header-info">
      <div class="cw-header-name">รุ่งกิจ วี.เอส.เค. เอสเตท</div>
      <div class="cw-header-status">
        <span class="cw-status-dot"></span>
        <span>ทีมงานพร้อมตอบคำถาม</span>
      </div>
    </div>
    <button id="cwCloseBtn" aria-label="ปิด">✕</button>
  </div>

  <!-- Body -->
  <div id="cwBody">
    <div class="cw-bubble">
      สวัสดีครับ 👋<br>
      ยินดีต้อนรับสู่ <b>รุ่งกิจ วี.เอส.เค. เอสเตท</b><br>
      สามารถสอบถามข้อมูลโครงการ ราคา หรือนัดเยี่ยมชมได้เลยครับ
    </div>
    <div class="cw-bubble" style="animation-delay:0.12s">
      สนใจเรื่องใดเป็นพิเศษครับ?
    </div>
    <div class="cw-chips" id="cwChips">
      <button class="cw-chip" data-topic="ดูโครงการ">🏘 ดูโครงการ</button>
      <button class="cw-chip" data-topic="ราคาและโปรโมชั่น">💰 ราคา &amp; โปร</button>
      <button class="cw-chip" data-topic="คำนวณสินเชื่อ">🏦 คำนวณสินเชื่อ</button>
      <button class="cw-chip" data-topic="นัดเยี่ยมชม">📅 นัดเยี่ยมชม</button>
    </div>

    <!-- Form -->
    <form id="cwForm" class="cw-form" novalidate>
      <div>
        <label class="cw-field-label">ชื่อ – นามสกุล <span style="color:rgba(239,68,68,0.80)">*</span></label>
        <input type="text" id="cwName" class="cw-input" placeholder="กรุณาระบุชื่อของท่าน" autocomplete="name">
      </div>
      <div>
        <label class="cw-field-label">เบอร์โทรศัพท์ <span style="color:rgba(239,68,68,0.80)">*</span></label>
        <input type="tel" id="cwPhone" class="cw-input" placeholder="08X-XXX-XXXX" autocomplete="tel" inputmode="tel">
      </div>
      <div>
        <label class="cw-field-label">อีเมล</label>
        <input type="email" id="cwEmail" class="cw-input" placeholder="example@email.com" autocomplete="email" inputmode="email">
      </div>
      <div>
        <label class="cw-field-label">โครงการที่สนใจ</label>
        <select id="cwProject" class="cw-select">
          <option value="">— เลือกโครงการ —</option>
          <optgroup label="บ้านเดี่ยว">
            <option value="The Hampton (พระราม 9-กรุงเทพกรีฑา)">The Hampton — พระราม 9</option>
            <option value="Grand Verona (รามคำแหง-ร่มเกล้า)">Grand Verona — รามคำแหง</option>
          </optgroup>
          <optgroup label="ทาวน์โฮม / โฮมออฟฟิส">
            <option value="The Nice (รังสิต-คลอง 3)">The Nice — รังสิต คลอง 3</option>
            <option value="The Verona Village (พระราม 9-กรุงเทพกรีฑา)">The Verona Village — พระราม 9</option>
            <option value="Osaka (รามอินทรา-คู้บอน)">Osaka — รามอินทรา</option>
            <option value="The Corner นิมิตรใหม่">The Corner — นิมิตรใหม่</option>
          </optgroup>
          <optgroup label="เร็วๆ นี้">
            <option value="Hampton Grove (มอเตอร์เวย์-กรุงเทพกรีฑา)">Hampton Grove — กรุงเทพกรีฑา (Coming Soon)</option>
          </optgroup>
          <option value="ยังไม่แน่ใจ">ยังไม่แน่ใจ / ขอข้อมูลทุกโครงการ</option>
        </select>
      </div>
      <div>
        <label class="cw-field-label">ข้อความ / คำถาม</label>
        <textarea id="cwMsg" class="cw-textarea" placeholder="พิมพ์คำถามหรือข้อสงสัยที่นี่..."></textarea>
      </div>
      <button type="submit" class="cw-send-btn" id="cwSendBtn">
        <i class="fas fa-paper-plane"></i>
        <span>ส่งข้อความ</span>
      </button>
    </form>

    <!-- Success state (hidden until submit) -->
    <div id="cwSuccess">
      <div class="cw-success-icon">✅</div>
      <div class="cw-success-title">ได้รับข้อความแล้วครับ!</div>
      <div class="cw-success-sub">
        ทีมงานจะติดต่อกลับ<br>ภายใน <b style="color:var(--cw-gold2)">30 นาที</b> ในเวลาทำการครับ
      </div>
      <div class="cw-social-row">
        <a href="https://m.me/rungkijcorp" class="cw-social-btn fb" target="_blank" rel="noopener">
          <i class="fab fa-facebook-messenger"></i> Messenger
        </a>
        <a href="https://line.me/R/ti/p/@rungkij" class="cw-social-btn line" target="_blank" rel="noopener">
          <i class="fab fa-line"></i> LINE
        </a>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div id="cwFooter">
    <div class="cw-footer-note">
      โทร <a href="tel:+6625407999">02-540-7999</a> &nbsp;|&nbsp;
      จ–ศ 9:00–18:00 &nbsp;|&nbsp; ส–อา 9:00–17:00
    </div>
  </div>

</div>
`;

  /* ── State ────────────────────────────────────────────────── */
  var isOpen   = false;
  var injected = false;
  var selectedTopic = '';

  /* ── Inject ───────────────────────────────────────────────── */
  function inject() {
    if (injected) return;
    injected = true;

    // CSS
    var style = document.createElement('style');
    style.id = 'cw-styles';
    style.textContent = CSS;
    document.head.appendChild(style);

    // HTML
    var wrapper = document.createElement('div');
    wrapper.id = 'cw-root';
    wrapper.innerHTML = HTML;
    document.body.appendChild(wrapper);

    // Bind events
    document.getElementById('cwCloseBtn').addEventListener('click', close);
    document.getElementById('cwOverlay').addEventListener('click', close);
    document.getElementById('cwForm').addEventListener('submit', handleSubmit);

    // Chip selection
    var chips = document.querySelectorAll('#cwChips .cw-chip');
    chips.forEach(function(chip) {
      chip.addEventListener('click', function() {
        chips.forEach(function(c) { c.classList.remove('used'); });
        chip.classList.add('used');
        selectedTopic = chip.getAttribute('data-topic');
        // Pre-fill message
        var msgEl = document.getElementById('cwMsg');
        if (!msgEl.value) {
          msgEl.value = 'สอบถามเรื่อง: ' + selectedTopic;
        }
        // If calc chip clicked, offer to redirect
        if (selectedTopic === 'คำนวณสินเชื่อ') {
          msgEl.value = 'ต้องการคำนวณสินเชื่อเพื่อซื้อบ้าน';
        }
        document.getElementById('cwName').focus();
      });
    });

    // ESC key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isOpen) close();
    });
  }

  /* ── Validate ─────────────────────────────────────────────── */
  function validate() {
    var ok      = true;
    var nameEl  = document.getElementById('cwName');
    var phoneEl = document.getElementById('cwPhone');
    var emailEl = document.getElementById('cwEmail');

    [nameEl, phoneEl, emailEl].forEach(function(el) { el.classList.remove('error'); });

    if (!nameEl.value.trim()) {
      nameEl.classList.add('error');
      nameEl.focus();
      ok = false;
    }
    if (!phoneEl.value.trim() || !/^[0-9\-\s\+]{9,15}$/.test(phoneEl.value.trim())) {
      phoneEl.classList.add('error');
      if (ok) phoneEl.focus();
      ok = false;
    }
    // Email optional — แต่ถ้ากรอกมา ต้องถูก format
    var emailVal = emailEl.value.trim();
    if (emailVal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      emailEl.classList.add('error');
      if (ok) emailEl.focus();
      ok = false;
    }
    return ok;
  }

  /* ── Submit ───────────────────────────────────────────────── */
  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    var btn = document.getElementById('cwSendBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>กำลังส่ง...</span>';

    // Simulate async (replace with real fetch/API call if needed)
    setTimeout(function() {
      document.getElementById('cwForm').style.display = 'none';
      document.getElementById('cwChips').style.display = 'none';
      document.querySelectorAll('#cwBody .cw-bubble').forEach(function(b) {
        b.style.display = 'none';
      });

      var success = document.getElementById('cwSuccess');
      success.classList.add('show');

      // Log data (replace with real submission endpoint)
      var payload = {
        name:    document.getElementById('cwName').value.trim(),
        phone:   document.getElementById('cwPhone').value.trim(),
        email:   document.getElementById('cwEmail').value.trim(),
        project: document.getElementById('cwProject').value,
        message: document.getElementById('cwMsg').value.trim(),
        topic:   selectedTopic,
        page:    window.location.pathname,
        ts:      new Date().toISOString()
      };
      if (global.console) {
        console.log('[ChatWidget] Lead captured:', payload);
      }

      // If you have a webhook / form endpoint, uncomment and configure:
      /*
      fetch('https://your-api.example.com/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(function(){});
      */
    }, 900);
  }

  /* ── Open / Close ─────────────────────────────────────────── */
  function open() {
    inject();
    if (isOpen) return;
    isOpen = true;

    var panel   = document.getElementById('cwPanel');
    var overlay = document.getElementById('cwOverlay');

    // Reset form state if previously submitted
    var form    = document.getElementById('cwForm');
    var success = document.getElementById('cwSuccess');
    var chips   = document.getElementById('cwChips');
    var bubbles = document.querySelectorAll('#cwBody .cw-bubble');

    if (success && success.classList.contains('show')) {
      success.classList.remove('show');
      form.style.display = '';
      chips.style.display = '';
      bubbles.forEach(function(b) { b.style.display = ''; });
      // Reset all fields
      ['cwName','cwPhone','cwEmail','cwMsg'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) { el.value = ''; el.classList.remove('error'); }
      });
      var proj = document.getElementById('cwProject');
      if (proj) proj.value = '';
      selectedTopic = '';
      document.querySelectorAll('#cwChips .cw-chip').forEach(function(c) { c.classList.remove('used'); });
      var btn = document.getElementById('cwSendBtn');
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> <span>ส่งข้อความ</span>';
    }

    requestAnimationFrame(function() {
      overlay.classList.add('open');
      panel.classList.add('open');
    });

    // Trap focus inside panel
    panel.setAttribute('tabindex', '-1');
    panel.focus();
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;

    var panel   = document.getElementById('cwPanel');
    var overlay = document.getElementById('cwOverlay');

    panel.classList.remove('open');
    overlay.classList.remove('open');
  }

  function toggle() {
    isOpen ? close() : open();
  }

  /* ── Auto-inject on DOMContentLoaded ─────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    // DOM is ready
    setTimeout(inject, 0);
  }

  /* ── Public API ───────────────────────────────────────────── */
  global.ChatWidget = {
    open:   open,
    close:  close,
    toggle: toggle
  };

}(typeof window !== 'undefined' ? window : this));
