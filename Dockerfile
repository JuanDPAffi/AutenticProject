# Imagen base con Node.js
FROM node:20

# Instalar LibreOffice para la conversión de DOCX a PDF
RUN apt-get update && \
    apt-get install -y libreoffice && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Establecer directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiar archivos de dependencias e instalar
COPY package*.json ./
RUN npm install

# Copiar todo el proyecto
COPY . .

# Crear carpeta de contratos y dar permisos (por si necesitas escribir en runtime)
RUN mkdir -p src/contratos && chmod -R 755 src/contratos

# Exponer el puerto 3000 que usa tu app
EXPOSE 80

# Comando por defecto para iniciar la aplicación
CMD ["node", "src/server.js"]