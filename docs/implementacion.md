# Guía de implementación y entrega

## Arquitectura

La petición llega a Express, pasa por los encabezados de seguridad, el análisis de formularios/JSON, la sesión y la validación CSRF. El router público o el privado selecciona un controlador. Los controladores consultan modelos Sequelize en MariaDB y renderizan EJS o devuelven JSON.

La aplicación está en `aragon-conecta/`, separada en `config`, `routes`, `controllers`, `middleware`, `models`, `views`, `public`, `data`, `scripts` y `tests`. `app.js` construye Express sin abrir puertos; `index.js` valida la conexión e inicia el servidor. Esto permite probar la aplicación con una base independiente.

## Correspondencia con los PDF

| Material del curso | Implementación |
| --- | --- |
| Creación de un proyecto en Nodejs | ES modules, npm, Express, nodemon, rutas, controladores y contenido estático. |
| Request_Response_Json | `express.json`, respuestas JSON, validaciones, códigos HTTP y bcrypt para el administrador. |
| Formulario_Sequelize_MariaDB | EJS, formularios POST, dotenv, Sequelize y conexión a MariaDB con variables `BD_*`. |
| CRUD_Persona | Operaciones CRUD aplicadas a comentarios: creación pública, consulta, cambio de estado y eliminación privada; asociaciones y `method-override`. |

Bootstrap se sirve localmente desde la distribución instalada, con una hoja propia que aplica la identidad de Aragón. No se emplean React, Tailwind ni un proceso de compilación para las vistas.

## Carrito y compra simulada

Los precios de ejemplo viven en `aragon-conecta/data/boletos.js`: AWS 25000, Dr. Omar 15000 y Hello World 10000 centavos de MXN. El módulo toma nombres e imágenes del contenido editorial y ofrece un catálogo común a las vistas y al navegador mediante un atributo EJS escapado. Los importes se calculan con enteros y se formatean en pesos mexicanos.

El carrito está implementado con JavaScript nativo y un diálogo lateral accesible. `localStorage` guarda únicamente una lista de `{ slug, cantidad }` bajo `aragon-conecta:carrito:v1`; las cantidades van de 1 a 99. Los precios y nombres siempre se obtienen del catálogo actual. Se descartan entradas desconocidas o inválidas, se agrupan duplicados y se recupera una selección vacía ante JSON corrupto. Si el almacenamiento está bloqueado, el carrito funciona en memoria durante esa página. Las pestañas del mismo navegador sincronizan los cambios mediante el evento `storage`.

La confirmación muestra un resumen y vacía el carrito. No realiza cobros, reservas, emisiones de boletos ni solicitudes de escritura al servidor. No se añadieron tablas de pedidos ni nuevas rutas/API. Las fechas y los materiales se conservan como referencia de los eventos originales, y el precio se identifica como demostración en el flujo de compra.

El carrito requiere JavaScript. Sin él, las conferencias y los formularios de comentarios y administración siguen funcionando; los botones del carrito se mantienen desactivados y se muestra una explicación.

## Datos

- **Conferencia:** slug único, título, categoría, resumen, fecha opcional, horario y sede opcionales, orden y contenido editorial JSON. El JSON contiene programa, participantes, temas, aprendizajes y referencias a imágenes locales.
- **Comentario:** relación obligatoria con conferencia, nombre visible de 2–60 caracteres, mensaje de 10–1500, fecha y estado `pendiente`, `aprobado` o `rechazado`.
- **Administrador:** correo único y hash bcrypt. No existe registro público de administradores.
- **Sesiones:** almacenamiento en MariaDB, con vencimiento de ocho horas y limpieza periódica.

El texto de los visitantes se escapa al renderizar EJS; no se interpreta como HTML. El servidor descarta campos extra y nunca permite que un envío público elija su estado. La actualización privada cambia únicamente el estado.

## Rutas y contratos

| Método y ruta | Comportamiento |
| --- | --- |
| `GET /` | Portada institucional. |
| `GET /conferencias` | Los tres encuentros. |
| `GET /conferencias/:slug` | Reseña, fotografías y últimos 50 comentarios aprobados. |
| `GET /conferencias/hello-world/materiales` | Presentación original, 29 diapositivas. |
| `GET /acerca` y `/privacidad` | Autoría, fuentes e información sobre participación. |
| `GET /api/conferencias` | Arreglo JSON con slug, título, categoría, resumen, fecha, horario, sede y URL. |
| `GET /api/conferencias/:slug/comentarios` | Hasta 50 comentarios aprobados: nombre, mensaje y fecha. |
| `POST /conferencias/:slug/comentarios` | Recibe `nombre`, `mensaje`, `acepto=si` y `_csrf`. |
| `GET/POST /admin/login` | Acceso privado con correo y contraseña. |
| `GET /admin` | Comentarios paginados, 20 por página. Filtros `estado`, `conferencia`, búsqueda `q` por nombre o mensaje y `pagina`. Resumen de estados dentro de la conferencia y búsqueda seleccionadas. |
| `PUT /admin/comentarios/:id` | Cambia el estado mediante un formulario POST con `?_method=PUT`. |
| `DELETE /admin/comentarios/:id` | Requiere `confirmar=eliminar`; formulario POST con `?_method=DELETE`. |
| `POST /admin/logout` | Destruye la sesión. |
| `GET /health` | Comprueba la conexión; JSON `status=ok` o HTTP 503. |

