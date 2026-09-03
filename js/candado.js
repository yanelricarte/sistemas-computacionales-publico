/* ============================================================
   El código de la clase.

   Las resoluciones de la página viajan cifradas: al repo público va el
   cifrado, y el código que abre lo dice la docente cuando el grupo pone en
   común. El cifrado lo hace cripto.js (PBKDF2-HMAC-SHA-256 con sal y una
   etiqueta que verifica), así que conocer una resolución no dice nada del
   código y probar códigos cuesta las iteraciones completas.

   Markup que espera:

     <div class="candado" data-paquete="SOLUCIONES_CLASE8"></div>

     <div class="cerrado" data-sol="c3">
       <p class="cerrado-aviso">Se abre con el código de la clase.</p>
       <pre class="cerrado-texto"><code></code></pre>
     </div>

   El paquete lo genera el repo docente con _cifrar-soluciones.js.
   ============================================================ */
(function () {
  "use strict";

  var zona = document.querySelector(".candado");
  if (!zona || typeof Cripto === "undefined") return;

  var paquete = window[zona.dataset.paquete || ""];
  if (!paquete || !paquete.items) return;

  var cerrados = Array.prototype.slice.call(document.querySelectorAll("[data-sol]"));
  if (!cerrados.length) return;

  var LLAVE = "sc-codigo:" + location.pathname.replace(/^.*\/([^/]+\/[^/]+)$/, "$1");

  function derivarDe(codigo) {
    try { return Cripto.derivar(codigo, paquete.sal, paquete.iteraciones); } catch (e) { return null; }
  }

  /* la clave derivada se guarda, no el código: volver a la página no cuesta el segundo de PBKDF2 */
  function guardada() {
    try {
      var s = localStorage.getItem(LLAVE);
      return s ? Cripto.b64aBytes(s) : null;
    } catch (e) { return null; }
  }
  function guardar(bytes) {
    try { localStorage.setItem(LLAVE, Cripto.bytesAb64(bytes)); } catch (e) {}
  }

  function abre(derivada) {
    var alguno = cerrados[0].dataset.sol;
    return paquete.items[alguno] && Cripto.abrir(derivada, paquete.items[alguno]) !== null;
  }

  function destrabar(derivada) {
    cerrados.forEach(function (caja) {
      var item = paquete.items[caja.dataset.sol];
      if (!item) return;
      var texto = Cripto.abrir(derivada, item);
      if (texto === null) return;
      var destino = caja.querySelector("code") || caja.querySelector(".cerrado-texto") || caja;
      destino.textContent = texto;
      caja.classList.add("abierto");
      var aviso = caja.querySelector(".cerrado-aviso");
      if (aviso) aviso.remove();
    });
    zona.classList.add("abierto");
    zona.classList.remove("cerrado");
  }

  /* ---------- la barra de la página ---------- */

  var texto = document.createElement("p");
  texto.className = "candado-t";
  texto.innerHTML = "<b>Las resoluciones están cerradas con el código de la clase.</b> " +
    "Las comprobaciones y las actividades se hacen igual sin él: lo que abre es la resolución ya escrita.";

  var fila = document.createElement("div");
  fila.className = "candado-fila";

  var entrada = document.createElement("input");
  entrada.type = "text";
  entrada.className = "candado-input";
  entrada.placeholder = "código de la clase";
  entrada.setAttribute("aria-label", "Código de la clase");

  var boton = document.createElement("button");
  boton.type = "button";
  boton.className = "btn candado-btn";
  boton.textContent = "Destrabar";

  var estado = document.createElement("span");
  estado.className = "candado-estado";
  estado.setAttribute("aria-live", "polite");

  fila.appendChild(entrada);
  fila.appendChild(boton);
  fila.appendChild(estado);
  zona.appendChild(texto);
  zona.appendChild(fila);

  function abierto() {
    estado.textContent = "✓ Destrabado";
    entrada.value = "";
    entrada.disabled = true;
    boton.disabled = true;
  }

  boton.addEventListener("click", function () {
    var codigo = entrada.value.trim();
    if (!codigo) return;
    estado.textContent = "Abriendo…";
    boton.disabled = true;
    /* la derivación bloquea alrededor de un segundo: primero se pinta el aviso */
    setTimeout(function () {
      var derivada = derivarDe(codigo);
      if (derivada && abre(derivada)) {
        guardar(derivada);
        destrabar(derivada);
        abierto();
      } else {
        estado.textContent = "✗ Ese código no abre";
        zona.classList.add("cerrado");
        boton.disabled = false;
      }
    }, 30);
  });

  entrada.addEventListener("keydown", function (e) {
    if (e.key === "Enter") boton.click();
  });

  var previa = guardada();
  if (previa && abre(previa)) { destrabar(previa); abierto(); }
})();
