# Cómo leer el código de Aragón Conecta

El proyecto tiene tres partes: el **navegador** muestra la página y maneja el carrito, el **servidor Express** atiende las peticiones y **MariaDB** guarda las conferencias, los comentarios y las sesiones.

Los comentarios del código explican la responsabilidad de cada archivo, sus funciones y los bloques que conviene leer juntos. Puedes seguir este recorrido para entenderlo o presentarlo en clase.

## 1. Cómo se construye una página

Al visitar una conferencia ocurre lo siguiente:

1. [index.js](../aragon-conecta/index.js) comprueba la conexión con MariaDB y abre el servidor.
2. [app.js](../aragon-conecta/app.js) prepara Express: vistas, archivos públicos, formularios, sesión y rutas.
3. [inicio_router.js](../aragon-conecta/routes/inicio_router.js) relaciona la dirección de la conferencia con su controlador.
4. [inicioController.js](../aragon-conecta/controllers/inicioController.js) busca la conferencia y sus comentarios aprobados.
5. [models/index.js](../aragon-conecta/models/index.js) define los registros que Sequelize consulta en MariaDB.
6. [detalle.ejs](../aragon-conecta/views/detalle.ejs) recibe esos datos y construye el HTML que verá el navegador.

Por ejemplo, el controlador puede pedir una conferencia por su `slug`, como `hello-world`. EJS usa su título, imagen y descripción para completar la plantilla.

## 2. Qué hace cada carpeta

| Carpeta | Explicación sencilla |
| --- | --- |
| `config/` | Reúne las variables de entorno, la conexión a MariaDB y el almacenamiento de sesiones. |
| `routes/` | Decide qué función atiende cada dirección y método HTTP. |
| `controllers/` | Recibe la petición, valida sus datos y prepara la respuesta. |
| `models/` | Define las tablas, columnas y relaciones de la base de datos. |
| `views/` | Contiene las plantillas EJS de las páginas. |
| `views/partials/` | Fragmentos que se reutilizan: encabezado, tarjetas, carrito y pie. |
| `public/` | Archivos que descarga el navegador: CSS, JavaScript, fotos y fuentes. |
| `middleware/` | Comprobaciones que se ejecutan antes de llegar a un controlador. |
| `data/` | Contenido inicial de conferencias y precios de demostración. |
| `scripts/` | Comandos para preparar el entorno, crear tablas y administrar la contraseña. |
| `tests/` | Comprobaciones automáticas del servidor y de la experiencia en el navegador. |

Las rutas de esta tabla parten de `aragon-conecta/`, la carpeta de la aplicación.

## 3. Cómo funciona el carrito

[carrito.js](../aragon-conecta/public/js/carrito.js) maneja tres pantallas dentro de la misma ventana: **carrito → pago simulado → confirmación**.

- `load()` recupera los boletos guardados en el navegador y `normalize()` revisa que sus datos sean válidos.
- `save()` guarda únicamente la conferencia y la cantidad. Los precios vienen del [catálogo de boletos](../aragon-conecta/data/boletos.js).
- `total()` suma precio por cantidad usando centavos enteros. Por ejemplo, dos boletos de $100 son `10000 × 2 = 20000` centavos, que se muestran como $200.00 MXN.
- `render()` actualiza las filas, el contador y el total después de cada cambio.
- `renderPayment()` muestra Visa, Mastercard o PayPal con datos ficticios y el resumen actual.
- `completePurchase()` muestra la confirmación y vacía el carrito después de la espera simulada.

Los atributos HTML `data-*` conectan los botones con el script. Por ejemplo, `data-add-ticket="hello-world"` indica qué conferencia se debe agregar.

El carrito vive en `localStorage`, dentro del navegador de cada persona. El método de pago sólo permanece en memoria durante el uso de la página. La simulación no hace cobros ni crea pedidos en MariaDB.

## 4. Cómo funcionan los comentarios y la administración

El formulario manda nombre, reflexión, consentimiento y token de protección. El servidor revisa los campos y guarda el comentario como **pendiente**. Las páginas públicas consultan sólo los **aprobados**.

