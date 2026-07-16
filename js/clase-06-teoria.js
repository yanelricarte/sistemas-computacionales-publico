/* Interactividad de la Teoría de Clase 6:
   1) Autoevaluación conceptual (.ceval) — hasta 3 intentos por pregunta.
   2) Actividad de mapa conceptual (.cm) — arrastre + tocar-y-colocar (Pointer Events, cross-device). */

// === 1) Autoevaluación conceptual (3 intentos) ===
(function () {
  document.querySelectorAll('#ceval .ceval-q').forEach(function (q) {
    var correct = q.dataset.correct;
    var hint = q.dataset.hint || '';
    var exp = q.dataset.exp || '';
    var fb = q.querySelector('.ceval-feedback');
    var opts = q.querySelectorAll('.ceval-opt');
    var tries = 0, done = false;
    opts.forEach(function (opt) {
      opt.addEventListener('click', function () {
        if (done || opt.disabled) return;
        if (opt.dataset.opt === correct) {
          done = true;
          opt.classList.add('correct');
          fb.textContent = '✓ ¡Correcto! ' + exp;
          fb.style.color = 'var(--ok, #1a9e5e)';
          opts.forEach(function (o) { o.disabled = true; });
        } else {
          tries++;
          opt.classList.add('wrong');
          opt.disabled = true;
          if (tries >= 3) {
            done = true;
            var c = q.querySelector('.ceval-opt[data-opt="' + correct + '"]');
            if (c) c.classList.add('correct');
            fb.textContent = '✗ Respuesta: la opción ' + correct + '. ' + exp;
            fb.style.color = 'var(--warm, #d1662b)';
            opts.forEach(function (o) { o.disabled = true; });
          } else {
            fb.textContent = 'Intento ' + tries + ' de 3. ' + (hint ? 'Pista: ' + hint : 'Probá de nuevo.');
            fb.style.color = 'var(--warm, #d1662b)';
          }
        }
      });
    });
  });
})();

// === 2) Mapa conceptual: arrastre (Pointer Events) + tocar-y-colocar ===
(function () {
  var pool = document.getElementById('cmPool');
  var map = document.getElementById('cmMap');
  if (!pool || !map) return;
  var slots = Array.prototype.slice.call(map.querySelectorAll('.cm-slot'));
  var dragEl = null, clone = null, origin = null, startX = 0, startY = 0, dragging = false, selected = null;

  var countEl = document.getElementById('cmCount');
  function refresh(slot) {
    var chip = slot.querySelector('.cm-chip');
    var hint = slot.querySelector('.cm-hint');
    if (hint) hint.style.display = chip ? 'none' : '';
    slot.classList.toggle('filled', !!chip);
  }
  function updateCount() {
    var placed = map.querySelectorAll('.cm-slot .cm-chip').length;
    if (countEl) countEl.textContent = placed + ' / ' + slots.length + ' ubicados';
  }
  function clearOver() { slots.forEach(function (s) { s.classList.remove('over'); }); }
  function slotUnder(x, y) {
    var el = document.elementFromPoint(x, y);
    return el ? el.closest('.cm-slot') : null;
  }
  function select(chip) {
    if (selected) selected.classList.remove('sel');
    selected = chip;
    if (chip) chip.classList.add('sel');
  }
  function placeInto(chip, target) {
    var existing = target.querySelector('.cm-chip');
    if (existing && existing !== chip) pool.appendChild(existing);
    var from = chip.parentNode;
    target.appendChild(chip);
    target.classList.remove('ok', 'bad');
    refresh(target);
    if (from && from.classList && from.classList.contains('cm-slot')) {
      from.classList.remove('ok', 'bad');
      refresh(from);
    }
    updateCount();
  }
  function startDrag() {
    dragging = true;
    select(null);
    dragEl.classList.add('dragging');
    clone = dragEl.cloneNode(true);
    clone.className = 'cm-drag-clone';
    document.body.appendChild(clone);
  }
  function onDown(e) {
    var chip = e.target.closest('.cm-chip');
    if (!chip) return;
    dragEl = chip; origin = chip.parentNode;
    startX = e.clientX; startY = e.clientY; dragging = false;
    try { chip.setPointerCapture(e.pointerId); } catch (err) {}
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    e.preventDefault();
  }
  function onMove(e) {
    if (!dragEl) return;
    if (!dragging) {
      if (Math.abs(e.clientX - startX) > 6 || Math.abs(e.clientY - startY) > 6) startDrag();
      else return;
    }
    clone.style.left = (e.clientX - 24) + 'px';
    clone.style.top = (e.clientY - 46) + 'px';
    clearOver();
    var s = slotUnder(e.clientX, e.clientY);
    if (s) s.classList.add('over');
    e.preventDefault();
  }
  function onUp(e) {
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerup', onUp);
    if (dragging) {
      var target = slotUnder(e.clientX, e.clientY);
      if (target) placeInto(dragEl, target);
      else {
        var from = dragEl.parentNode;
        pool.appendChild(dragEl);
        if (from && from.classList && from.classList.contains('cm-slot')) { from.classList.remove('ok', 'bad'); refresh(from); }
      }
      dragEl.classList.remove('dragging');
      if (clone) { clone.remove(); clone = null; }
      clearOver();
      updateCount();
    } else if (dragEl) {
      if (selected === dragEl) select(null); else select(dragEl);
    }
    dragEl = null; dragging = false;
  }
  pool.addEventListener('pointerdown', onDown);
  map.addEventListener('pointerdown', onDown);
  slots.forEach(function (s) {
    s.addEventListener('click', function (e) {
      if (e.target.closest('.cm-chip')) return;
      if (selected) { placeInto(selected, s); select(null); }
    });
  });
  pool.addEventListener('click', function (e) {
    if (selected && !e.target.closest('.cm-chip')) { pool.appendChild(selected); select(null); updateCount(); }
  });

  var msg = document.getElementById('cmMsg');
  document.getElementById('cmCheck').addEventListener('click', function () {
    var ok = 0, placed = 0, total = slots.length;
    slots.forEach(function (s) {
      s.classList.remove('ok', 'bad');
      var chip = s.querySelector('.cm-chip');
      if (!chip) return;
      placed++;
      if (chip.dataset.c === s.dataset.a) { s.classList.add('ok'); ok++; }
      else s.classList.add('bad');
    });
    if (placed < total) { msg.textContent = 'Ubicá los ' + total + ' conceptos antes de verificar (' + placed + '/' + total + ').'; msg.style.color = 'var(--warm)'; }
    else if (ok === total) { msg.textContent = '✓ ¡Mapa correcto! ' + ok + '/' + total + '.'; msg.style.color = 'var(--ok)'; }
    else { msg.textContent = ok + '/' + total + ' bien ubicados. Revisá los marcados en naranja y reintentá.'; msg.style.color = 'var(--warm)'; }
  });
  document.getElementById('cmReset').addEventListener('click', function () {
    select(null);
    map.querySelectorAll('.cm-chip').forEach(function (c) { pool.appendChild(c); });
    slots.forEach(function (s) { s.classList.remove('ok', 'bad', 'over'); refresh(s); });
    msg.textContent = '';
    updateCount();
  });
  updateCount();
})();
