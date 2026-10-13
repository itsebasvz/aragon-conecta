// Arma el catálogo pequeño que usan las vistas y el carrito. Los precios son de ejemplo;
// no representan un cobro real.
import { conferencias } from "./conferencias.js";

// Precios de demostración en centavos de MXN. No representan una venta real.
const precios = {
  "infraestructura-del-manana": 25000,
  "sostenibilidad-de-los-datos": 15000,
  "hello-world": 10000,
};

// Toma el nombre y la imagen del contenido editorial y los une con el precio definido para
// cada slug.
export const catalogoBoletos = conferencias.map((conferencia) => ({
  slug: conferencia.slug,
  titulo: conferencia.contenido.corto,
  imagen: conferencia.contenido.imagen.small,
  precioCentavos: precios[conferencia.slug],
}));

// Los cálculos usan centavos enteros. Sólo al mostrar el precio se divide entre cien y se
// aplica el formato de MXN.
export const formatMoney = (centavos) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(centavos / 100);
