// Contiene los textos y recursos iniciales de las tres conferencias. db:seed los copia a
// MariaDB sólo cuando aún no existen.
// Esta función reúne las tres versiones de una foto: pequeña, mediana y original, junto
// con su descripción y medidas.
const foto = (nombre, alt, caption, width, height) => ({
  src: `/media/${nombre}.webp`,
  thumb: `/media/${nombre}-960.webp`,
  small: `/media/${nombre}-480.webp`,
  alt,
  caption,
  width,
  height,
});
// Las fotos usan nombres de public/media. Aquí sólo guardamos sus rutas; las imágenes no
// se meten dentro de la base de datos.
const awsEquipo = foto(
  "aws-equipo",
  "Organizadores del encuentro AWS frente al escenario de la FES Aragón",
  "La comunidad AWS en el encuentro Infraestructura del mañana.",
  1280,
  757,
);
const awsBrenda = foto(
  "aws-brenda",
  "Brenda Bravo durante su intervención en el encuentro AWS",
  "Brenda Bravo compartió su experiencia profesional en arquitectura de integración.",
  1280,
  1005,
);
const awsSebastian = foto(
  "aws-sebastian",
  "Sebastián Vázquez durante su presentación sobre EnCore",
  "La presentación de EnCore acercó un proyecto universitario a la comunidad.",
  1280,
  719,
);
const omar = foto(
  "omar-conferencia",
  "Vista del auditorio durante la conferencia sobre sostenibilidad de los datos",
  "Una conversación sobre datos, software y soberanía tecnológica.",
  1034,
  768,
);
const hello = foto(
  "hello-conferencia",
  "Estudiantes y ponentes de Hello World reunidos en el auditorio A1",
  "El auditorio A1 durante la presentación del club Hello World.",
  1600,
  737,
);
const helloEquipo = foto(
  "hello-equipo",
  "Participantes del club Hello World en su conferencia de la Semana de Ingeniería",
  "Una comunidad estudiantil que comparte proyectos y oportunidades.",
  1600,
  1200,
);

