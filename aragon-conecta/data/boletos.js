import { conferencias } from "./conferencias.js";

// Precios de demostración en centavos de MXN. No representan una venta real.
const precios = {
  "infraestructura-del-manana": 25000,
  "sostenibilidad-de-los-datos": 15000,
  "hello-world": 10000,
};

export const catalogoBoletos = conferencias.map((conferencia) => ({
  slug: conferencia.slug,
  titulo: conferencia.contenido.corto,
  imagen: conferencia.contenido.imagen.small,
  precioCentavos: precios[conferencia.slug],
}));

export const formatMoney = (centavos) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(centavos / 100);