Un envío JSON válido devuelve HTTP 201 con `mensaje` y `estado=pendiente`; los campos inválidos devuelven 400 con `mensaje` y `errors`. Un formulario HTML válido redirige con 303 y muestra confirmación; uno inválido vuelve a renderizar los valores y errores. Los tokens CSRF inválidos devuelven 403; el límite de envíos, 429; los recursos inexistentes, 404.

La moderación presenta acciones directas para aprobar, rechazar o devolver a pendientes. El campo `volver` conserva la selección al guardar o eliminar y solo admite destinos de `/admin` del mismo origen. La confirmación aparece debajo de los filtros. La última página se ajusta si queda vacía tras una eliminación. El formulario público muestra el proceso de revisión, contador y progreso de caracteres; su confirmación aparece junto al botón de envío. Los flujos de escritura funcionan también sin JavaScript.

Las páginas que incluyen sesión o formularios utilizan `Cache-Control: no-store`. Las respuestas públicas nunca exponen contraseñas, sesiones ni comentarios pendientes/rechazados. Los documentos de clase, `.env` y los archivos fuera de `public` no se sirven como recursos estáticos.

## Seguridad operativa

Las sesiones se renuevan al iniciar sesión y se eliminan al salir. Las cookies son `HttpOnly`, `SameSite=Lax` y `Secure` en producción. Los formularios de escritura exigen un token ligado a la sesión. El acceso permite hasta 10 intentos fallidos cada 15 minutos por dirección; los comentarios, 10 envíos cada 15 minutos. Los límites viven en memoria y están pensados para una sola instancia de la aplicación.

Los límites de cuerpo son 16 KiB. Helmet establece la política de contenido: scripts, imágenes, estilos y fuentes del mismo origen. No se cargan analítica, fuentes ni bibliotecas desde CDN. Las contraseñas usan bcrypt con costo 12; el alta inicial exige al menos 12 caracteres y un máximo de 72 bytes.

Los overrides del archivo de dependencias actualizan `uuid` usado por Sequelize a 11.1.1 y `chokidar` usado por nodemon a 4.0.3. Sequelize utiliza las funciones CommonJS `v1`/`v4`; nodemon observa rutas de directorio explícitas en su configuración. Las pruebas validan la aplicación con estas versiones.

## Producción en un servidor propio

1. Copiar el proyecto y crear un `.env` propio mediante `npm run setup`. Conservar `BD_NOMBRE`, usuario y contraseñas si se reutiliza un volumen existente.
2. Configurar `NODE_ENV=production`. Establecer `TRUST_PROXY=1` únicamente cuando haya un proxy confiable directo delante de Express; con la conexión local al servidor queda en `0`.
3. Ejecutar `docker compose --profile web up -d --build --wait`. El puerto de la aplicación queda en `127.0.0.1:2800` y la base en la interfaz local. La aplicación escucha dentro del contenedor en `0.0.0.0`.
4. Configurar el proxy HTTPS del servidor hacia `http://127.0.0.1:2800`. Debe reenviar host, dirección de cliente y protocolo original. Las cookies seguras necesitan que Express reconozca el protocolo HTTPS.
5. Comprobar portada, acceso administrativo, envío y aprobación, además de `/health`. Mantener desactivada la caché de HTML/API/formularios en cualquier proxy de borde.
6. Respaldar el volumen de MariaDB antes de cambios de infraestructura o esquema. La inicialización normal nunca elimina tablas; no se usa sincronización destructiva en producción.

La conexión de un dominio, DNS o un túnel se realiza después de elegir el servidor y la topología; esta entrega no modifica infraestructura externa.

La carga inicial no cambia la contraseña de un administrador existente. Antes del primer arranque puedes cambiar `ADMIN_EMAIL` y `ADMIN_PASSWORD` en `.env`. Para rotar una contraseña ya creada, utiliza `npm run admin:password` después de ajustar esas variables; es una operación explícita independiente del seed.

## Validación

La integración corre solo sobre una base cuyo nombre termine en `_test`, y la recrea para cada ejecución. La instancia de la aplicación y la instancia de pruebas tienen puertos y almacenamiento separados. No ejecutar ambas suites simultáneamente: `npm run test:all` las ordena.

La suite de navegador comprueba el carrito (cantidades, precios, total, persistencia, límites, eliminación, compra simulada, almacenamiento bloqueado o corrupto y sincronización entre pestañas) y la accesibilidad del diálogo y su confirmación. También comprueba 320, 360, 768 y 1440 px, navegación móvil con teclado, enfoque después de cerrar el visor, funcionamiento sin JavaScript, publicación tras moderación, eliminación y carga local de recursos. Axe revisa criterios automatizables WCAG AA. Una auditoría automática no sustituye la revisión manual con tecnologías de asistencia.
