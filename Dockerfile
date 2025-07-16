# Imagen base oficial de Node.js
FROM node:20

# Instalar LibreOffice (para conversión DOCX → PDF)
RUN apt-get update && \
    apt-get install -y libreoffice && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Establecer el directorio de trabajo
WORKDIR /usr/src/app

# Copiar archivos de dependencias e instalar
COPY package*.json ./
RUN npm install

# Copiar el resto del proyecto
COPY . .

# Log visual para asegurarse que src/server.js existe
RUN echo "📁 Contenido de /usr/src/app/src" && \
    ls -la src

# Crear carpeta de contratos y dar permisos
RUN mkdir -p src/contratos && chmod -R 755 src/contratos

# Exponer el puerto (Azure usará process.env.PORT)
EXPOSE 3000

# Iniciar usando npm (respetando package.json y type: module)
CMD ["npm", "start"]
