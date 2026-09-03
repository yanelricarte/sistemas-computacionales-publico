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

    // La respuesta aparece recién cuando se agotan los intentos: al errar se
    // marca la opción, se descuenta un intento y se muestra la ayuda que
    // corresponda (data-hint1, data-hint2), sin revelar cuál es la correcta.
    // Con pocas opciones el límite baja solo: cuando queda una sin marcar, esa
    // es la respuesta y no tiene sentido seguir preguntando.
    var INTENTOS = 3;

    document.querySelectorAll('.quiz-q').forEach(function (q) {
      var correctOpt = q.dataset.correct;
      var feedback = q.querySelector('.quiz-feedback') || q.appendChild(document.createElement('p'));
      if (!feedback.className) feedback.className = 'quiz-feedback';
      var explanation = q.dataset.explanation || '';
      var opciones = q.querySelectorAll('.quiz-opt');
      var ayudas = [q.dataset.hint1, q.dataset.hint2, q.dataset.hint3];
      var limite = Math.min(INTENTOS, Math.max(1, opciones.length - 1));
      var errados = 0;

      function cerrar(resultado) {
        q.dataset.answered = '1';
        q.dataset.result = resultado;
        opciones.forEach(function (o) { o.disabled = true; });
        if (finalQuiz && finalQuiz.contains(q)) updateFinalScore();
      }

      opciones.forEach(function (opt) {
        opt.addEventListener('click', function () {
          if (q.dataset.answered) return;

          if (opt.dataset.opt === correctOpt) {
            opt.classList.add('correct');
            feedback.textContent = '✓ ¡Correcto! ' + explanation;
            feedback.style.color = 'var(--ok)';
            cerrar('ok');
            return;
          }

          errados++;
          opt.classList.add('wrong');
          opt.disabled = true;

          if (errados >= limite) {
            var correctEl = q.querySelector('[data-opt="' + correctOpt + '"]');
            if (correctEl) correctEl.classList.add('correct');
            feedback.textContent = '✗ La correcta era la ' + correctOpt + '. ' + explanation;
            feedback.style.color = 'var(--warm)';
            cerrar('wrong');
            return;
          }

          var quedan = limite - errados;
          var ayuda = ayudas[errados - 1] ? ' Pista: ' + ayudas[errados - 1] : '';
          feedback.textContent = '✗ Esa no es.' + ayuda + ' Te ' +
            (quedan === 1 ? 'queda un intento' : 'quedan ' + quedan + ' intentos') +
            ' antes de que aparezca la respuesta.';
          feedback.style.color = 'var(--warm)';
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

  // === Tablas que se apilan en pantallas angostas ===
  // Cada celda se queda con el rótulo de su columna, para que al apilarse
  // siga sabiéndose qué es cada dato. El apilado lo hace el CSS; acá solo
  // se copian los encabezados.
  (function () {
    document.querySelectorAll('table').forEach(function (t) {
      var enc = t.querySelector('thead tr');
      if (!enc) return;
      var titulos = Array.prototype.map.call(enc.children, function (c) {
        return (c.textContent || '').trim();
      });
      t.querySelectorAll('tbody tr').forEach(function (fila) {
        Array.prototype.forEach.call(fila.children, function (celda, i) {
          if (titulos[i]) celda.setAttribute('data-rotulo', titulos[i]);
        });
      });
      t.classList.add('apilable');
    });
  })();

  // === "Completá el código" — escribir con feedback ===
  // Markup: <div class="code-check" data-answer="resp1|resp2" data-hint="...">
  //           <p>consigna…</p>
  //           <div class="code-check-row">
  //             <input class="code-check-input"> <button class="btn code-check-btn">Comprobar</button>
  //           </div>
  //           <div class="code-check-feedback"></div>
  //         </div>
  (function () {
    function norm(s) {
      return (s || '')
        .trim()
        .replace(/\s+/g, ' ')                 // colapsa espacios
        .replace(/[“”‘’"]/g, "'") // unifica comillas a '
        .replace(/;+$/, '')                    // saca ; final
        .replace(/\s*\[\s*/g, '[')             // espacios dentro de [ ]
        .replace(/\s*\]\s*/g, ']');
    }
    document.querySelectorAll('.code-check').forEach(function (cc) {
      var input = cc.querySelector('.code-check-input');
      var btn = cc.querySelector('.code-check-btn');
      var fb = cc.querySelector('.code-check-feedback');
      if (!input || !btn || !fb) return;
      var answers = (cc.getAttribute('data-answer') || '').split('|').map(norm);
      var ayudas = [cc.getAttribute('data-hint1'), cc.getAttribute('data-hint2'),
                    cc.getAttribute('data-hint')].filter(Boolean);
      var INTENTOS = 3;
      var errados = 0, cerrado = false;
      function check() {
        if (cerrado) return;
        var val = norm(input.value);
        if (!val) return;
        if (answers.indexOf(val) !== -1) {
          cerrado = true;
          cc.classList.add('ok');
          cc.classList.remove('bad');
          fb.textContent = '✓ ¡Bien! Lo escribiste correcto.';
          input.disabled = true;
          btn.disabled = true;
          return;
        }
        errados++;
        cc.classList.add('bad');
        cc.classList.remove('ok');
        if (errados >= INTENTOS) {
          cerrado = true;
          fb.textContent = '✗ Se escribe así: ' + (cc.getAttribute('data-answer') || '').split('|')[0];
          input.disabled = true;
          btn.disabled = true;
          return;
        }
        var quedan = INTENTOS - errados;
        var ayuda = ayudas[errados - 1] ? ' Pista: ' + ayudas[errados - 1] : '';
        fb.textContent = '✗ Todavía no.' + ayuda + ' Te ' +
          (quedan === 1 ? 'queda un intento' : 'quedan ' + quedan + ' intentos') +
          ' antes de que aparezca la respuesta.';
      }
      btn.addEventListener('click', check);
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); check(); }
      });
    });
  })();
})();
