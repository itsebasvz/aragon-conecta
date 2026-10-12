# UNAM — Sistema de Diseño Web Institucional

> **Universidad pública, conocimiento abierto e identidad azul y oro.** Una plataforma digital UNAM debe sentirse académica, confiable, accesible y contemporánea: escudos institucionales auténticos, navegación clara orientada a las personas, fotografía universitaria real, jerarquías editoriales sólidas y acentos dorados moderados sobre una base azul profundo y superficies luminosas.

**Tema base:** claro (`light`) · **Idioma principal:** español (`es-MX`) · **Densidad:** media/cómoda · **Versión:** 1.0 · **Investigación:** 12 de octubre de 2026  
**Aplicación:** sitios institucionales, facultades, escuelas, divulgación, directorios, noticias, agendas, servicios escolares y plataformas web académicas.  
**Referencias primarias:** [Portal UNAM](https://www.unam.mx/inicio) · [FES Aragón](https://www.aragon.unam.mx/fes-aragon/#!/inicio) · [Facultad de Arquitectura](https://arquitectura.unam.mx/) · [Identidad institucional de FES Aragón](https://www.aragon.unam.mx/fes-aragon/public_html/documents/comunicacion_social/identidad-institucional.pdf).

> **Alcance y rigor.** Esta es una **especificación de producto recomendada**, basada en patrones de los portales señalados y en guías de identidad publicadas por dependencias universitarias; **no es un manual universal emitido por Rectoría ni una copia exacta de los CSS de los sitios**. Se distingue entre **[OFICIAL DE DEPENDENCIA]** (dato comprobado en una guía), **[OBSERVADO]** (estructura o contenido visible en los sitios) y **[PROPUESTA]** (decisión de diseño para implementar una plataforma coherente). Las medidas de tipografía, grid, espaciado, bordes y componentes no se presentan como mediciones verificadas del DOM original.

## 1. ADN de diseño

La UNAM combina tres lenguajes digitales complementarios:

1. **Portal central (`unam.mx`) — institucional e informativo.** La navegación cubre Comunidad, Oferta Educativa, Investigación, Cultura, Deportes y Numeralia; el contenido da prioridad a boletines, noticias, eventos, convocatorias y acceso a otros servicios universitarios. **[OBSERVADO]**
2. **FES Aragón (`aragon.unam.mx`) — campus y servicios.** Estructura profunda por oferta académica, investigación, servicios escolares, vida universitaria, atención a la comunidad y autoridades. Anuncios, noticias, gacetas y enlaces de interés son módulos esenciales. **[OBSERVADO]**
3. **Facultad de Arquitectura (`arquitectura.unam.mx`) — editorial y visual.** Menús por audiencia (Aspirantes, Alumnado, Comunidad), actividad académica, bibliotecas, publicaciones, boletín, eventos y fotografías de la facultad. Su jerarquía informativa permite mayores módulos fotográficos y una composición editorial. **[OBSERVADO]**

**Dirección visual unificada [PROPUESTA]:** no imitar tres interfaces históricamente diferentes. Conservar los principios compartidos —identidad, legibilidad, utilidad pública y organización académica— en un lenguaje coherente y actual, menos saturado, adaptable y de fácil mantenimiento. El contenido universitario debe ser protagonista, no la decoración.

### Principios rectores

| Principio | Decisión operacional |
|---|---|
| Institucionalidad | Escudo y denominación oficiales; azul profundo como ancla; jerarquía clara entre UNAM, entidad y producto. |
| Acceso universal | WCAG 2.2 AA como objetivo; móvil, teclado, lectores de pantalla y conexiones modestas. |
| Claridad antes que espectáculo | Búsqueda, trámites, oferta académica y avisos distinguibles en pocos segundos. |
| Periodismo universitario | Fotografías reales, fechas, autoría, información verificable y módulos editoriales. |
| Sistema federado | Núcleo compartido con temas configurables por dependencia, sin confundir sus manuales cromáticos. |
| Sobriedad contemporánea | Blanco, azul, líneas finas y oro puntual; tarjetas contenidas, sombras raras, animaciones discretas. |
| Transparencia | Información de contacto, aviso de privacidad, actualización del contenido, responsables y documentos accesibles. |

---

## 2. Tokens — Paletas de color y su procedencia

### 2.1 Colores institucionales documentados

**Paleta recomendada cuando el producto pertenece a FES Aragón:** su documento *Elementos gráficos institucionales* identifica azul **Pantone 294 C** (`RGB 0,47,108`, `#002F6C`) como color principal y amarillo **Pantone 130 C** (`RGB 242,169,0`, `#F2A900`) como secundario. Señala que el secundario es **solo un acento**, no debe usarse en logotipos o títulos principales ni ocupar más del 30% del diseño. **[OFICIAL DE DEPENDENCIA]**

| Nombre | HEX | Token | Naturaleza / aplicación |
|---|---|---|---|
| Azul institucional Aragón | `#002F6C` | `--brand-primary` | **Oficial FES Aragón**. Branding local, navegación principal, títulos, botones primarios, encabezados y footer. |
| Amarillo institucional Aragón | `#F2A900` | `--brand-accent` | **Oficial FES Aragón**. Subrayados cortos, detalles gráficos, indicadores, filetes, acento en CTAs puntuales. |
| Blanco | `#FFFFFF` | `--color-white` | **Propuesta**. Lienzo, tarjetas y fondos de lectura. |

**La UNAM no utiliza un único par hexadecimal idéntico en todos sus subdominios.** Otras guías universitarias consignan otras formulaciones: la Facultad de Medicina documenta `#002B7A` / `#D59F0F`; el manual anterior de la FES Aragón (2015) registraba `#293E6B` / `#B6985E`; CCH Oriente publica `#122245` / `#B59957` para su propia identidad. **No mezclar colores de escudos entre facultades ni presentar cualquiera de esos pares como el código universal obligatorio de la UNAM.** La variante aplicable se selecciona según la entidad propietaria del proyecto y su manual vigente.

| Variante identificada | Azul | Oro / amarillo | Uso permitido en este sistema |
|---|---|---|---|
| **FES Aragón — identidad publicada más reciente** | `#002F6C` | `#F2A900` | `theme="aragon"`, perfil base de este documento. |
| Facultad de Medicina — manual de comunicación | `#002B7A` | `#D59F0F` | Referencia de unidad; no heredar automáticamente. |
| FES Aragón — manual anterior (2015) | `#293E6B` | `#B6985E` | **Legado**, para reconocer y migrar piezas antiguas; no es el perfil predeterminado. |
| CCH Oriente — sitio institucional propio | `#122245` | `#B59957` | Referencia de diversidad entre dependencias; no usar fuera de su ámbito sin autorización. |

**Regla de precedencia:** manual vigente de la entidad > lineamientos del proyecto aprobados por su área de comunicación > tokens de interfaz propuestos aquí. Para logos, utilizar exclusivamente los archivos aprobados, nunca recalcular su color a partir de los tokens CSS.

### 2.2 Colores funcionales de interfaz — [PROPUESTA]

| Nombre | HEX | Token | Rol |
|---|---|---|---|
| Azul profundo | `#002F6C` | `--color-primary-700` | Acciones primarias y marca en tema Aragón. |
| Azul de interacción | `#154A86` | `--color-primary-600` | Hover sobre elementos primarios de fondo claro. |
| Azul de lectura | `#163C70` | `--color-link` | Enlaces accesibles sobre blanco. |
| Azul casi negro | `#0B2342` | `--color-primary-900` | Footer profundo, fondos especiales y contraste. |
| Azul hielo | `#EAF0F8` | `--color-primary-050` | Bloques informativos, estados seleccionados y paneles. |
| Azul pálido | `#F3F7FC` | `--color-primary-025` | Fondo editorial alterno. |
| Oro acento | `#F2A900` | `--color-accent` | Detalles de marca y superficies destacadas escasas. |
| Oro pálido | `#FFF4D6` | `--color-accent-soft` | Notas institucionales no críticas; complemento suave. |
| Texto principal | `#182333` | `--color-text` | Párrafos y títulos sobre fondos claros. |
| Texto secundario | `#4D5B70` | `--color-text-muted` | Metadatos, fecha y contenido auxiliar. |
| Texto inverso | `#FFFFFF` | `--color-text-inverse` | Texto sobre azul institucional. |
| Gris de superficie | `#F5F7FA` | `--color-surface-muted` | Secciones alternas y listados. |
| Gris de borde | `#D9E0E8` | `--color-border` | Separadores, tarjetas, entradas de formulario. |
| Gris de borde fuerte | `#9CABBB` | `--color-border-strong` | Controles con mayor contraste. |
| Éxito | `#237647` | `--color-success` | Estados completados y confirmaciones. |
| Éxito suave | `#EAF5EE` | `--color-success-soft` | Avisos de éxito. |
| Advertencia | `#8A5800` | `--color-warning` | Texto e íconos de precaución. |
| Advertencia suave | `#FFF2D2` | `--color-warning-soft` | Avisos preventivos. |
| Error | `#B42336` | `--color-error` | Validación negativa, incidencias. |
| Error suave | `#FDECEF` | `--color-error-soft` | Fondo de errores. |
| Información | `#175A91` | `--color-info` | Información general no identitaria. |
| Información suave | `#E9F3FB` | `--color-info-soft` | Alertas informativas. |

**Distribución orientativa:** 65–75% blanco/superficies claras, 20–30% texto, fotografía y azul, 5–10% oro/acento. Es una proporción visual **recomendada, no una regla oficial**. La restricción explícita del manual Aragón sobre amarillo (nunca más de 30%) prevalece.

### 2.3 Combinaciones y contraste

| Combinación | Contraste aproximado | Veredicto |
|---|---:|---|
| `#002F6C` sobre blanco | **12.94:1** | Apto para texto normal y grande. |
| Blanco sobre `#002F6C` | **12.94:1** | Apto para navegación/botones. |
| `#002F6C` sobre `#F2A900` | **6.44:1** | Apto para texto de CTA dorada. |
| `#F2A900` sobre blanco | **2.01:1** | **No apto** para texto o íconos comunicativos pequeños. |
| `#4D5B70` sobre blanco | **6.89:1** | Apto para texto secundario. |

Cálculos basados en contraste relativo WCAG, redondeados a dos decimales. Para color de un ícono de estado, validar contraste no textual ≥3:1; para texto normal, ≥4.5:1; para texto grande, ≥3:1. **No usar oro como texto sobre blanco**; emplearlo como acento decorativo o sobre fondos azul oscuro, o usar azul oscuro como texto sobre oro.

### 2.4 Semántica de marca

- `primary`: identifica universidad/entidad y acciones de alta prioridad.
- `accent`: expresa orgullo universitario; **no** sustituye el color de error, advertencia o éxito.
- `surface`: organiza lectura y navegación, **sin** competir con fotografías o escudos.
- `status`: comunica resultados funcionales mediante color **más** texto/ícono, nunca solo color.
- Si una facultad usa tonos complementarios propios, configurarlos mediante un tema específico; conservar la arquitectura de componentes y criterios de accesibilidad.

---

## 3. Tokens — Tipografía

**No se pudo establecer mediante las fuentes consultadas una única familia tipográfica web oficial compartida por todos los portales.** Una guía de Facultad de Medicina recomienda Arial, Helvetica, Futura y Franklin Gothic; CCH Oriente identifica Poppins como su tipografía institucional; Facultad de Ciencias tiene otras familias propias. En consecuencia, las siguientes familias son **recomendaciones técnicas para esta plataforma**, no atribuciones a `unam.mx` ni `arquitectura.unam.mx`.

### 3.1 Familias

| Familia | Token | Uso | Pesos | Alternativa |
|---|---|---|---|---|
| **Inter** | `--font-sans` | Interfaz, menús, formularios, noticias y tablas. **[PROPUESTA]** | 400, 500, 600, 700 | Arial, Helvetica, system-ui, sans-serif |
| **Source Serif 4** | `--font-editorial` | Citas o artículos académicos extensos como estilo opcional. **[PROPUESTA]** | 400, 600 | Georgia, serif |
| **ui-monospace** | `--font-mono` | Referencias técnicas, claves no sensibles, código, ejemplos. **[PROPUESTA]** | 400, 500 | SFMono-Regular, Consolas, monospace |

**Reglas:** cuerpo preferente sin serif para tareas y lectura rápida; serif solo en secciones editoriales, nunca en el menú principal. No usar tipografías manuscritas, góticas o extremadamente condensadas como familia del producto. Cargar máximo dos familias y un conjunto reducido de pesos.

### 3.2 Escala tipográfica responsiva — [PROPUESTA]

| Rol | Desktop | Móvil | Peso | Interlineado | Tracking | Token |
|---|---:|---:|---:|---:|---:|---|
| Display / hero | 56px | 36px | 700 | 1.08 | -0.035em | `--text-display` |
| H1 | 44px | 32px | 700 | 1.15 | -0.025em | `--text-h1` |
| H2 | 32px | 26px | 700 | 1.20 | -0.020em | `--text-h2` |
| H3 | 24px | 22px | 600 | 1.30 | -0.010em | `--text-h3` |
| H4 | 20px | 19px | 600 | 1.35 | -0.005em | `--text-h4` |
| Entradilla | 20px | 18px | 400 | 1.60 | normal | `--text-lead` |
| Cuerpo | 16px | 16px | 400 | 1.65 | normal | `--text-body` |
| Cuerpo pequeño | 14px | 14px | 400 | 1.50 | normal | `--text-small` |
| Metadatos | 13px | 13px | 500 | 1.45 | normal | `--text-meta` |
| Navegación | 15px | 15px | 500 | 1.35 | normal | `--text-nav` |
| Etiquetas de control | 14px | 14px | 600 | 1.35 | normal | `--text-control` |
| Cifras destacadas | 40px | 32px | 700 | 1.15 | -0.025em | `--text-stat` |

- Título principal: una sola etiqueta `<h1>` por vista; `<h2>` y `<h3>` reflejan la estructura real del documento.
- Medida de línea del cuerpo: **60–75 caracteres**; en páginas de trámite puede llegar a 80.
- El texto de tablas no debe comprimirse por debajo de 14px; datos legales y metadatos, idealmente ≥13px.
- Mayúsculas completas solo en etiquetas muy breves; nunca en párrafos ni llamadas de acción largas.
- Evitar texto justificado y párrafos densos; preferir alineación izquierda y lenguaje directo.

---

## 4. Tokens — Espaciado, geometría y layout

**Unidad base:** 4px · **Densidad:** cómoda en contenido / compacta controlada en tablas.

### 4.1 Escala espacial

| Token | Valor | Aplicación |
|---|---:|---|
| `--space-1` | 4px | Microseparación ícono-texto. |
| `--space-2` | 8px | Etiquetas, metadatos agrupados. |
| `--space-3` | 12px | Botón e interior de controles compactos. |
| `--space-4` | 16px | Gaps comunes, contenedores móviles. |
| `--space-5` | 20px | Texto y media de módulos. |
| `--space-6` | 24px | Padding de tarjetas y grupos. |
| `--space-8` | 32px | Columnas y bloques relacionados. |
| `--space-10` | 40px | Separación interna de secciones. |
| `--space-12` | 48px | Espaciado vertical mediano. |
| `--space-16` | 64px | Separación de secciones. |
| `--space-20` | 80px | Secciones destacadas desktop. |
| `--space-24` | 96px | Aperturas editoriales amplias. |

### 4.2 Radio de borde

| Elemento | Radio | Token |
|---|---:|---|
| Barra de navegación, footer, bandas | 0px | `--radius-none` |
| Etiquetas / chips discretos | 4px | `--radius-xs` |
| Input, select, botones, avisos | 8px | `--radius-md` |
| Tarjetas, menús desplegables | 12px | `--radius-lg` |
| Hero con fotografía contenida | 16px | `--radius-xl` |
| Cápsulas de filtro opcionales | 999px | `--radius-pill` |

**Carácter visual:** geometría predominantemente rectangular; radios moderados. No copiar los contenedores redondeados de 28–32px ni botones universalmente tipo píldora de páginas comerciales.

### 4.3 Sombras y bordes

| Token | Valor | Uso |
|---|---|---|
| `--shadow-none` | `none` | Por defecto. |
| `--shadow-card` | `0 2px 12px rgb(11 35 66 / 6%)` | Tarjetas elevadas puntuales. |
| `--shadow-dropdown` | `0 12px 32px rgb(11 35 66 / 14%)` | Menús flotantes. |
| `--shadow-dialog` | `0 24px 64px rgb(11 35 66 / 20%)` | Diálogos. |
| `--border-default` | `1px solid #D9E0E8` | División habitual. |
| `--border-accent` | `3px solid #F2A900` | Barra lateral o acento no estructural. |

Dividir por espaciado y líneas finas; una página institucional no debe parecer un conjunto de cards flotantes con sombras fuertes.

### 4.4 Rejilla y puntos de quiebre

| Breakpoint | Ancho | Columnas sugeridas | Margen horizontal |
|---|---:|---:|---|
| Mobile | `<640px` | 4 | 16px |
| Tablet | `640–1023px` | 8 | 24px |
| Desktop | `1024–1439px` | 12 | 32px |
| Wide | `≥1440px` | 12 | ≥48px |

- Contenedor general máximo: **1280px** (`--container-max`).
- Contenedor de lectura: **760px** (`--container-prose`).
- Columna lateral institucional o índice: 240–280px; contenido fluido restante.
- Gutter: 16px móvil, 24px tablet, 32px desktop.
- Secciones: 48–64px vertical en móvil; 64–80px en desktop.
- En vistas densas, las tablas pueden desbordar horizontalmente **dentro de su propio contenedor**, no la página entera.

---

## 5. Arquitectura global de una plataforma

### 5.1 Encabezado institucional

**Rol:** acreditar el sitio y permitir navegación inmediata.

**Estructura recomendada [PROPUESTA]:**

1. **Skip link** “Saltar al contenido”, visible al recibir foco.
2. **Franja de identidad** blanca (o azul profundo si el manual local lo permite): escudo UNAM oficial enlazado a `unam.mx`; identificador aprobado de la Facultad o dependencia; nombre legible del sistema/producto; enlaces de acceso universales.
3. **Navegación principal** horizontal sobre blanco o azul, con secciones por tarea/audiencia; búsqueda global visible.
4. **Contexto opcional** de sección: breadcrumb, nombre de unidad y menú secundario de pocos elementos.

Evitar usar tres barras competitivas con más de ocho enlaces cada una. Altura orientativa del header desktop: identidad 76–96px, menú 48–56px; en móvil priorizar un header compacto de 64–72px, búsqueda y menú desplegable.

**Marca:** siempre respetar jerarquía y márgenes de seguridad del archivo institucional; nunca trazar el escudo con HTML, CSS o generación artificial. El manual de la Facultad de Medicina propone escudo UNAM a la izquierda enlazado al portal y a su derecha el escudo de dependencia y nombre del área; es una **referencia de dependencia**, no una imposición universal para toda la UNAM.

### 5.2 Navegación — orientada a audiencias

**Inspiración observada:** `unam.mx` agrupa comunidad y servicios; Aragón agrupa oferta académica, investigación y vida universitaria; Arquitectura distingue Aspirantes, Alumnado, Comunidad y Facultad.

**Menú propuesto, adaptable al producto:**

- Inicio
- Oferta académica
- Trámites y servicios
- Investigación
- Vida universitaria
- Noticias y eventos
- Acerca de / Contacto

No tienen que coexistir todos los ítems: privilegiar **4–7 categorías principales** según el contexto real. Submenús con encabezados breves, listas simples y enlaces descriptivos; profundidad de navegación preferente ≤3 niveles. Para sitios funcionales, organizar por acciones (“Solicitar constancia”) antes que por el organigrama.

### 5.3 Footer institucional

**Rol:** contacto, navegación secundaria, cumplimiento y trazabilidad.

Fondo azul profundo o gris muy claro, sección de contactos, domicilio cuando corresponda, responsable administrativo de sitio, enlaces a facultad/UNAM, directorio, accesibilidad, avisos de privacidad, términos de uso si aplican, créditos y actualización. La leyenda legal y condiciones de reproducción **deben derivarse del texto vigente del sitio responsable; no copiar ciegamente el año o la licencia de otra dependencia**.

---

## 6. Componentes de interfaz

Cada componente comparte **anatomía → variantes → estados → accesibilidad**; los valores son propuestas, salvo lo indicado.

### 6.1 `InstitutionalHeader`

- **Anatomía:** skip link, escudo oficial, nombre de entidad, nombre de aplicación, utilidad de búsqueda, menú principal.
- **Colores:** blanco + texto azul, o barra primaria azul con texto blanco; línea inferior neutra de 1px.
- **Comportamiento:** en scroll puede fijarse únicamente la barra de navegación, no una cabecera alta completa.
- **Móvil:** marca reducida sin deformar escudo; panel tipo drawer etiquetado, foco atrapado mientras abierto, cierre con Escape.
- **No hacer:** reutilizar escudos como íconos de botón de 16px o miniaturas ilegibles.

### 6.2 `Breadcrumbs`

- **Anatomía:** Inicio / Dependencia / Sección / Página actual.
- **Formato:** 13–14px, gris de lectura; separador neutral; último elemento `aria-current="page"`.
- **Uso:** todas las páginas internas con profundidad ≥2; omitir en home.

### 6.3 `PageHeading`

- **Anatomía:** categoría opcional, H1, entradilla, acciones relevantes, fecha/cuenta de actualización cuando aplique.
- **Forma:** fondo claro, contenido alineado a la izquierda; filete dorado de 40–64px opcional como acento (nunca reemplaza encabezado semántico).
- **Anchura:** titular 65–80 caracteres máximo; el texto no debe montarse sobre áreas complejas de fotografías.

### 6.4 `EditorialHero`

- **Rol:** convocatoria destacada, campaña universitaria, portada de noticias o apertura de facultad.
- **Composición:** fotografía real 16:9 o 3:2; título y texto sobre área de alto contraste o bloque adyacente. Evitar fotografías decorativas sin contexto.
- **Variantes:** imagen/texto a dos columnas, imagen full-width con overlay medido, cabecera únicamente tipográfica.
- **Acción:** un CTA primario y uno secundario como máximo.
- **Accesibilidad:** overlay azul oscuro controlado, siempre medir contraste; no incrustar en fotografías la información imprescindible.

### 6.5 `NewsCard`

- **Rol:** boletines, noticias de facultad, investigación, cultura y eventos.
- **Anatomía:** imagen 16:9, categoría, titular H3, resumen de 1–3 líneas, fecha absoluta y enlace descriptivo.
- **Estilo:** superficie blanca, borde sutil, radio 12px; imagen recortada con `object-fit: cover`; sin sombra por defecto.
- **Interacción:** hover cambia borde o subrayado; la card puede ser un único enlace semántico.
- **No hacer:** usar “Leer más” sin contexto accesible o titulares truncados sin forma de conocerlos.

### 6.6 `AnnouncementCard` / `Callout`

- **Rol:** avisos oficiales, convocatorias, cierres, registro, fechas de trámite.
- **Anatomía:** etiqueta de tipo, título, fecha límite (con zona horaria si importa), descripción breve, CTA, fuente responsable.
- **Variantes:** institucional (azul), informativo, preventivo (ámbar funcional), crítico (rojo funcional).
- **Criterio:** el oro de marca no debe comunicar por sí solo una alerta; la urgencia se expresa en texto y semántica.

### 6.7 `EventCard` / `AgendaList`

- **Anatomía:** fecha con día/mes, horario, título, modalidad, sede, organizador, CTA “Ver evento” o “Registrarme”.
- **Formas:** cards compactas para portada; lista cronológica accesible para agenda; filtros por audiencia/temática/fecha.
- **Reglas:** zonas horarias, formato de 24 horas en `es-MX`, estados “Próximamente” / “Cerrado” / “Finalizado” explícitos.
- **No hacer:** depender exclusivamente de un banner con texto embebido para comunicar la convocatoria.

### 6.8 `AcademicProgramCard`

- **Rol:** fichas de licenciaturas, posgrados, diplomados y educación continua.
- **Anatomía:** nombre exacto, nivel educativo, modalidad, dependencia, síntesis, duración si está comprobada, enlace a plan de estudios.
- **Grid:** 3 por fila desktop, 2 tablet, 1 móvil; dimensiones consistentes sin ocultar contenidos.
- **CTA:** “Consultar plan de estudios”; jamás prometer inscripciones abiertas sin fuente vigente.

### 6.9 `ServiceQuickLink`

- **Rol:** acceso rápido a becas, calendarios, bibliotecas, servicio social, CISE/SIAE, constancias.
- **Anatomía:** ícono lineal (24px), título orientado a acción, descripción mínima y flecha.
- **Estilo:** superficie gris/azul pálido, borde; altura táctil mínima de 44px.
- **Regla:** ordenado por frecuencia de uso y relevancia, no por orden burocrático del organigrama.

### 6.10 `Button`

| Variante | Fondo | Texto | Borde | Uso |
|---|---|---|---|---|
| Primario | `#002F6C` | Blanco | Igual al fondo | Acción principal: consultar, enviar, completar. |
| Primario hover | `#154A86` | Blanco | Igual al fondo | Retroalimentación visual. |
| Secundario | Blanco | `#002F6C` | `#002F6C` | Acciones alternativas. |
| Terciario | Transparente | `#163C70` | Ninguno | Acciones de menor énfasis, enlaces de navegación. |
| Acento excepcional | `#F2A900` | `#002F6C` | Ninguno | CTA muy localizado; no multiplicar. |
| Destructivo | `#B42336` | Blanco | Igual al fondo | Eliminar o cancelar una acción irreversible. |
| Deshabilitado | `#E9EDF2` | `#667384` | Ninguno | No activo; explicar por qué si resulta necesario. |

- Alto regular 44px (mínimo), grande 48px, compacto 36px **solo en áreas no primarias** con objetivo táctil de al menos 44px.
- Padding horizontal 16–24px; 8px de radio; fuente 14–16px peso 600.
- Estados: default, hover, `:focus-visible`, pressed, disabled, loading (texto “Procesando…” + indicador), success/error gestionados fuera del botón.
- No colocar dos botones primarios juntos, ni usar botón para navegar cuando basta un enlace `<a>`.

### 6.11 `Link`

- `#163C70` sobre fondo claro; subrayar en párrafos y al foco/hover en navegación.
- Texto descriptivo: “Consultar requisitos de beca”, no “clic aquí”.
- Archivos descargables: indicar formato, tamaño estimado si es conocido y acceso a versión accesible.
- Enlaces externos: no abrir nueva pestaña sin razón; si se hace, informarlo.

### 6.12 `TextField`, `SearchField`, `Select`, `Textarea`

- Etiqueta **visible sobre el control**, helper text opcional y error asociado con `aria-describedby`.
- Fondo blanco; `1px #9CABBB` en normal; `2px #002F6C` en foco; radio 8px.
- Alto mínimo 44–48px; padding horizontal 14–16px; placeholder no sustituye la etiqueta.
- Requeridos marcados textualmente (“Obligatorio”), formato y ejemplo disponibles antes de enviar.
- Validación al perder el foco o al enviar; conservar los datos ingresados tras error.
- Búsqueda global: campo suficientemente amplio y botón con nombre accesible; resultados agrupados por título y tipo.

### 6.13 `Tabs`, `Accordion`, `FilterChips`

- **Tabs:** para 2–5 vistas paralelas; `role="tablist"`, teclado con flechas, indicador activo azul de 2–3px.
- **Accordion:** para preguntas frecuentes y trámites extensos; botón semántico con `aria-expanded`, expandir varios si no hay motivo para limitar.
- **Filter chips:** para filtros reversibles, activo mediante fondo `#EAF0F8` + borde azul y estado accesible `aria-pressed`.
- **No hacer:** esconder información crítica dentro de un slider automático o un acordeón imposible de enlazar.

### 6.14 `DataTable`

- **Rol:** requisitos, costos, horarios, convocatorias, listados y trámites.
- Encabezado azul oscuro o gris muy claro con texto de alto contraste; líneas horizontales suaves.
- Celdas alineadas por tipo, fechas consistentes, cifras tabulares; `caption`, `<th scope>`, ordenamiento expuesto a tecnología asistiva.
- Filas mínimas de ~48px; en móvil tabla desplazable con pista visual o tarjetas transformadas cuando no distorsione el significado.
- **No hacer:** convertir una tabla compleja en párrafos apilados sin conservar sus relaciones.

### 6.15 `Alert` / `StatusBanner`

- **Tipos:** información, éxito, advertencia, error, emergencia.
- **Anatomía:** ícono + encabezado + explicación + acción opcional; acento vertical de 3–4px, fondo tonal pálido.
- Estado de emergencia arriba del contenido si existe un evento real confirmado; no simular alertas oficiales.
- Usar `role="alert"` solo para errores urgentes y no sobrecargar anuncios dinámicos; para éxito ordinario `role="status"`.

### 6.16 `Modal` / `Dialog`

- Solo para confirmaciones, operaciones críticas, autenticación contextual o contenido corto.
- Anchura 480–640px; 24–32px padding; overlay opaco moderado; foco inicial sensato, cerrar con Escape, devolver foco al disparador.
- Evitar modales para avisos de difusión no esenciales: afectan lectura y navegación.

### 6.17 `Pagination`, `EmptyState`, `Skeleton`

- Paginación con anterior/siguiente, estado actual accesible y número de resultados; no cargar todo el archivo de noticias en un único DOM.
- Empty state: explicación y siguiente paso real (“No se encontraron convocatorias con estos filtros”).
- Skeleton: imita la estructura final, nunca impide el acceso al texto; animación suprimible con `prefers-reduced-motion`.

### 6.18 `Footer`

- Columnas de contacto y enlaces relacionados (2–4 según el ancho), bloque legal final y enlace al inicio.
- Iconos sociales solo cuando corresponden a cuentas oficiales verificadas.
- Contraste alto; contacto copiable; teléfonos y correos semánticamente enlazados.

---

## 7. Plantillas por tipo de página

### 7.1 `InstitutionalHome`

**Orden recomendado:** header → aviso crítico (si existe) → hero editorial → accesos rápidos → noticias y boletines → próximas fechas → agenda/cultura/investigación → enlaces de interés → footer.

**Características:** primera pantalla responde qué es el portal, a quién sirve y dónde empezar. Noticias y carruseles no desplazan tareas prioritarias.

### 7.2 `FacultyHome`

Header con identidad dual, título de facultad, fotografía de campus, 4–6 servicios primarios, oferta académica, investigación, comunidad, noticias, calendario y contacto. Captura el patrón FES Aragón de servicios y el patrón Arquitectura de imágenes y vida académica sin reproducir sus layouts literalmente.

### 7.3 `AcademicProgramDetail`

Breadcrumb → nombre de programa → atributos verificables → descripción → perfil ingreso/egreso → plan de estudios → requisitos → fechas y fuentes oficiales → responsables y contacto. Índice de anclas en desktop; en móvil índice plegable.

### 7.4 `NewsArticle`

Categoría y fecha → H1 → entradilla → fotografía con pie y atribución → autor/área → cuerpo de lectura (≤760px) → adjuntos/fuentes → relacionados. No insertar promociones entre párrafos de noticias oficiales.

### 7.5 `EventsIndex` / `EventDetail`

Agenda con rango temporal, filtros, accesibilidad de calendario/lista; evento detalle con sede/mapa opcional, modalidad, fecha/hora, inscripción, organizador, accesibilidad del lugar y contactos.

### 7.6 `ServicesDirectory`

Título explícito → campo búsqueda → filtros por audiencia/tipo de trámite → listado de servicios → instrucciones breves y enlaces oficiales. La tarjeta dice qué necesita la persona para realizar la acción.

### 7.7 `AdministrativeForm`

Progreso (“Paso 2 de 4”), campos agrupados por propósito, ayudas visibles, validación por campo, estado de guardado y confirmación final. Mostrar un folio **solo si el backend realmente lo produce**; no inventar confirmaciones. Datos personales mínimos, tratamiento y aviso de privacidad próximo al punto de captura.

### 7.8 `InstitutionalDashboard`

Header institucional → título/periodo de datos → indicadores con contexto y origen → filtros → gráficos legibles con unidad → tablas de respaldo → fuente, fecha de corte y metodología. Usar azul para series principales y tonos secundarios funcionales; el amarillo no debe asumir significados estadísticos ambiguos. No reutilizar un escudo como marca de agua intrusiva detrás de datos.

---

## 8. Superficies y jerarquía visual

| Nivel | Superficie | Color | Propósito |
|---|---|---|---|
| 0 | Canvas | `#FFFFFF` | Base predominante. |
| 1 | Alterna | `#F5F7FA` | Bandas informativas, agrupación de contenido. |
| 2 | Tint institucional | `#EAF0F8` | Accesos rápidos, destacados y selección. |
| 3 | Card | `#FFFFFF` | Módulos con borde fino. |
| 4 | Institucional | `#002F6C` | Header o footer y bloques con énfasis fuerte. |
| 5 | Institucional profundo | `#0B2342` | Callouts de cifras o footer profundo. |
| 6 | Acento | `#F2A900` | Filete, pequeño control o acento, nunca lienzo general. |

**Elevación:** prioridad a separación por superficie, borde y espaciado. La sombra se reserva para dropdowns, popovers, modales y algunas cards en interacción. No introducir glassmorphism, neón, múltiples gradientes o una interfaz comercial con exceso de brillos.

## 9. Fotografía, iconografía y recursos visuales

### Fotografía institucional

- Utilizar imágenes auténticas: campus, bibliotecas, aulas, laboratorios, talleres, eventos, investigación, comunidad y patrimonio arquitectónico.
- La Facultad de Arquitectura ejemplifica una presentación fotográfica del entorno construido y recursos para la comunidad. **[OBSERVADO]**
- Mantener encuadres coherentes en cada colección, sin deformar imágenes. Usar `object-fit: cover` únicamente donde el recorte no elimine información sustancial.
- Relación recomendada: **16:9** noticias, **3:2** reportajes, **1:1** retratos/avatares, panorámica amplia para hero cuando el material lo permita.
- Proveer `alt` significativo; imágenes decorativas con `alt=""`; leyendas, créditos, procedencia y permisos gestionados editorialmente.
- Escudos y logotipos: usar SVG/PNG **oficiales** de la dependencia con fondo y variante adecuados; no alterar forma, proporciones, separaciones, lema, efectos o color.

### Íconos

- Íconos de trazo simple, 20–24px, grosor visual constante, sin colores decorativos múltiples.
- Metáforas universitarias reconocibles: libro/biblioteca, calendario, documento/trámite, edificio/campus, lupa/búsqueda, correo/contacto, mapa/ubicación.
- Acompañar íconos con texto cuando comunican tareas; un ícono por sí solo rara vez es suficiente para trámites.

### Gráficas y datos

- Base con azul institucional; paleta secundaria distinta por serie con contraste verificado.
- Incluir títulos, unidades, ejes, leyendas, fechas de corte y fuente; datos descargables si es factible.
- No confiar solo en pares azul/oro para series múltiples; añadir forma, etiqueta directa o patrones si procede.

---

## 10. Accesibilidad, responsive, contenido y movimiento

### Accesibilidad (requisito de implementación)

- Objetivo **WCAG 2.2 AA**; probar teclado completo y lector de pantalla.
- Texto ≥4.5:1 y texto grande ≥3:1; componentes gráficos relevantes ≥3:1; foco siempre visible.
- Objetivos táctiles preferentemente ≥44×44px (más generoso que el mínimo de WCAG 2.2 AA), salvo excepciones documentadas.
- HTML semántico: `header`, `nav`, `main`, `section`, `article`, `aside`, `footer`; headings sin saltos arbitrarios.
- Imágenes con textos esenciales deben acompañarse de versiones HTML accesibles; video con subtítulos y audio de contenido con transcripción según proceda.
- Trámites: etiquetas permanentes, mensajes de error específicos, revisión antes de envío y explicaciones claras de requisitos.
- No bloquear zoom hasta 200%; comprobar reflow a 320px de viewport o zoom equivalente; sin scroll horizontal de la página.
- Preferencias `prefers-reduced-motion`, `forced-colors` y enfoque visible.

### Movimiento

- Duraciones 120–200ms para hover/foco y 180–280ms para popovers/menus.
- Easing `cubic-bezier(0.2, 0, 0, 1)`; transiciones en opacidad/transform si tienen sentido.
- No autoplay de carrusel de contenido esencial. Si existe por razón editorial, controles de pausa y navegación, anuncio de posición y respeto al movimiento reducido.
- Evitar parallax, scrolljacking y animaciones de titulares.

### Redacción y gobierno editorial

- Voces: institucional, precisa, cercana sin coloquialismos excesivos; lenguaje incluyente y consistente con la dependencia.
- Títulos por acción o tema; resúmenes escaneables; fechas absolutas en noticias y convocatorias, no solo “ayer” o “mañana”.
- Cada convocatoria debe tener vigencia, organizador, documento de referencia y enlace real.
- Avisos delicados o información de emergencia deben indicar autoría/actualización y no presentarse como confirmados sin verificación.
- Para documentos, proporcionar HTML accesible cuando sea posible además de PDF.

### Rendimiento

- Optimizar LCP (<2.5s recomendado), CLS (<0.1), INP (<200ms) con evaluación real en campo.
- Imágenes `srcset` y formatos eficientes con fallback; reservar tamaños para evitar saltos.
- Carga diferida de media bajo el primer pliegue; no retrasar la imagen LCP.
- CSS crítico ligero, JS progresivo y caché responsable; no exigir una conexión rápida para trámites.

---

## 11. Do's and Don'ts

### Do

- Conservar identidad verificable de UNAM y de la dependencia propietaria.
- Para productos **FES Aragón**, usar `#002F6C` como azul principal y `#F2A900` como acento restringido según su guía.
- Mostrar las tareas universitarias más usadas en la parte alta de la pantalla.
- Elegir encabezados claros, texto legible, fotografía documental y tarjetas de 12px de radio.
- Distinguir noticias, convocatorias, avisos urgentes y servicios por estructura y etiqueta, no solo color.
- Usar fondos blancos o grises claros como norma; preferir cuerpo oscuro y contrastado.
- Proporcionar breadcrumb, búsqueda y navegación móvil utilizable.
- Construir widgets a partir de tokens semánticos en lugar de HEX repetidos a mano.
- Implementar controles y formularios accesibles con estados completos.
- Citar fuentes y fechas de los datos administrativos y públicos.

### Don't

- No afirmar que existe **un par HEX universal** compartido por todas las dependencias UNAM.
- No recolorear, deformar, reinterpretar ni generar artificialmente el escudo.
- No usar `#F2A900` para texto pequeño sobre blanco ni como fondo dominante.
- No mezclar el azul de Aragón con oro de otra unidad en los materiales oficiales de una facultad.
- No clonar la estética de una página comercial o startup genérica: gradientes saturados, tarjetas enormes, sombras intensas y CTA por todas partes.
- No ocultar fecha límite, requisitos, organizador o fuente en un folleto PDF sin equivalentes accesibles.
- No usar carruseles automáticos para avisos imprescindibles.
- No colocar 20 enlaces al mismo nivel jerárquico en la barra principal; organizar por audiencia y tarea.
- No llamar “oficial” a un color, fuente o distribución que esta guía identifica como propuesta.

---

## 12. Agent Prompt Guide

> Construye una plataforma web UNAM con estilo institucional contemporáneo, tomando como referencia el portal central UNAM, la estructura de servicios de la FES Aragón y la presentación académica/editorial de la Facultad de Arquitectura. El diseño es sobrio, responsive, accesible y orientado a tareas. Usa superficies blancas y gris claro, tipografía sans legible, navegación por audiencia, fotografías universitarias reales, componentes rectangulares con radios moderados y apenas sombras. Selecciona un tema de dependencia explícito; si es FES Aragón, azul `#002F6C` y amarillo `#F2A900` **solo como acento** conforme a su identidad gráfica publicada. No alteres el escudo, no inventes emblemas ni confundas tokens propuestos con lineamientos oficiales. Crea páginas con búsqueda, accesos rápidos, noticias, convocatorias, agenda, servicios y footer institucional; estados de formularios y datos con fuente. Cumple WCAG 2.2 AA. Usa los tokens de este documento y todas sus restricciones.

**Guía rápida por escenario:**

- **Home de Facultad:** franja de identidad → menú breve → hero fotográfico → trámites principales → oferta académica → noticias → calendario → footer.
- **Portal de trámites:** búsqueda y perfil de audiencia primero → categorías de servicio → requisitos de cada trámite → formularios y seguimiento → soporte/contacto.
- **Noticias/Divulgación:** imagen real y contenido editorial primero → categorías → fechas/autores → listas de artículos → archivo/boletín.
- **Dashboard:** cabecera UNAM verificada → fuente y corte temporal → filtros → KPI → gráficos etiquetados → tablas de respaldo y metodología.

---

## 13. Quick Start — CSS Custom Properties

```css
:root {
  /* Tema de implementación FES Aragón — marca documentada */
  --brand-primary: #002F6C;
  --brand-accent: #F2A900;

  /* Colores UI — recomendaciones del design system */
  --color-primary-900: #0B2342;
  --color-primary-700: #002F6C;
  --color-primary-600: #154A86;
  --color-primary-050: #EAF0F8;
  --color-primary-025: #F3F7FC;
  --color-accent: #F2A900;
  --color-accent-soft: #FFF4D6;
  --color-link: #163C70;
  --color-text: #182333;
  --color-text-muted: #4D5B70;
  --color-text-inverse: #FFFFFF;
  --color-white: #FFFFFF;
  --color-surface: #FFFFFF;
  --color-surface-muted: #F5F7FA;
  --color-border: #D9E0E8;
  --color-border-strong: #9CABBB;
  --color-success: #237647;
  --color-success-soft: #EAF5EE;
  --color-warning: #8A5800;
  --color-warning-soft: #FFF2D2;
  --color-error: #B42336;
  --color-error-soft: #FDECEF;
  --color-info: #175A91;
  --color-info-soft: #E9F3FB;

  /* Tipografía propuesta, no tipografía institucional certificada */
  --font-sans: "Inter", Arial, Helvetica, system-ui, sans-serif;
  --font-editorial: "Source Serif 4", Georgia, serif;
  --font-mono: ui-monospace, SFMono-Regular, Consolas, monospace;
  --text-display: clamp(2.25rem, 4vw, 3.5rem);
  --text-h1: clamp(2rem, 3.2vw, 2.75rem);
  --text-h2: clamp(1.625rem, 2.5vw, 2rem);
  --text-h3: clamp(1.375rem, 2vw, 1.5rem);
  --text-h4: 1.25rem;
  --text-lead: clamp(1.125rem, 1.4vw, 1.25rem);
  --text-body: 1rem;
  --text-small: .875rem;
  --text-meta: .8125rem;
  --text-nav: .9375rem;
  --text-control: .875rem;
  --text-stat: clamp(2rem, 3vw, 2.5rem);

  /* Escala espacial */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;

  /* Geometría y elevación */
  --radius-none: 0px;
  --radius-xs: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-pill: 999px;
  --border-default: 1px solid var(--color-border);
  --border-accent: 3px solid var(--brand-accent);
  --shadow-none: none;
  --shadow-card: 0 2px 12px rgb(11 35 66 / 6%);
  --shadow-dropdown: 0 12px 32px rgb(11 35 66 / 14%);
  --shadow-dialog: 0 24px 64px rgb(11 35 66 / 20%);

  /* Layout */
  --container-max: 1280px;
  --container-prose: 760px;
  --section-gap: 64px;
  --card-padding: 24px;
  --control-height: 44px;
  --focus-ring: 3px solid #F2A900;
  --motion-fast: 150ms;
  --motion-standard: 240ms;
}

/* Tema opcional: NO intercambiar los colores en archivos de escudo. */
[data-unam-theme="medicina-reference"] {
  --brand-primary: #002B7A;
  --brand-accent: #D59F0F;
  /* Solo activar con autorización de identidad de la entidad. */
}

/* Los controles se enlazan a SEMÁNTICA, no a HEX locales. */
.site-shell {
  background: var(--color-surface);
  color: var(--color-text);
  font-family: var(--font-sans);
  font-size: var(--text-body);
  line-height: 1.65;
}

.container {
  width: min(100% - 32px, var(--container-max));
  margin-inline: auto;
}

.prose { max-width: var(--container-prose); }

.button-primary {
  min-height: var(--control-height);
  padding: 10px 20px;
  border: 1px solid var(--brand-primary);
  border-radius: var(--radius-md);
  background: var(--brand-primary);
  color: #FFFFFF;
  font: 600 var(--text-control)/1.35 var(--font-sans);
  cursor: pointer;
}

.button-primary:hover { background: var(--color-primary-600); }

:where(a, button, input, select, textarea, summary):focus-visible {
  outline: var(--focus-ring);
  outline-offset: 3px;
}

@media (min-width: 640px) {
  .container { width: min(100% - 48px, var(--container-max)); }
}
@media (min-width: 1024px) {
  .container { width: min(100% - 64px, var(--container-max)); }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Nota de implementación:** si se crean nuevos temas, hacer que `.button-primary` y otros componentes utilicen tokens derivados de tema (`--button-primary-bg`, `--button-primary-bg-hover`, etc.) para evitar que el estado hover conserve tonos de Aragón en otro tema. Las variantes cromáticas mostradas son **referencias de manuales de unidades**, no skins oficiales universales.

### Tailwind CSS v4 — puente de tokens

```css
/* Importar el archivo de tokens que define :root ANTES de este bloque. */
@import "tailwindcss";

@theme inline {
  --color-unam-primary: var(--brand-primary);
  --color-unam-accent: var(--brand-accent);
  --color-unam-ink: var(--color-text);
  --color-unam-muted: var(--color-text-muted);
  --color-unam-surface: var(--color-surface);
  --color-unam-soft: var(--color-surface-muted);
  --color-unam-border: var(--color-border);
  --color-unam-link: var(--color-link);
  --font-unam-sans: var(--font-sans);
  --font-unam-editorial: var(--font-editorial);
  --radius-unam: var(--radius-md);
  --radius-unam-card: var(--radius-lg);
  --shadow-unam-card: var(--shadow-card);
}
```

**Recomendación:** almacenar los colores y espaciados en un único origen de verdad y derivar de él CSS/Tailwind/React; no mantener dos paletas manuales divergentes.

---

## 14. Checklist de aceptación para equipos y agentes

**Marca y contenido**

- [ ] El perfil de dependencia y su manual vigente están confirmados.
- [ ] Escudo institucional auténtico, sin alteración y con enlace apropiado.
- [ ] Amarillo/oro limitado a acentos según la norma local.
- [ ] Se distingue contenido editorial, convocatoria, trámite y aviso urgente.
- [ ] Cada fecha, cifra, costo, requisito o plazo tiene origen verificable.

**Interfaz y experiencia**

- [ ] H1 único; navegación por tareas o audiencia, no organigrama bruto.
- [ ] Búsqueda y accesos prioritarios visibles en móvil.
- [ ] Footer con contacto, avisos de privacidad y responsable real.
- [ ] Estados hover/focus/disabled/loading/empty/error/success completos.
- [ ] Mismo lenguaje de cards, inputs, botones, tablas y alertas.
- [ ] No hay dependencia de sliders automáticos para información esencial.

**Accesibilidad y rendimiento**

- [ ] Contrastes, navegación por teclado y foco revisados.
- [ ] Formularios con etiquetas, ayuda, errores y confirmación confiable.
- [ ] Imágenes con alt, media con descripciones y recursos académicos accesibles.
- [ ] Layout comprobado a 320, 375, 768, 1024 y 1440px.
- [ ] Se verifica LCP, CLS e INP con mediciones reales, no solo simulaciones.
- [ ] No hay marcas de agua o assets institucionales de origen dudoso.

---

## 15. Fuentes, precedencia y limitaciones

| Fuente | Qué aporta | Alcance |
|---|---|---|
| [UNAM — Portal institucional](https://www.unam.mx/inicio) | Audiencias, navegación, boletines, noticias, agenda y jerarquía de portal. | Sitio central consultado. |
| [FES Aragón — Portal](https://www.aragon.unam.mx/fes-aragon/#!/inicio) | Agrupación de oferta académica, investigación, servicios, vida universitaria, avisos y enlaces. | Sede analizada. |
| [FES Aragón — Elementos gráficos institucionales](https://www.aragon.unam.mx/fes-aragon/public_html/documents/comunicacion_social/identidad-institucional.pdf) | Azul Pantone 294 C `#002F6C`, amarillo Pantone 130 C `#F2A900`; restricciones de uso del amarillo. | **Fuente de marca prioritaria para un producto FES Aragón.** |
| [Facultad de Arquitectura — Portal](https://arquitectura.unam.mx/) | Organización por audiencias, boletín, vida académica, fotografías y estructura editorial. | Sede analizada. |
| [Facultad de Arquitectura — Imagen institucional](https://arquitectura.unam.mx/facultad/imagen-institucional) | Existencia de escudos, logotipos oficiales y firma UNAM descargable. | Fuente de assets; usar versiones autorizadas. |
| [CCH Oriente — Identidad y colores](https://www.cch-oriente.unam.mx/secretarias/general/imprenta/logos.html) | Pares HEX y tipografía propios de la unidad, verificando diversidad entre dependencias. | Referencia comparativa, no norma general. |
| [Facultad de Medicina — manual de comunicación (transcripción)](https://es.readkong.com/page/manual-de-identidad-grafica-coordinacion-de-comunicacion-8531672) | Par azul/oro de esa facultad y criterios de encabezados, menús, fondos claros, tipografía y diseño responsive. | Guía de facultad; se consultó una transcripción de terceros. |
| [Facultad de Filosofía y Letras — Manual de identidad](https://sistemaintegral.filos.unam.mx/acceso/manual-de-identidad-grafica_ffyl.pdf) | Recomendación de uniformidad de header/footer, responsividad, avisos de privacidad e identidad por facultad. | Documento de otra unidad; referencia transversal. |
| [FES Aragón — manual anterior, 2015 (reproducción)](https://1library.co/document/ye12r31z-manual-de-identidad-gr%C3%A1fica-fes-arag%C3%B3n.html) | Colores heredados `#293E6B` / `#B6985E`. | Histórico; **no prevalece sobre guía más reciente de Aragón**. |
| [W3C — WCAG 2.2](https://www.w3.org/TR/WCAG22/) | Contraste, navegación por teclado, objetivos táctiles y requisitos de accesibilidad. | Estándar técnico transversal. |

### Limitaciones explícitas

- Los portales **no exponen aquí medidas auditadas de todos sus estilos CSS**. La escala de espaciado, familias sugeridas, bordes, breakpoints y componentes se **diseñaron como propuesta implementable**, no se extrajeron pixel a pixel de cada página.
- La presencia de **manuales distintos por dependencia** impide declarar un único HEX obligatorio para todo `*.unam.mx`.
- Las páginas contienen campañas, fotografía y avisos cambiantes; sus colores temporales **no** se convierten automáticamente en tokens de marca.
- Todo uso institucional público de marca y materiales debe verificarse con la instancia universitaria correspondiente, especialmente antes de una publicación oficial o impresión.

**Regla final:** ser **reconociblemente UNAM** sin inventar normatividad; ser **inequívocamente de la facultad correspondiente** al aplicar su tema y escudos oficiales; y ser **mejor interfaz** que una reproducción literal de estructuras antiguas.
