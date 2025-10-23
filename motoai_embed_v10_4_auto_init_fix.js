/*!
  MotoAI v10.4 AUTO INIT FIX (placement: left)
  - Auto init + retry if document.body not ready
  - Keeps full AI logic (corpus, cosine, memory, session)
  - By: MotoOpen (refactor for auto-init)
*/

(function(){
  // Prevent double-load
  if (window.MotoAI_v10_4_AUTO_INIT_FIX_LOADED) return;
  window.MotoAI_v10_4_AUTO_INIT_FIX_LOADED = true;

  const LOG = (...args) => {
    try { console.log('[MotoAI]', ...args); } catch(e) {}
  };

  LOG('AutoInit started... (v10.4 AUTO INIT FIX, placement: left)');

  // Try to safely inject when DOM/body available. Retry logic.
  const MAX_RETRY = 20;
  const RETRY_DELAY = 300; // ms

  let retryCount = 0;
  function tryInitWhenReady() {
    if (document && document.body) {
      try {
        initMotoAI(); // main initialization
      } catch (e) {
        LOG('Init failed with error:', e);
      }
    } else {
      retryCount++;
      if (retryCount > MAX_RETRY) {
        LOG('AutoInit failed: document.body not ready after retries.');
        return;
      }
      setTimeout(tryInitWhenReady, RETRY_DELAY);
    }
  }

  // If DOMContentLoaded or complete, try immediately, else wait load
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    tryInitWhenReady();
  } else {
    window.addEventListener('DOMContentLoaded', tryInitWhenReady, { once: true });
    // as fallback in case DOMContentLoaded not fired timely
    window.addEventListener('load', tryInitWhenReady, { once: true });
  }

  // ---------- The full MotoAI code (adapted from v10.4 stable full fixed) ----------
  function initMotoAI() {
    // Prevent double injection if another copy present
    if (document.getElementById('motoai-root')) {
      LOG('Already injected - aborting double inject.');
      return;
    }

    LOG('Injecting UI...');

    /* ------------- CONFIG (v10.4: Cập nhật keys) ------------- */
    const CFG = {
      placement: 'left',              // 'left' or 'right'
      maxCorpusSentences: 800,        // cap the number of sentences to index
      minSentenceLen: 18,
      suggestionTags: [
        {q:'Xe số', label:'🏍 Xe số'},
        {q:'Xe ga', label:'🛵 Xe ga'},
        {q:'Xe 50cc', label:'🚲 Xe 50cc'},
        {q:'Thủ tục', label:'📄 Thủ tục'}
      ],
      corpusKey: 'MotoAI_v10_4_stable_corpus_v1_fixed_autoinit',
      sessionKey: 'MotoAI_v10_4_stable_session_v1_fixed_autoinit',
      memoryKey: 'MotoAI_v10_4_stable_memory_v1_fixed_autoinit',
      embedNgram: 3,
      minScoreThreshold: 0.06
    };

    /* ------------- INJECT HTML ------------- */
    const html = `
    <div id="motoai-root" aria-hidden="false" data-placement="${CFG.placement}">
      <div id="motoai-bubble" role="button" aria-label="Mở MotoAI">🤖</div>

      <div id="motoai-overlay" aria-hidden="true">
        <div id="motoai-card" role="dialog" aria-modal="true" aria-hidden="true">
          <div id="motoai-handle" aria-hidden="true"></div>

          <header id="motoai-header">
            <div class="title">MotoAI Assistant</div>
            <div class="tools">
              <button id="motoai-clear" title="Xóa hội thoại">🗑</button>
              <button id="motoai-close" title="Đóng">✕</button>
            </div>
          </header>

          <main id="motoai-body" tabindex="0" role="log" aria-live="polite">
            <div class="m-msg bot">👋 Chào bạn! Mình là MotoAI — hỏi thử “Xe ga”, “Xe số”, “Xe 50cc”, hoặc “Thủ tục” nhé!</div>
          </main>

          <div id="motoai-suggestions" role="toolbar" aria-label="Gợi ý nhanh"></div>

          <footer id="motoai-footer">
            <div id="motoai-typing" aria-hidden="true"></div>
            
            <input id="motoai-input" placeholder="Nhập câu hỏi..." autocomplete="off" aria-label="Nhập câu hỏi" />
            <button id="motoai-send" aria-label="Gửi">Gửi</button>
          </footer>

        </div>
      </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    /* ------------- INJECT CSS (v10.4: Tối ưu UI/UX) ------------- */
    const css = `
    :root{
      --m10-accent: #007aff;
      --m10-card-radius: 18px;
      --m10-card-bg: rgba(255,255,255,0.86);
      --m10-card-bg-dark: rgba(20,20,22,0.94);
      --m10-blur: blur(12px) saturate(140%);
      --m10-vh: 1vh;
    }
    #motoai-root { position: fixed; bottom: 18px; z-index: 2147483000; pointer-events: none; }
    #motoai-root[data-placement="left"]{ left: 16px; }
    #motoai-root[data-placement="right"]{ right: 16px; }

    #motoai-bubble{
      pointer-events: auto; width:56px; height:56px; border-radius:14px;
      display:flex;align-items:center;justify-content:center;font-size:26px;
      background:var(--m10-accent); color:#fff; cursor:pointer; box-shadow:0 10px 28px rgba(2,6,23,0.18);
      transition: transform .16s ease;
    }
    #motoai-bubble:hover{ transform: scale(1.06); }

    #motoai-overlay{
      position: fixed; inset: 0; display:flex; align-items:flex-end; justify-content:center;
      padding:12px;
      padding-bottom: 12px;
      pointer-events: none;
      transition: background .24s ease, padding-bottom .2s ease-out;
      z-index:2147482999;
    }
    #motoai-overlay.visible{ background: rgba(0,0,0,0.18); pointer-events: auto; }
    
    #motoai-card{
      width: min(920px, calc(100% - 36px)); max-width: 920px;
      height: calc(var(--m10-vh, 1vh) * 72);
      max-height: calc(var(--m10-vh, 1vh) * 100 - 40px);
      min-height: 320px;
      border-radius: var(--m10-card-radius) var(--m10-card-radius) 12px 12px;
      background: var(--m10-card-bg); backdrop-filter: var(--m10-blur); -webkit-backdrop-filter: var(--m10-blur);
      box-shadow: 0 -18px 60px rgba(0,0,0,.22);
      display:flex; flex-direction: column; overflow:hidden;
      transform: translateY(110%); opacity: 0; pointer-events: auto;
      transition: transform .36s cubic-bezier(.2,.9,.2,1), opacity .28s ease, max-height .2s ease-out;
    }
    #motoai-overlay.visible #motoai-card{ transform: translateY(0); opacity:1; }

    #motoai-handle{ width:64px; height:6px; background: rgba(160,160,160,0.6); border-radius:6px; margin:10px auto; }

    #motoai-header{ display:flex; align-items:center; justify-content:space-between; padding:8px 14px; font-weight:700; color:var(--m10-accent); border-bottom:1px solid rgba(0,0,0,0.06); }
    #motoai-header .tools button{ background:none; border:none; font-size:18px; cursor:pointer; padding:6px 8px; color: #888; }

    #motoai-body{ flex:1; overflow:auto; padding:12px 16px; font-size:15px; background: transparent; -webkit-overflow-scrolling: touch; }
    .m-msg{ margin:8px 0; padding:12px 14px; border-radius:16px; max-width:86%; line-height:1.4; word-break:break-word; box-shadow:0 4px 8px rgba(0,0,0,0.06); }
    .m-msg.bot{ background: rgba(255,255,255,0.9); color:#111; }
    .m-msg.user{ background: linear-gradient(180deg,var(--m10-accent),#00b6ff); color:#fff; margin-left:auto; }

    #motoai-suggestions{ display:flex; gap:8px; justify-content:center; flex-wrap:wrap; padding:8px 12px; border-top:1px solid rgba(0,0,0,0.04); background: rgba(255,255,255,0.6); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
    #motoai-suggestions button{ border: none; background: rgba(0,122,255,0.08); color:var(--m10-accent); padding:8px 12px; border-radius:12px; cursor:pointer; font-weight:600; }

    #motoai-footer{ 
      display:flex; align-items:center; 
      padding:10px 12px; 
      border-top:1px solid rgba(0,0,0,0.06); 
      background: rgba(255,255,255,0.74); 
      backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); 
    }

    #motoai-typing{ 
      width:0px; 
      height:20px; 
      display:flex; align-items:center; justify-content:center; 
      font-size:14px; color: rgba(0,0,0,0.5);
      transition: width 0.2s ease, margin-right 0.2s ease;
      overflow: hidden; 
    }
    #motoai-typing span{ width:6px; height:6px; background:rgba(0,0,0,0.3); border-radius:50%; margin:0 2px; animation: m10-dot-pulse 1.4s infinite ease-in-out both; }
    #motoai-typing span:nth-child(1){ animation-delay: -0.32s; }
    #motoai-typing span:nth-child(2){ animation-delay: -0.16s; }
    @keyframes m10-dot-pulse {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1.0); }
    }

    #motoai-input{ 
      flex:1; 
      min-width: 0;
      padding:11px 12px; border-radius:16px; 
      border:1px solid rgba(0,0,0,0.08); font-size:15px; 
      background:rgba(255,255,255,0.8); 
    }
    #motoai-send{ 
      background:var(--m10-accent); color:#fff; border:none; 
      border-radius:14px; padding:10px 16px; font-weight:700; 
      cursor:pointer; box-shadow:0 2px 6px rgba(0,0,0,0.12); 
      margin-left: 6px;
    }
    #motoai-send:active{ transform: scale(0.96); }

    #motoai-clear{ position:absolute; top:10px; right:44px; background:none; border:none; font-size:16px; color:#aaa; }

    @media (prefers-color-scheme: dark) {
      #motoai-card{ background: var(--m10-card-bg-dark); }
      #motoai-header{ color:#fff; border-bottom:1px solid rgba(255,255,255,0.08); }
      #motoai-header .tools button{ color: #777; }
      .m-msg.bot{ background: #2c2c2e; color:#eee; }
      #motoai-suggestions{ background: rgba(0,0,0,0.2); border-top:1px solid rgba(255,255,255,0.06); }
      #motoai-suggestions button{ background: rgba(0,122,255,0.2); color:#52adff; }
      #motoai-footer{ background: rgba(0,0,0,0.3); border-top:1px solid rgba(255,255,255,0.08); }
      #motoai-typing span{ background:rgba(255,255,255,0.4); }
      #motoai-input{ background: #2c2c2e; border:1px solid rgba(255,255,255,0.08); color:#fff; }
      #motoai-handle{ background: rgba(100,100,100,0.6); }
      #motoai-clear{ color: #777; }
    }
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    /* ------------- JS LOGIC ------------- */
    const $root = document.getElementById('motoai-root');
    const $bubble = document.getElementById('motoai-bubble');
    const $overlay = document.getElementById('motoai-overlay');
    const $card = document.getElementById('motoai-card');
    const $body = document.getElementById('motoai-body');
    const $suggestions = document.getElementById('motoai-suggestions');
    const $typing = document.getElementById('motoai-typing');
    const $input = document.getElementById('motoai-input');
    const $send = document.getElementById('motoai-send');
    const $clear = document.getElementById('motoai-clear');
    const $close = document.getElementById('motoai-close');

    let corpus = [];
    let chatHistory = [];
    let memory = {};
    let isCardOpen = false;

    // Embedding & similarity
    function generateEmbeddings(text) {
      const vec = new Map();
      const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2);
      for (const word of words) {
        vec.set(word, (vec.get(word) || 0) + 1);
      }
      return vec;
    }
    function dotProduct(vecA, vecB) {
      let dot = 0;
      for (const [key, valA] of vecA) {
        if (vecB.has(key)) {
          dot += valA * vecB.get(key);
        }
      }
      return dot;
    }
    function magnitude(vec) {
      let sum = 0;
      for (const val of vec.values()) {
        sum += val * val;
      }
      return Math.sqrt(sum);
    }
    function cosineSimilarity(vecA, vecB) {
      const magA = magnitude(vecA);
      const magB = magnitude(vecB);
      if (magA === 0 || magB === 0) return 0;
      return dotProduct(vecA, vecB) / (magA * magB);
    }
    function findBestMatch(query) {
      if (!corpus.length) return null;
      const queryVec = generateEmbeddings(query);
      let bestScore = -1;
      let bestMatch = null;
      for (const item of corpus) {
        const itemVec = item.vec || generateEmbeddings(item.text);
        if (!item.vec) item.vec = itemVec;
        const score = cosineSimilarity(queryVec, itemVec);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = item.text;
        }
      }
      if (bestScore > CFG.minScoreThreshold) return bestMatch;
      return null;
    }

    function toggleCard(show) {
      isCardOpen = (typeof show === 'boolean') ? show : !isCardOpen;
      $overlay.classList.toggle('visible', isCardOpen);
      $overlay.setAttribute('aria-hidden', !isCardOpen);
      $card.setAttribute('aria-hidden', !isCardOpen);
      $root.setAttribute('aria-hidden', isCardOpen);
      if (isCardOpen) {
        $input.focus();
        handleViewport();
      } else {
        $overlay.style.paddingBottom = '';
        $card.style.maxHeight = '';
      }
    }

    function setTyping(isTyping) {
      if (isTyping) {
        $typing.innerHTML = '<span></span><span></span><span></span>';
        $typing.style.width = '42px';
        $typing.style.marginRight = '6px';
      } else {
        $typing.innerHTML = '';
        $typing.style.width = '0px';
        $typing.style.marginRight = '0px';
      }
    }

    function autoScroll() {
      $body.scrollTop = $body.scrollHeight;
    }

    function addMessage(sender, text, noSave = false) {
      const msgDiv = document.createElement('div');
      msgDiv.className = `m-msg ${sender}`;
      msgDiv.textContent = text;
      $body.appendChild(msgDiv);
      autoScroll();
      if (!noSave) {
        chatHistory.push({ sender, text });
        saveSession();
      }
    }

    function renderSuggestions() {
      $suggestions.innerHTML = '';
      CFG.suggestionTags.forEach(tag => {
        const btn = document.createElement('button');
        btn.textContent = tag.label;
        btn.dataset.query = tag.q;
        $suggestions.appendChild(btn);
      });
    }

    function loadData() {
      try {
        const mem = localStorage.getItem(CFG.memoryKey);
        if (mem) memory = JSON.parse(mem);

        const session = localStorage.getItem(CFG.sessionKey);
        if (session) {
          chatHistory = JSON.parse(session);
          chatHistory.forEach(msg => addMessage(msg.sender, msg.text, true));
        }

        const storedCorpus = localStorage.getItem(CFG.corpusKey);
        if (storedCorpus) {
          corpus = JSON.parse(storedCorpus);
          if (corpus.length > 0 && !corpus[0].vec) {
            LOG('Re-building vectors for cached corpus...');
            corpus.forEach(item => {
              item.vec = generateEmbeddings(item.text);
            });
          }
        } else {
          buildCorpus();
        }
      } catch(e) {
        console.error('MotoAI: Error loading data', e);
      }
    }

    function saveSession() {
      try {
        localStorage.setItem(CFG.sessionKey, JSON.stringify(chatHistory));
      } catch(e) { console.error('MotoAI: Error saving session', e); }
    }

    function saveMemory() {
      try {
        localStorage.setItem(CFG.memoryKey, JSON.stringify(memory));
      } catch(e) { console.error('MotoAI: Error saving memory', e); }
    }

    function handleClear() {
      chatHistory = [];
      localStorage.removeItem(CFG.sessionKey);
      $body.innerHTML = '';
      const greeting = memory.userName ? `Chào ${memory.userName}! Bạn cần hỗ trợ gì tiếp theo?` : 'Chào bạn! Mình là MotoAI, mình có thể giúp gì cho bạn?';
      addMessage('bot', greeting);
    }

    function buildCorpus() {
      LOG('Building corpus...');
      let textCorpus = [];
      const allText = document.body.innerText;
      const sentences = allText.split(/[\n.!?]+/) || [];
      sentences.forEach(s => {
        const cleanS = s.trim();
        if (cleanS.length > CFG.minSentenceLen && !textCorpus.includes(cleanS)) {
          textCorpus.push(cleanS);
        }
      });
      textCorpus = textCorpus.slice(0, CFG.maxCorpusSentences);
      corpus = textCorpus.map(text => ({
        text: text,
        vec: generateEmbeddings(text)
      }));
      try {
        localStorage.setItem(CFG.corpusKey, JSON.stringify(corpus));
        LOG(`Corpus built and saved (${corpus.length} items).`);
      } catch(e) {
        console.error('MotoAI: Error saving corpus', e);
      }
    }

    function handleMemory(query) {
      const nameMatch = query.match(/(?:tôi là|tên tôi là) ([\p{L} ]+)/iu);
      if (nameMatch && nameMatch[1]) {
        memory.userName = nameMatch[1].trim();
        saveMemory();
        return `Chào ${memory.userName}! Rất vui được gặp bạn. Bạn cần tư vấn về xe gì?`;
      }
      return null;
    }

    function getBotResponse(query) {
      const q = query.toLowerCase();
      const memoryResponse = handleMemory(q);
      if (memoryResponse) return memoryResponse;
      const corpusMatch = findBestMatch(q);
      if (corpusMatch) return corpusMatch;
      if (q.includes('chào') || q.includes('hello')) {
        return memory.userName ? `Chào ${memory.userName}! Bạn cần mình giúp gì?` : 'Chào bạn! Mình là MotoAI, mình có thể giúp gì cho bạn?';
      }
      if (q.includes('cảm ơn') || q.includes('thanks')) {
        return 'Không có gì! Mình giúp được gì nữa không?';
      }
      return 'Xin lỗi, mình chưa hiểu rõ ý bạn lắm. Bạn có thể hỏi về "xe số", "xe ga", "thủ tục mua xe" thử nhé!';
    }

    async function handleUserInput() {
      const query = $input.value.trim();
      if (!query) return;
      addMessage('user', query);
      $input.value = '';
      setTyping(true);
      await new Promise(res => setTimeout(res, 600 + Math.random() * 400));
      const response = getBotResponse(query);
      setTyping(false);
      addMessage('bot', response);
    }

    function handleViewport() {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--m10-vh', `${vh}px`);
      if (isCardOpen && window.visualViewport) {
        const vvp = window.visualViewport;
        const basePadding = 12;
        const keyboardHeight = Math.max(0, window.innerHeight - (vvp.offsetTop + vvp.height));
        $overlay.style.paddingBottom = `${basePadding + keyboardHeight}px`;
        $card.style.maxHeight = `calc(${vvp.height}px - 40px)`;
      } else if (!isCardOpen) {
        $overlay.style.paddingBottom = '';
        $card.style.maxHeight = '';
      }
    }

    function init() {
      $bubble.addEventListener('click', () => toggleCard(true));
      $close.addEventListener('click', () => toggleCard(false));
      $clear.addEventListener('click', handleClear);
      $send.addEventListener('click', handleUserInput);
      $input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleUserInput();
        }
      });

      $overlay.addEventListener('click', (e) => {
        if (e.target === $overlay) toggleCard(false);
      });

      $suggestions.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
          const query = e.target.dataset.query;
          $input.value = query;
          handleUserInput();
        }
      });

      window.addEventListener('resize', handleViewport);
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', handleViewport);
      }
      handleViewport();
      
      renderSuggestions();
      loadData();

      if (chatHistory.length === 0) {
        const greeting = memory.userName ? `Chào ${memory.userName}! Bạn sẵn sàng tìm hiểu về xe chưa?` : '👋 Chào bạn! Mình là MotoAI — hỏi thử “Xe ga”, “Xe số”, “Xe 50cc”, hoặc “Thủ tục” nhé!';
        addMessage('bot', greeting, true);
      }

      LOG('Ready ✅');
    }

    // Auto-init: if DOMContentLoaded already fired then init now, else wait a tick to ensure body computed sizes
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        // Slight delay to ensure layout
        setTimeout(init, 80);
      }, { once: true });
    } else {
      // already ready
      setTimeout(init, 20);
    }

    // End of initMotoAI
  } // function initMotoAI

  // End IIFE
})();
