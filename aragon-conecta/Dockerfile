# Instrucciones para construir la imagen de la aplicación. Cada paso prepara algo que
# estará disponible dentro del contenedor.
# Usa Node.js 22 como base y fija la misma versión principal que pide el proyecto.
FROM node:22-bookworm-slim
ENV NODE_ENV=production
# A partir de aquí, las rutas de trabajo dentro del contenedor parten de /app.
WORKDIR /app
# Copia primero las dependencias para aprovechar la caché cuando sólo cambia el código.
COPY package.json package-lock.json ./
# Instala exactamente lo fijado por package-lock, sin herramientas de desarrollo.
RUN npm ci --omit=dev && npm cache clean --force
# Copia el código y asigna su propiedad al usuario que ejecutará Node. .dockerignore
# excluye claves y archivos innecesarios.
COPY --chown=node:node . .
# La aplicación corre como usuario node, sin permisos de administrador del contenedor.
USER node
# Indica el puerto interno de la aplicación; los puertos del equipo anfitrión se definen
# en Compose.
EXPOSE 2800
# Consulta /health para que Docker pueda detectar si la aplicación y la base responden.
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||2800)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
# Antes de abrir el servidor, prepara las tablas y carga los datos iniciales que todavía
# no existan.
CMD ["sh", "-c", "node scripts/db-init.js && node scripts/db-seed.js && exec node index.js"]
