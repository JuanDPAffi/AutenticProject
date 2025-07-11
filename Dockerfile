# Imagen base con Node.js
FROM node:18

# Instalar LibreOffice
RUN apt-get update && \
    apt-get install -y libreoffice && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Crear directorio de la aplicación
WORKDIR /app

# Copiar archivos de dependencias e instalar
COPY package*.json ./
RUN npm install

# Copiar todo el proyecto
COPY . .

# Crear explícitamente la carpeta de contratos si no existe
RUN mkdir -p /app/src/contratos

# Establecer permisos (evita problemas con archivos de escritura en Docker)
RUN chmod -R 755 /app/src/contratos

# Exponer el puerto de la API
EXPOSE 3000

# Comando por defecto
CMD ["node", "src/server.js"]
