(function () {
  'use strict';

  // === Syntax highlighting (si highlight.js está cargado vía CDN) ===
  if (window.hljs) {
    try { window.hljs.highlightAll(); } catch (e) { /* sin resaltado: el código igual se ve oscuro y legible */ }
  }

  // === Recorte en iframe ===
  if (window.self !== window.top) {
    const hash = window.location.hash.substring(1);
    if (hash) {
      const start = document.getElementById(hash);
      if (start) {
        const params = new URLSearchParams(window.location.search);
        const toId = params.get('to');
        const visible = new Set();
        let current = start;
        let endReached = false;
        while (current && !endReached) {
          visible.add(current);
          const next = current.nextElementSibling;
          if (next && next.tagName === 'H2') {
            if (!toId) {
              endReached = true;
            } else if (current.id === toId) {
              endReached = true;
            }
          }
          current = next;
        }
        document.querySelectorAll('.theme-controls, .scroll-top, #progress, .hero, nav.toc, .footer-nav, .nav')
          .forEach(function (el) { el.style.display = 'none'; });
        Array.from(document.body.children).forEach(function (el) {
          if (el.tagName === 'SCRIPT') return;
          if (visible.has(el)) return;
          el.style.display = 'none';
        });
        document.body.style.padding = '12px 20px 20px';
        document.body.style.maxWidth = 'none';
        document.body.style.margin = '0';
      }
    }
  }

  // === Theme controls (dark + big) ===
  (function () {
    var STORAGE = { dark: 'estudiantes-dark', big: 'estudiantes-big' };
    var body = document.body;
    var dark = document.getElementById('toggleDark');
    var big  = document.getElementById('toggleBig');

    if (!dark || !big) return;

    if (localStorage.getItem(STORAGE.dark) === '1') body.classList.add('dark');
    if (localStorage.getItem(STORAGE.big)  === '1') body.classList.add('big');

    function syncDark() {
      var on = body.classList.contains('dark');
      dark.textContent = on ? '☀️' : '🌙';
      dark.setAttribute('aria-pressed', on);
    }
    function syncBig() {
      var on = body.classList.contains('big');
      big.textContent = on ? 'A−' : 'A+';
      big.setAttribute('aria-pressed', on);
    }
    syncDark(); syncBig();

    dark.addEventListener('click', function () {
      body.classList.toggle('dark');
      localStorage.setItem(STORAGE.dark, body.classList.contains('dark') ? '1' : '0');
      syncDark();
    });
    big.addEventListener('click', function () {
      body.classList.toggle('big');
      localStorage.setItem(STORAGE.big, body.classList.contains('big') ? '1' : '0');
      syncBig();
    });
    document.addEventListener('keydown', function (e) {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.key === 'd' || e.key === 'D') dark.click();
      if (e.key === '+' || e.key === '=') big.click();
    });
  })();

  // === Volver arriba ===
  (function () {
    var btn = document.getElementById('scrollTop');
    if (!btn) return;
    function toggle() { btn.classList.toggle('visible', window.scrollY > 400); }
    window.addEventListener('scroll', toggle, { passive: true });
    toggle();
    btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  })();

  // === Barra de progreso de lectura ===
  (function () {
    var progress = document.getElementById('progress');
    if (!progress) return;
    window.addEventListener('scroll', function () {
      var h = document.documentElement;
      progress.style.width = ((h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100) + '%';
    });
  })();

  // === Botones "Copiar" en bloques de código ===
  (function () {
    function addCopy(wrap) {
      if (wrap.querySelector(':scope > .copy-btn')) return; // idempotente
      var btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.type = 'button';
      btn.textContent = 'Copiar';
      btn.setAttribute('aria-label', 'Copiar código');
      btn.addEventListener('click', function () {
        var code = wrap.querySelector('pre');
        if (!code) return;
        try {
          navigator.clipboard.writeText(code.textContent).then(function () {
            btn.textContent = '✓ Copiado'; btn.classList.add('ok');
            setTimeout(function () { btn.textContent = 'Copiar'; btn.classList.remove('ok'); }, 1500);
          }, function () { btn.textContent = 'Error'; });
        } catch (e) { btn.textContent = 'Error'; }
      });
      wrap.appendChild(btn);
    }
    // Bloques ya envueltos en .code-wrap
    document.querySelectorAll('.code-wrap').forEach(addCopy);
    // <pre> sueltos: los envolvemos para que también tengan botón "Copiar"
    document.querySelectorAll('pre').forEach(function (pre) {
      if (pre.closest('.code-wrap')) return;
      var wrap = document.createElement('div');
      wrap.className = 'code-wrap';
      pre.parentNode.insertBefore(wrap, pre);
      wrap.appendChild(pre);
      addCopy(wrap);
    });
  })();

  // === Checklist de autoverificación (recuerda lo tildado en el navegador) ===
  (function () {
    document.querySelectorAll('.selfcheck').forEach(function (list) {
      var key = 'estudiantes-check-' + (list.dataset.key || location.pathname);
      var saved = {};
      try { saved = JSON.parse(localStorage.getItem(key) || '{}'); } catch (e) {}
      var boxes = list.querySelectorAll('input[type="checkbox"]');
      var counter = list.querySelector('.selfcheck-count');
      function update() {
        var done = list.querySelectorAll('input[type="checkbox"]:checked').length;
        if (counter) counter.textContent = done + ' / ' + boxes.length;
        list.classList.toggle('all-done', boxes.length > 0 && done === boxes.length);
      }
      boxes.forEach(function (box, i) {
        if (!box.id) box.id = (list.dataset.key || 'chk') + '-' + i;
        if (saved[box.id]) box.checked = true;
        box.addEventListener('change', function () {
          saved[box.id] = box.checked;
          try { localStorage.setItem(key, JSON.stringify(saved)); } catch (e) {}
          update();
        });
      });
      update();
    });
  })();

  // === Quiz handler ===
  (function () {
    var finalQuiz = document.getElementById('quiz-final');
    var finalScore = document.getElementById('quiz-score');

    function updateFinalScore() {
      if (!finalQuiz || !finalScore) return;
      var finalQs = finalQuiz.querySelectorAll('.quiz-q');
      var answered = finalQuiz.querySelectorAll('.quiz-q[data-answered="1"]');
      var correctCount = finalQuiz.querySelectorAll('.quiz-q[data-result="ok"]');
      if (answered.length === finalQs.length) {
        var msg = 'Resultado: ' + correctCount.length + ' de ' + answered.length + '. ';
        if (correctCount.length === answered.length) msg += '¡Todo perfecto!';
        else if (correctCount.length >= 3) msg += 'Bien. Repasá lo que no salió.';
        else msg += 'Releé las secciones marcadas en las explicaciones.';
        finalScore.textContent = msg;
      } else if (answered.length > 0) {
        finalScore.textContent = 'Respondidas: ' + answered.length + ' / ' + finalQs.length;
      }
    }

    document.querySelectorAll('.quiz-q').forEach(function (q) {
      var correctOpt = q.dataset.correct;
      var feedback = q.querySelector('.quiz-feedback');
      var explanation = q.dataset.explanation || '';
      q.querySelectorAll('.quiz-opt').forEach(function (opt) {
        opt.addEventListener('click', function () {
          if (q.dataset.answered) return;
          q.dataset.answered = '1';
          if (opt.dataset.opt === correctOpt) {
            q.dataset.result = 'ok';
            opt.classList.add('correct');
            feedback.textContent = '✓ ¡Correcto! ' + explanation;
            feedback.style.color = 'var(--ok)';
          } else {
            q.dataset.result = 'wrong';
            opt.classList.add('wrong');
            var correctEl = q.querySelector('[data-opt="' + correctOpt + '"]');
            if (correctEl) correctEl.classList.add('correct');
            feedback.textContent = '✗ La correcta era la ' + correctOpt + '. ' + explanation;
            feedback.style.color = 'var(--warm)';
          }
          if (finalQuiz && finalQuiz.contains(q)) updateFinalScore();
        });
      });
    });

    // Reset del quiz final
    var resetBtn = document.getElementById('quiz-reset');
    if (resetBtn && finalQuiz) {
      var total = finalQuiz.querySelectorAll('.quiz-q').length;
      function checkComplete() {
        var answeredCount = finalQuiz.querySelectorAll('.quiz-q[data-answered="1"]').length;
        resetBtn.style.display = (answeredCount === total) ? 'inline-block' : 'none';
      }
      finalQuiz.querySelectorAll('.quiz-opt').forEach(function (b) {
        b.addEventListener('click', function () { setTimeout(checkComplete, 10); });
      });
      resetBtn.addEventListener('click', function () {
        window.location.hash = '#quiz';
        window.location.reload();
      });
    }
  })();
})();
