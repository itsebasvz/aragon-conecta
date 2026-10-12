# Assets institucionales · FES Aragón

Selección de **52 imágenes originales (5.15 MiB)** del [portal oficial de FES Aragón](https://www.aragon.unam.mx/fes-aragon/#!/inicio), recopiladas el **12 de octubre de 2026** para el desarrollo de la Semana de Ingeniería **2027-1**.

Abre **[index.html](index.html)** en el navegador para consultar la galería y buscar por nombre, carrera o carpeta. Funciona directamente desde el disco, sin servidor ni dependencias externas.

## Contenido

| Carpeta | Archivos | Contenido |
| --- | ---: | --- |
| `logos/` | 2 | Firmas institucionales UNAM y FES Aragón, en SVG. |
| `fotografias/campus/` | 6 | Torres, edificios, acceso, espacios y comunidad de la facultad. |
| `fotografias/ingenierias/` | 5 | Portadas de Civil, Computación, Eléctrica Electrónica, Industrial y Mecánica. |
| `ingenierias/computacion/` | 5 | Proyectos y actividades de archivo de Computación. |
| `ingenierias/industrial/` | 5 | Fotografías de clases y actividades, en la resolución completa disponible. |
| `ingenierias/mecanica/` | 3 | Taller, proyecto y equipo de robótica. |
| `banners/unam/` | 12 | Identificadores de Cultura, Gaceta, Biblioteca Digital, Deporte y otros servicios UNAM. |
| `banners/fes-aragon/` | 5 | Fotografías usadas como enlaces a identidad institucional, publicaciones y otros recursos. |
| `iconos/redes-sociales/` | 8 | SVG de las redes empleadas en el portal. |
| `mapas/` | 1 | Mapa publicado de la FES Aragón. |

## Recursos principales para la página

- [Firma UNAM](logos/logo-unam.svg) y [firma FES Aragón](logos/logo-fes-aragon.svg): archivos vectoriales del encabezado oficial. Ambos conservan el `viewBox` `0 0 541.1 137`; la firma UNAM contiene rellenos grises definidos en el original. Sus IDs son `unam` y `fes-aragon`, respectivamente, si se integran con `<use>`.
- [Torres](fotografias/campus/torres.jpg), [edificio A2](fotografias/campus/edificio-a2.jpg) y [vista de la facultad](fotografias/campus/nuestra-facultad.jpg): imágenes para portadas o secciones de sede.
- [Fotografías de las ingenierías](fotografias/ingenierias/): portadas de las cinco carreras, de 700 × 400 px.
- [Mapa de la facultad](mapas/mapa-fes-aragon.jpg): original de 2480 × 2459 px. Verificar las ubicaciones aplicables al evento antes de publicarlo.

Los identificadores de `banners/unam/` miden 200 × 150 px y están pensados para enlaces pequeños. Las imágenes editoriales de Computación y algunas de Mecánica incluyen textos de actividades anteriores; su contexto y fecha se conservan en la fuente.

Esta carpeta funciona como biblioteca de recursos del repositorio. Al integrarlos en la aplicación, colocar los archivos necesarios en el directorio que el servidor publique como contenido estático.

## Fuentes y conservación

[fuentes.json](fuentes.json) registra para cada recurso su ruta local, URL original, página de procedencia, tipo de contenido, dimensiones o `viewBox`, tamaño y SHA-256. Los bytes descargados se conservan sin transformación.

Las fuentes incluyen el encabezado y la portada del portal, las secciones de Nuestra Facultad y mapa, y las páginas y galerías de las cinco ingenierías. Se validaron los SVG como XML y las imágenes raster con su decodificador, además de revisar visualmente una hoja de contacto.

La imagen `industrial/carrusel/ingenieriaindustrial.jpg` y su enlace de versión completa devolvieron HTTP 404. Se omitió ese recurso; la descarga fallida está documentada en el registro de fuentes. La portada de Ingeniería Industrial sí está disponible en `fotografias/ingenierias/`.

## Identidad y atribución

Consultar el [manual de identidad institucional existente en el proyecto](../docs/identidad-institucional.pdf) y su [original oficial](https://www.aragon.unam.mx/fes-aragon/public_html/documents/comunicacion_social/identidad-institucional.pdf) al integrar escudos y firmas. Conservar proporciones, elementos y variantes institucionales.

El [portal de origen](https://www.aragon.unam.mx/fes-aragon/#!/inicio) declara una licencia [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) salvo indicación contraria y solicita citar la fuente y su dirección en reproducciones no lucrativas. Las marcas y los escudos tienen además sus lineamientos institucionales.

Atribución sugerida para los créditos del proyecto:

> Imágenes y recursos institucionales: Universidad Nacional Autónoma de México, Facultad de Estudios Superiores Aragón. Fuente: https://www.aragon.unam.mx/fes-aragon/ . Consultado el 12 de octubre de 2026.
