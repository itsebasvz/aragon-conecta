# Aragón Conecta

**Semana de Ingeniería 2027-1 · FES Aragón, UNAM**

Aplicación web con catálogo de conferencias y compra simulada de boletos para la Semana de Ingeniería. Permite elegir encuentros, agregar boletos a un carrito y compartir reflexiones con la comunidad universitaria.

## 1. Datos académicos

| Campo | Información |
| --- | --- |
| Institución | Facultad de Estudios Superiores Aragón, UNAM |
| Carrera | Ingeniería en Computación |
| Asignatura | Programación Web 2 |
| Profesor | Miguel Angel Sánchez Hernández |
| Grupo | 1708 |
| Entrega | Proyecto del primer parcial |

**Integrantes:**

- Jesús Sebastián Vázquez Zarco
- Valeria Guadalupe Guillén Hernández

## 2. Objetivo y contenido

El proyecto aplica las tecnologías estudiadas durante el semestre para construir una aplicación web con catálogo, carrito de compra, contenido almacenado en una base de datos, vistas dinámicas y formularios. Su diseño toma como referencia la identidad institucional de la FES Aragón.

Se presentan tres encuentros del periodo académico 2027-1, celebrados en 2026:

- **Infraestructura del mañana:** experiencias profesionales, computación en la nube y proyectos con AWS.
- **Sostenibilidad en los datos:** software, preservación de información y soberanía tecnológica.
- **De Hello World a proyectos con impacto real:** aprendizaje, proyectos y participación en la comunidad estudiantil.

Cada conferencia reúne detalles, participantes, aprendizajes y un botón para agregar boletos al carrito. AWS y Hello World incluyen carruseles fotográficos; Hello World también permite consultar su presentación. Los visitantes pueden enviar reflexiones, que se publican después de su aprobación en el panel de administración.

Los precios de demostración son **$250 MXN para AWS**, **$150 MXN para el Dr. Omar** y **$100 MXN para Hello World**. El carrito permite ajustar cantidades, eliminar conferencias, vaciar la selección y continuar a un pago simulado con Visa, Mastercard o PayPal antes de confirmar la compra. No realiza cobros ni reservas reales.

El carrito se conserva en el navegador al cambiar de página o recargar. Las fechas, fotografías y materiales se mantienen como referencia de los encuentros originales.

## 3. Tecnologías utilizadas

| Tecnología | Aplicación en el proyecto |
| --- | --- |
| Node.js 22 y Express 5 | Servidor, rutas y controladores |
| EJS | Vistas dinámicas renderizadas en el servidor |
| HTML, CSS, JavaScript y Bootstrap 5 | Interfaz adaptable e interacción |
| Sequelize 6 y MariaDB 11.4 | Modelos, relaciones y persistencia de datos |
| Docker Compose | Entorno local de aplicación y base de datos |

El sistema de comentarios integra las operaciones **CRUD**: crear una reflexión, consultar los envíos, actualizar su estado y eliminar registros. El panel requiere autenticación y permite buscar y filtrar comentarios. La aplicación también expone las conferencias en formato JSON mediante `/api/conferencias`.

La [guía de implementación](docs/implementacion.md#correspondencia-con-los-pdf) relaciona estas funciones con los materiales del curso.

## 4. Instalación y ejecución

**Requisitos:** Git, Node.js 22 con npm y Docker con Docker Compose.

```bash
git clone https://github.com/itsebasvz/aragon-conecta.git
cd aragon-conecta/aragon-conecta
npm ci
npm run setup
docker compose --profile web up -d --build --wait
```

| Acceso | Dirección |
| --- | --- |
| Sitio web | http://localhost:2800 |
| Administración | http://localhost:2800/admin |
| API de conferencias | http://localhost:2800/api/conferencias |

`npm run setup` crea el archivo local `.env` con claves únicas. Las credenciales del panel están en `ADMIN_EMAIL` y `ADMIN_PASSWORD` dentro de ese archivo, excluido del repositorio. Si ya existe, se conserva.

En el primer arranque se preparan las tablas y se cargan las tres conferencias. MariaDB conserva los datos en un volumen de Docker. Para detener los servicios, desde la carpeta de la aplicación:

```bash
docker compose --profile web stop
```

## 5. Estructura del repositorio

```text
aragon-conecta/     Aplicación web
├── controllers/   Lógica de las peticiones
├── models/        Modelos y relaciones de datos
├── routes/        Rutas públicas y administrativas
├── views/         Vistas y componentes EJS
├── public/        Estilos, scripts y recursos optimizados
├── docs/          Materiales de la asignatura
└── tests/         Pruebas de integración y navegador
assets/            Fotografías y recursos originales
docs/              Guía técnica, fuentes e identidad institucional
DESIGN.md          Criterios de diseño de la interfaz
```

## 6. Verificación del proyecto

Para revisar la compra, agrega boletos desde la portada, el catálogo o el detalle de una conferencia. Abre el carrito desde la navegación, modifica las cantidades y pulsa “Continuar al pago”. Elige Visa, Mastercard o PayPal y confirma con los datos ficticios precargados. Verás el resumen y el carrito quedará vacío. Este flujo utiliza JavaScript y almacenamiento local; no requiere registro ni guarda pedidos en MariaDB.

Para revisar el CRUD de comentarios, abre una conferencia y envía una reflexión. Después, ingresa al panel, localiza el envío y apruébalo. Al recargar la conferencia, el comentario aparecerá públicamente. Desde el panel también puedes rechazarlo, devolverlo a pendientes o eliminarlo con confirmación.

Las pruebas automatizadas comprueban el carrito, los totales, la persistencia y la confirmación simulada, además de las rutas, la autenticación, el CRUD, el diseño en distintos tamaños de pantalla, la navegación por teclado y el funcionamiento sin JavaScript. Se ejecutan sobre una base independiente de los datos de la aplicación.

Desde la carpeta de la aplicación, después de completar la instalación:

```bash
docker compose --profile test up -d --wait db-test
npx playwright install chromium
npm run test:all
docker compose --profile test stop db-test
```

## 7. Documentación y licencia

- [Guía para leer el código](docs/guia-codigo.md): recorrido sencillo del servidor, las vistas, el carrito y los comentarios.
- [Guía de implementación](docs/implementacion.md): arquitectura, modelo de datos, rutas y configuración de producción.
- [Criterios de diseño](DESIGN.md): pautas visuales y referencias institucionales.
- [Fuentes del contenido](docs/info): reporte académico y materiales de las conferencias.

El código del proyecto se distribuye bajo la [licencia MIT](LICENSE). Las fotografías, los logotipos y los materiales de terceros conservan los derechos de sus autores; consulta las [atribuciones](assets/README.md#identidad-y-atribución) y la [licencia de Poppins](aragon-conecta/public/fonts/OFL.txt).
