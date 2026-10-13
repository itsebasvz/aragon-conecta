# Semana de Ingeniería 2027-1 · FES Aragón, UNAM

Memoria académica de tres encuentros de la Semana de Ingeniería: **Infraestructura del mañana**, **Sostenibilidad en los datos** y **De Hello World a proyectos con impacto real**. Proyecto del primer parcial de Programación Web 2, grupo 1708, del profesor Miguel Angel Sánchez Hernández.

**Autor:** Jesús Sebastián Vázquez Zarco · Ingeniería en Computación.

La aplicación vive en [`pryecto_base`](pryecto_base). Usa Node.js 22, Express 5, EJS, Bootstrap 5.3.8 local, Sequelize 6 y MariaDB 11.4. Incluye reseñas, galería, 29 diapositivas de Hello World, comentarios moderados y administración privada.

## Arranque con Docker

Requisitos: Node.js 22, npm y Docker con Compose. Desde esta carpeta:

```bash
cd pryecto_base
npm ci
npm run setup
docker compose --profile web up -d --build --wait
```

Abre **http://localhost:2800**. El panel está en **http://localhost:2800/admin**.

`npm run setup` genera claves únicas y crea `.env` con permisos de lectura restringidos. Consulta `ADMIN_EMAIL` y `ADMIN_PASSWORD` **en ese archivo local** para acceder al panel. No se guardan en Git ni se imprimen en los registros. Si `.env` ya existe, el comando lo conserva.

La aplicación del contenedor prepara las tablas y carga los tres eventos al arrancar. Los datos existentes se conservan. Las imágenes, los estilos y las fuentes están disponibles localmente: navegar por la web no requiere servicios externos.

Para detener la aplicación sin borrar sus datos:

```bash
docker compose --profile web stop
```

## Desarrollo con Node

Después de `npm ci` y `npm run setup`, puedes utilizar solo MariaDB en Docker y ejecutar Node directamente:

```bash
docker compose up -d --wait db
npm run db:init
npm run db:seed
npm run server
```

Detén antes el servicio `app` si ya ocupa el puerto 2800. `npm start` inicia sin recarga automática; `npm run server` utiliza nodemon.

Para una instalación propia de MariaDB, crea el esquema y un usuario con permisos sobre él, y configura `BD_NOMBRE`, `BD_USUARIO`, `BD_CLAVE`, `BD_HOST` y `BD_PORT` en `.env`. Las tablas se crean con `npm run db:init`. El puerto que genera el asistente para MariaDB en Docker es **3307**; ajústalo si usas otra instancia.

`db:init` crea tablas faltantes sin `force` ni `alter`. `db:seed` agrega únicamente conferencias y administradores inexistentes: no sobrescribe reseñas, contraseñas ni comentarios. El contenido editorial inicial se define en `pryecto_base/data/conferencias.js`. Los cambios de esquema posteriores requieren una migración explícita.

## Pruebas

Las pruebas usan una instancia independiente de MariaDB en el puerto 3308. La base de pruebas termina en `_test`; los datos de la aplicación no se utilizan.

```bash
cd pryecto_base
docker compose --profile test up -d --wait db-test
npx playwright install chromium
npm run test:all
docker compose --profile test stop db-test
```

- `npm test`: integración con MariaDB, páginas, JSON, validación, CSRF, autenticación, CRUD y persistencia en un proceso nuevo.
- `npm run test:e2e`: navegador en 320, 360, 768 y 1440 px, comentarios, moderación, navegación por teclado, modo sin JavaScript, recursos locales y auditoría automática WCAG AA.
- `npm audit`: revisión de dependencias.

No ejecutes integración y navegador simultáneamente: comparten la instancia de pruebas. La integración recrea exclusivamente las tablas de esa base aislada. Las capturas de revisión se generan en `/tmp/semanaing-escritorio.png` y `/tmp/semanaing-movil.png`.

## Demostración para el parcial

1. Recorre la portada y una conferencia: contenido renderizado desde MariaDB mediante Express y EJS.
2. Envía una reflexión: se guarda con estado **pendiente** y aún no aparece públicamente.
3. Entra a `/admin` y consulta el envío. Filtra por evento o estado.
4. Cambia el estado a **aprobado** y recarga la conferencia para verlo publicado.
5. Cámbialo a **rechazado** para retirarlo de la vista pública.
6. Abre la confirmación de eliminación y bórralo. Esto demuestra las cuatro operaciones CRUD sin modificar el texto del visitante.
7. Consulta `/api/conferencias` para mostrar una respuesta JSON. La guía técnica relaciona cada capacidad con los PDF del curso.

## Preparación para despliegue

La aplicación está empaquetada para un servidor con Docker; esta entrega no publica un dominio. Consulta [`docs/implementacion.md`](docs/implementacion.md) para la configuración de producción, las rutas y el modelo de datos.

La configuración de producción utiliza HTTPS, cookies seguras y un proxy de confianza explícito. MariaDB y el puerto de la aplicación se exponen solo en la interfaz local del servidor. El volumen `datos-mariadb` conserva el contenido entre reinicios y reconstrucciones.

## Diseño, contenido e historial

La interfaz sigue [`DESIGN.md`](DESIGN.md) y el manual institucional: firmas originales, azul `#002F6C`, amarillo `#F2A900` como acento y Poppins. Los originales están en `assets/` y `docs/`; solo los recursos seleccionados y optimizados se publican desde la aplicación.

2027-1 es el periodo académico; los eventos documentados ocurrieron en 2026. AWS se presenta con los datos confirmados: 25 de septiembre, 17:00–18:30, auditorio del DUACyD. Hello World: 23 de septiembre, 12:30, auditorio A1. Se omiten fecha, horario y sede del Dr. Omar al no estar acreditados.

El historial original del proyecto base se conserva en este repositorio. Su remoto se identifica como `proyecto-base` y apunta al repositorio anterior de clase; no es un destino de publicación de esta web. Los commits nuevos utilizan mensajes convencionales en español.

## Licencia

El código original del proyecto se distribuye bajo la [licencia MIT](LICENSE). Los materiales del curso, fotografías, logotipos y demás recursos de terceros conservan los derechos y condiciones de sus respectivos autores. Consulta la [atribución de los recursos institucionales](assets/README.md#identidad-y-atribución) y la [licencia de la fuente Poppins](pryecto_base/public/fonts/OFL.txt).
