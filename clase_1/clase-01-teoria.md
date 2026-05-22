# Clase 1 — Introducción a los sistemas informáticos y primer formulario en PHP

**Materia:** Proyecto, Diseño e Implementación de Sistemas Computacionales
**Curso:** 7.º año

> Material de consulta y repaso de la primera clase. Si te perdiste algo, si querés revisar antes de hacer el TP o si necesitás los conceptos para resolver una duda, está todo acá.

---

## 1. ¿De qué se trata esta materia?

El nombre completo no es decorativo. Cada palabra significa algo.

- **Proyecto.** Durante el año vamos a construir **una sola cosa**, sostenida en el tiempo, con principio y final. No son ejercicios sueltos: es un trabajo que arrancamos en mayo y entregamos en noviembre.
- **Diseño.** Antes de programar, vamos a pensar. Qué hace el sistema, quién lo usa, qué datos guarda, qué reglas tiene. **La parte más difícil de programar no es escribir código: es decidir qué código hay que escribir.**
- **Implementación.** No alcanza con que esté pensado en una carpeta o en un PowerPoint. Tiene que funcionar.

> **Programar** es escribir instrucciones para una computadora.
> **Construir un sistema** es resolver el problema real de alguien usando esas instrucciones.
> Son dos cosas distintas.

---

## 2. ¿Qué es un sistema informático?

Un sistema informático es un conjunto de **cinco partes** que trabajan juntas:

```
              USUARIO
                 |
                 v
   ENTRADA  →  PROCESO  →  SALIDA
                 |
                 v
             ALMACEN
```

| Parte | Qué es | Ejemplo |
|---|---|---|
| **Usuario** | Quien usa el sistema. Tiene un **rol concreto**. | El kiosquero no hace lo mismo que el alumno que compra. |
| **Entrada** | Por dónde los datos entran al sistema. | Formulario, código de barras, sensor, archivo Excel. |
| **Proceso** | Lo que el sistema **hace**: valida, calcula, aplica reglas. | "¿El DNI tiene 8 dígitos?", "¿el total con descuento es...?" |
| **Almacenamiento** | Dónde el sistema **guarda** los datos. | Una base de datos, un archivo. |
| **Salida** | Lo que el sistema **devuelve**. | Pantalla, reporte, comprobante. |

### Ejemplo: cajero automático

| Parte | Concretamente |
|---|---|
| Usuario | Cliente del banco con tarjeta + PIN |
| Entrada | Tarjeta, PIN, monto solicitado |
| Proceso | ¿PIN correcto? ¿hay saldo? ¿supera el límite? ¿hay billetes? |
| Almacenamiento | Cuenta del cliente, registro de operaciones |
| Salida | Billetes + comprobante + saldo en pantalla |

---

## 3. Página vs sistema

| Página | Sistema |
|---|---|
| Muestra información | **Gestiona** información |
| Pasiva: la mirás | Activa: hace cosas |
| Si la cerrás, no pasa nada | Recuerda lo que hiciste |
| No tiene reglas | Tiene reglas |

Lo que vamos a construir este año es un **sistema**, no una página.

---

## 4. Cliente y servidor

```
NAVEGADOR              SERVIDOR

 index.php
+----------+
|formulario|--- POST --> procesar.php
|[ENVIAR]  |             recibe $_POST
+----------+             valida
                         arma respuesta
+----------+                  |
| resultado| <-- HTML --------+
+----------+
```

- **Cliente** = tu navegador. Ve HTML, CSS y ejecuta JavaScript. Cualquiera puede inspeccionar el código apretando F12.
- **Servidor** = computadora remota que ejecuta PHP y manda solo el resultado. El código PHP nunca se ve.

Por eso PHP sirve para guardar contraseñas, conectarse a base de datos, hacer cálculos sensibles.

---

## 5. GET vs POST

- **GET:** datos en la URL (`?q=...`). Para búsquedas. Nunca para contraseñas.
- **POST:** datos ocultos en el cuerpo de la petición. Para enviar formularios, guardar datos, contraseñas.

> **GET = buscar. POST = enviar.** Hoy todos usamos POST.

---

## 6. Estructura PHP profesional

```
clase01/
├── index.php          ← formulario
├── procesar.php       ← recibe y procesa
├── includes/
│   ├── cabecera.php   ← <head>, navbar, apertura de <body>
│   └── pie.php        ← cierre, scripts de Bootstrap
└── css/
    └── estilos.css    ← estilos propios
```

