# Clase 1 — TP: Formulario de inscripción al proyecto


**Materia:** Proyecto, Diseño e Implementación de Sistemas Computacionales
**Curso:** 7.º año
**Tiempo de trabajo en clase:** 70 minutos

---

## Consigna

Construir una mini-aplicación PHP que simule la inscripción de un estudiante al proyecto anual. **Sin base de datos:** los datos se procesan en memoria y se pierden al cerrar el navegador.

---

## Obligatorio

### 1. Estructura de carpetas

```
clase01/
├── index.php
├── procesar.php
├── includes/
│   ├── cabecera.php
│   └── pie.php
└── css/
    └── estilos.css
```

### 2. `index.php` — formulario

Debe mostrar un formulario con:

- **Nombre y apellido** (texto)
- **DNI** (texto)
- **Curso y división** (texto)
- **Idea de proyecto** (textarea)
- **Tecnologías que ya conocés** (checkbox múltiple): HTML, CSS, JS, PHP, MySQL, Git, otra

Envía por **POST** a `procesar.php`.

### 3. `procesar.php` — procesamiento

Debe:

- Validar que ningún campo obligatorio esté vacío.
- Mostrar los datos recibidos en una tabla clara.
- Mostrar mensaje: `Hola {nombre}, tu propuesta "{idea}" fue registrada.`
- Incluir `cabecera.php` y `pie.php` con `include`.
- Aplicar Bootstrap por CDN.

---

## Opcional (si terminás antes)

- Validar que el **DNI sea solo números** (`is_numeric` o `ctype_digit`).
- Si falta algún campo, **volver a index.php** con mensaje de error.
- Contador de inscripciones con `$_SESSION`.

---

## Reglas

- **Trabajo individual**, cada estudiante en su PC.
- Documentación oficial: https://www.php.net/manual/es/
- Pueden consultar a un compañero, pero cada uno entrega su carpeta.
- No copiar y pegar soluciones de internet sin entenderlas.
- Si traés código que funciona pero no podés explicar, esa solución no cuenta.

---

## Qué se observa

| Aspecto | Qué se mira |
|---|---|
| Organización | Respeta la estructura de carpetas |
| Flujo PHP | Comprende el ciclo index → POST → procesar |
| Sintaxis | Usa `=` y `==` correctamente, cierra con `;` |
| Validación | Valida los datos antes de usarlos |
| Inclusión | Usa `include`/`require` para no repetir código |
| Autonomía | Resuelve solo, pregunta con criterio o se traba |
| Higiene | Indenta, nombra con sentido, separa HTML de PHP |

---

## Patrón mínimo de `procesar.php` (referencia)

```php
<?php
  $nombre = $_POST['nombre'] ?? '';
  $dni    = $_POST['dni']    ?? '';

  if ($nombre == '' || $dni == '') {
     echo "Faltan datos";
     exit;
  }
?>
<!DOCTYPE html>
<html>
<body>
  <h1>Hola <?= $nombre ?>, tu inscripcion fue registrada</h1>
</body>
</html>
```

**Importante:** este es el mínimo. El TP pide expandirlo con más campos, validaciones, include de cabecera y pie, y Bootstrap.

---

¿Dudas con los conceptos? Mirá el [soporte teórico de la Clase 1](clase-01-teoria.md).

[← Volver a Bienvenida](README.md)
