# Imagen base con Node.js
FROM node:18

# Instalar LibreOffice
RUN apt-get update && \
    apt-get install -y libreoffice && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Crear directorio de la aplicación
WORKDIR /app

# Copiar package.json e instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el resto del proyecto
COPY . .

# Exponer el puerto (por si lo necesitas localmente)
EXPOSE 3000

# Comando de arranque
CMD ["node", "src/server.js"]