¿Por qué separar cabecera y pie? Porque tanto `index.php` como `procesar.php` van a tener el mismo `<head>`, navbar, footer. Si los escribimos dos veces, cuando los queramos cambiar hay que hacerlo en dos lugares. Si los incluimos con `include`, se cambian una vez y se actualizan en todas las páginas.

> **Primera regla de un sistema:** no repetir código (DRY — Don't Repeat Yourself).

```php
<?php include 'includes/cabecera.php'; ?>

<h1>Contenido propio de esta página</h1>

<?php include 'includes/pie.php'; ?>
```

---

## 7. PHP y HTML en un mismo archivo: los delimitadores

PHP y HTML pueden convivir en el mismo archivo. El servidor (Apache con PHP) lee el archivo de arriba a abajo. Cuando encuentra la marca `<?php`, **entra en modo PHP** e interpreta todo lo que sigue como código. Cuando encuentra `?>`, **vuelve a modo HTML** y el resto se envía tal cual al navegador.

```
<!DOCTYPE html>
<html>
<body>
  <h1>Hola <?php echo "mundo"; ?> acá estamos</h1>
</body>
</html>
```
En la línea de arriba el servidor:
1. Envía `<h1>Hola ` como HTML, 
2. entra a `<?php`, ejecuta `echo "mundo";` e imprime `mundo`,
3. encuentra `?>`, sale de PHP,
4. envía ` acá estamos</h1>` como HTML.

> **Regla:** cada vez que abrís `<?php` el servidor cambia a "modo código". Cada vez que cerrás con `?>` vuelve a "modo HTML". Podés abrir y cerrar cuantas veces sea necesario en un mismo archivo.

Hay dos formas de abrir PHP:

| Marca | Significa |
|---|---|
| `<?php ... ?>` | Bloque de código PHP estándar |
| `<?= ... ?>` | Forma corta de `<?php echo ... ?>` (imprime directo) |

---

## 8. Patrón mínimo de `procesar.php`

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
  <h1>Hola <?= $nombre ?>, tu inscripción fue registrada</h1>
</body>
</html>
```

### Línea por línea

- **`$_POST['nombre'] ?? ''`**: agarra el valor del campo `nombre`. Si no vino, usa `''` por defecto. El `??` es el "operador de coalescencia nula".
- **`if ($nombre == '' || $dni == '') { ... exit; }`**: si algún campo está vacío, mensaje + cortar ejecución.
- **`<?= $nombre ?>`**: forma corta de `<?php echo $nombre; ?>`.

---

## 9. Errores frecuentes

- **El formulario no envía nada** → falta `method="POST"` o `name="..."` en los inputs. Debugear con `var_dump($_POST)`.
- **`action=""`** → significa "enviar al mismo archivo". Mejor explícito: `action="procesar.php"`.
- **`$_GET` en vez de `$_POST`** → revisar `method` del formulario.
- **PHP es case-sensitive** → `$_POST['Nombre']` ≠ `$_POST['nombre']`.
- **Olvidar el `;`** → Parse error.
- **No usar `include`** → terminás repitiendo el `<head>` y `<body>` en cada archivo.

---

## 10. Glosario

| Palabra | Definición |
|---|---|
| **Formulario** | Un `<form>` en HTML. |
| **Servidor** | La computadora donde corre PHP. |
| **Cliente** | El navegador del usuario. |
| `$_POST` | Variable donde llegan los datos enviados por POST. |
| `$_GET` | Variable donde llegan los datos enviados por GET. |
| `include` | Incluye el contenido de otro archivo PHP. |
| `echo` | Imprime algo en la página. |
| `exit` | Corta la ejecución del archivo en ese punto. |
| `var_dump()` | Muestra contenido y tipo de una variable. |
| `??` | Operador de coalescencia nula. |
| `<?= ?>` | Forma corta de `<?php echo ... ?>`. |
| **Validar** | Verificar que un dato sea correcto antes de usarlo. |

---

## 11. Buenas prácticas

1. **Siempre validar** lo que viene de `$_POST`.
2. **Usar `include`** para no repetir cabecera y pie.
3. **Separar HTML de PHP** cuando se pueda. Usar `<?= ?>`.
4. **Nombres con sentido.** No usar `$x`, usar `$nombre`, `$dniCliente`.
5. **Indentar.** Hace falta para leer el código después.

---

## 12. Para profundizar

- PHP — Manual oficial en español: https://www.php.net/manual/es/
- MDN Web Docs — Formularios HTML: https://developer.mozilla.org/es/docs/Learn/Forms
- Bootstrap: https://getbootstrap.com/

---

## 13. Próximos pasos

[**→ TP Clase 1: Formulario de inscripción**](clase-01-tp-formulario.md)

---

[← Volver a Bienvenida](README.md)