[adminController.js](../aragon-conecta/controllers/adminController.js) verifica la contraseña, prepara filtros y permite cambiar el estado o eliminar el comentario. Esto demuestra el **CRUD**:

| Operación | Ejemplo en el proyecto |
| --- | --- |
| Crear | Enviar una reflexión. |
| Leer | Consultar comentarios en una conferencia o en el panel. |
| Actualizar | Aprobar, rechazar o devolver a pendientes. |
| Eliminar | Borrar con confirmación desde administración. |

La sesión del administrador se guarda en MariaDB; una cookie del navegador permite identificarla. El token CSRF es una clave de la sesión que el formulario debe devolver. Las contraseñas se guardan como hashes con bcrypt, una representación protegida de su valor.

## 5. Cómo leer EJS, CSS y JavaScript

| Sintaxis o palabra | Qué significa aquí |
| --- | --- |
| `import` / `export` | Compartir funciones o datos entre archivos JavaScript. |
| `req` / `res` | La petición que llega y la respuesta que se prepara. |
| `next()` | Continuar con el siguiente paso de Express. |
| `async` / `await` | Esperar una tarea, como consultar la base, antes de seguir dentro de esa función. |
| `<%= valor %>` | Escribir un dato en HTML escapando caracteres especiales. Se usa para el texto de visitantes. |
| `<%- include(...) %>` | Insertar el HTML de un fragmento EJS compartido. |
| `<% ... %>` | Ejecutar una condición o un bucle dentro de la plantilla. |
| `<%# ... %>` | Comentario de EJS que no aparece en el HTML de la página. |
| `document.querySelector(...)` | Encontrar un elemento del HTML desde JavaScript. |
| `addEventListener(...)` | Indicar qué hacer al pulsar un botón, escribir o recibir otro evento. |
| `fetch(...)` | Hacer una petición desde el navegador; aquí mejora el envío de comentarios. |
| `var(--brand-primary)` | Reutilizar el color principal definido en CSS. |
| `@media (...)` | Aplicar ajustes según el tamaño de pantalla o preferencias de accesibilidad. |

En [sitio.css](../aragon-conecta/public/css/sitio.css), los comentarios separan encabezado, portada, tarjetas, comentarios, administración, carrito y pago. Las reglas posteriores pueden ajustar las anteriores; por eso también importa el orden del archivo.

En [sitio.js](../aragon-conecta/public/js/sitio.js) están el menú móvil, los carruseles, el visor de imágenes y el envío de reflexiones sin recarga.

## 6. Configuración y pruebas

| Archivo | Para qué sirve |
| --- | --- |
| `.env.example` | Plantilla de variables. `npm run setup` crea el `.env` local con claves nuevas. |
| `compose.yaml` | Define la aplicación y las bases de datos local y de pruebas. |
| `Dockerfile` | Explica cómo construir y arrancar el contenedor de Node.js. |
| `package.json` | Declara dependencias y comandos como `start`, `setup` y `test:all`. |
| `package-lock.json` | Fija versiones concretas para repetir la instalación de dependencias. |
| `nodemon.json` | Indica qué archivos vigilar para reiniciar el servidor durante el desarrollo. |
| `playwright.config.js` | Configura el navegador y el servidor utilizados por las pruebas. |
| `assets/fuentes.json` | Guarda las fuentes y metadatos de los recursos originales. |

Los archivos JSON conservan su formato válido; su función se explica en esta tabla. Los logotipos, las fuentes y las dependencias externas conservan sus archivos originales.

Las pruebas de **integración** llaman a Express y revisan sus respuestas y registros. Las pruebas de **navegador** pulsan botones, llenan formularios y comprueban lo que vería una persona. Usan una base independiente cuyo nombre termina en `_test`.

Consulta los comandos de instalación y pruebas en el [README](../README.md). Para una explicación más técnica de rutas y modelos, continúa con la [guía de implementación](implementacion.md).