// Cada objeto representa una conferencia: datos generales y un contenido JSON con
// secciones, participantes y materiales.
export const conferencias = [
  {
// Encuentro AWS: reúne tres intervenciones dentro de una misma conferencia.
    slug: "infraestructura-del-manana",
    orden: 1,
    titulo:
      "Infraestructura del mañana: conectando núcleos, Wall Street y nube",
    categoria: "Nube e inteligencia artificial",
    fecha: "2026-09-25",
    horario: "17:00–18:30 h",
    sede: "Auditorio del DUACyD",
    resumen:
      "Trayectorias profesionales, agentes serverless y desarrollo con inteligencia artificial: tres miradas a la tecnología que se construye desde la comunidad.",
    contenido: {
      corto: "Infraestructura del mañana",
      organizador: "AWS Student Builder Group UNAM y FES Aragón",
      imagen: awsEquipo,
      introduccion:
        "La Semana de Ingeniería reunió experiencias de la industria y proyectos universitarios en un mismo encuentro. Brenda Bravo, Sebastián Vázquez, Daniel Rodríguez y Carlos Sánchez acercaron a la comunidad distintas formas de diseñar, construir y evaluar soluciones tecnológicas.",
      ponentes: [
        { nombre: "Brenda Bravo", rol: "Integration Architect · ZIES" },
        {
          nombre: "Sebastián Vázquez",
          rol: "Core Team AWS SBG UNAM · Geofísica UNAM",
        },
        {
          nombre: "Daniel Rodríguez",
          rol: "Core Team AWS SBG UNAM · Geofísica UNAM",
        },
        {
          nombre: "Carlos Sánchez",
          rol: "Machine Learning Engineer · Mercado Libre",
        },
      ],
      programa: [
        {
          titulo: "De FES Aragón a ser Architect en el Wall Street de Latam",
          participantes: "Brenda Bravo",
          texto:
            "Una intervención que puso en contacto la formación en Aragón con la experiencia profesional en arquitectura de integración. Su participación abrió una perspectiva sobre las trayectorias que pueden construirse después de la universidad.",
        },
        {
          titulo: "EnCore: un agente serverless para el Instituto de Geofísica",
          participantes: "Sebastián Vázquez y Daniel Rodríguez",
          texto:
            "Un proyecto vinculado con el Instituto de Geofísica de la UNAM mostró cómo la comunidad estudiantil participa en el desarrollo de soluciones reales. El bloque acercó el trabajo con agentes y arquitecturas serverless al contexto universitario.",
        },
        {
          titulo:
            "Spec Driven Development: la nueva forma de programar en el mundo real",
          participantes: "Carlos Sánchez",
          texto:
            "Carlos presentó un flujo de desarrollo en el que las especificaciones preceden a la generación de código. Mediante una demostración con OpenSpec, explicó cómo definir tareas, orientar a los agentes de IA y revisar que la implementación responda a lo solicitado.",
        },
      ],
      secciones: [
        {
          titulo: "Especificar antes de generar",
          texto:
            "La reseña de la intervención de Carlos destaca una diferencia entre explorar una idea mediante vibe coding y construir una funcionalidad a partir de requisitos explícitos. Las especificaciones en Markdown ayudan a establecer qué debe producir el agente y ofrecen un punto de referencia para evaluar su trabajo.",
        },
        {
          titulo: "El criterio sigue siendo del ingeniero",
          texto:
            "Los agentes pueden acelerar la implementación, pero también introducir errores o interpretar mal una instrucción. Comprender programación, arquitectura y buenas prácticas sigue siendo necesario para supervisar los resultados y asumir la responsabilidad de una solución.",
        },
      ],
      aprendizajes: [
        "Definir requisitos claros antes de delegar una implementación a un agente.",
        "Revisar el código generado con conocimientos de programación y arquitectura.",
        "Relacionar los proyectos universitarios con experiencias reales de la industria.",
      ],
      pregunta:
        "¿Qué debería contener una buena especificación para orientar a un agente de IA?",
      fotos: [awsEquipo, awsBrenda, awsSebastian],
      materiales: [
        {
          titulo: "Cartel original del encuentro",
          url: "/media/aws-cartel.webp",
          detalle:
            "Imagen · convocatoria previa. El horario y la sede confirmados aparecen en esta página.",
        },
      ],
      fuente:
        "Programa del flyer AWS, presentación de Hello World y reseña académica de Jesús Sebastián Vázquez Zarco sobre la intervención de Carlos Sánchez. Sede y horario confirmados por el autor del proyecto.",
    },
  },
  {
// Conferencia del Dr. Omar: no se inventan fecha, horario ni sede cuando no están
// confirmados.
    slug: "sostenibilidad-de-los-datos",
    orden: 2,
    titulo: "Sostenibilidad en los datos: software y soberanía tecnológica",
    categoria: "Datos y soberanía tecnológica",
    fecha: null,
    horario: null,
    sede: null,
    resumen:
      "Conservar información también significa preservar su contexto, sus herramientas y el conocimiento de las personas que la hacen útil.",
    contenido: {
      corto: "Sostenibilidad en los datos",
      organizador: "Semana de Ingeniería · FES Aragón",
      imagen: omar,
      introduccion:
        "El Dr. Omar Mendoza González propuso mirar la sostenibilidad tecnológica más allá del almacenamiento. En universidades y proyectos de investigación, mantener datos útiles a largo plazo requiere cuidar el software, documentar procesos y formar a quienes darán continuidad al trabajo.",
      ponentes: [
        {
          nombre: "Dr. Omar Mendoza González",
          rol: "Ponente · sostenibilidad de los datos",
        },
      ],
      programa: [],
      secciones: [
        {
          titulo: "Guardar archivos no basta",
          texto:
            "La información puede seguir almacenada y perder su utilidad si desaparece el contexto en el que se produjo. Entender qué representan los datos, cómo se obtuvieron y qué herramientas permiten consultarlos forma parte de su preservación.",
        },
        {
          titulo: "Volumen, velocidad y variedad",
          texto:
            "La conferencia abordó el crecimiento de la información desde estas tres características. El reto incluye administrar cantidades cada vez mayores de datos, producidos con rapidez y en formatos distintos, manteniendo criterios para decidir qué conservar.",
        },
        {
          titulo: "Las personas también son infraestructura",
          texto:
            "Un sistema se vuelve frágil cuando solo una persona conoce su funcionamiento. La documentación, la capacitación y la transferencia de conocimiento permiten que otras personas puedan mantenerlo, comprenderlo y continuar su desarrollo.",
        },
        {
          titulo: "Soberanía y continuidad",
          texto:
            "La capacidad de una institución para administrar sus sistemas a largo plazo depende de sus herramientas y de su comunidad. La obsolescencia del software y los cambios en los equipos requieren procesos que conserven tanto la información como la capacidad de utilizarla.",
        },
      ],
      aprendizajes: [
        "Preservar el contexto de los datos junto con los archivos.",
        "Documentar y compartir el conocimiento necesario para mantener los sistemas.",
        "Formar nuevas personas que puedan dar continuidad a los proyectos.",
      ],
      pregunta:
        "¿Cómo evitarías que un proyecto dependa del conocimiento de una sola persona?",
      fotos: [omar],
      materiales: [],
      fuente:
        "Síntesis de la reseña académica de Jesús Sebastián Vázquez Zarco: Asistencia y participación ponencias. Las reflexiones se adaptaron para este proyecto académico.",
    },
  },
  {
// Hello World: incluye el equipo, fotografías y acceso a su presentación original.
    slug: "hello-world",
    orden: 3,
    titulo: "De “Hello World” a proyectos con impacto real",
    categoria: "Comunidad y proyectos",
    fecha: "2026-09-23",
    horario: "12:30 h",
    sede: "Auditorio A1",
    resumen:
      "Una comunidad hecha por y para estudiantes de FES Aragón: aprender en equipo, construir proyectos y conectar con nuevas oportunidades.",
    contenido: {
      corto: "De Hello World a proyectos con impacto real",
      organizador: "Club Hello World · FES Aragón",
      imagen: helloEquipo,
      introduccion:
        "Hello World compartió con la comunidad de Aragón lo que ocurre cuando el aprendizaje sale del aula y se convierte en colaboración. La presentación reunió proyectos, experiencias en hackatones y vínculos con universidades, empresas y comunidades tecnológicas.",
      ponentes: [
        { nombre: "Ana Martínez", rol: "Presidenta del club" },
        { nombre: "Sebastián Vázquez", rol: "Vicepresidente del club" },
        { nombre: "Enrique Cano", rol: "Secretario técnico" },
        { nombre: "Jessica Almaguer", rol: "Secretaria de comunicación" },
        { nombre: "Valentina Cruz", rol: "Miembro del club" },
        { nombre: "Víctor Caldera", rol: "Miembro del club" },
      ],
      programa: [],
      secciones: [
        {
          titulo: "Aprender, construir y competir",
          texto:
            "La presentación organizó los objetivos del club en tres acciones: aprender mediante talleres y formación técnica, construir proyectos y colaboraciones, y competir para poner a prueba lo aprendido. La comunidad ofrece un espacio para practicar con otras personas.",
        },
        {
          titulo: "Proyectos que salen del aula",
          texto:
            "Entre las experiencias compartidas estuvieron la participación en HackODS UNAM, el tercer lugar en Compufest y el desarrollo de la página web del club. También se presentaron iniciativas y vínculos con comunidades como CROFI, mostrando distintas formas de involucrarse en tecnología.",
        },
        {
          titulo: "Conectar abre posibilidades",
          texto:
            "Universidades, empresas y comunidades aparecieron como tres espacios para encontrar oportunidades. Las experiencias en eventos, visitas y hackatones ilustraron cómo el trabajo colectivo puede ampliar la formación y las relaciones profesionales de los estudiantes.",
        },
      ],
      aprendizajes: [
        "Convertir lo aprendido en proyectos compartidos.",
        "Participar en retos y hackatones como experiencias de formación.",
        "Construir vínculos con otras comunidades dentro y fuera de la universidad.",
      ],
      pregunta:
        "¿Qué proyecto te gustaría construir junto con una comunidad estudiantil?",
      fotos: [hello, helloEquipo],
      materiales: [
        {
          titulo: "Presentación de Hello World",
          url: "/conferencias/hello-world/materiales",
          detalle:
            "29 diapositivas · presentación original del 23 de septiembre de 2026.",
        },
        {
          titulo: "Cartel de la conferencia",
          url: "/media/hello-cartel.webp",
          detalle:
            "Imagen · convocatoria de la presentación en el auditorio A1.",
        },
      ],
      fuente:
        "Presentación De “Hello World” a proyectos con impacto real, equipo Hello World, 23 de septiembre de 2026; flyer y fotografías proporcionados por el autor del proyecto.",
    },
  },
];
