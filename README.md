
# 🖋️ AutenTic – Automatización de Firma de Contratos Digitales

Este proyecto automatiza la generación, firma digital y almacenamiento de contratos utilizando las APIs de **AutenticSign**, **HubSpot**, **Microsoft Graph** y **MongoDB**, desplegado automáticamente en **Azure App Service (Docker)** desde **GitHub Actions**.

---

## 🧩 Objetivo del proyecto

Automatizar el proceso de firma digital de contratos de fianza enviados desde HubSpot, asegurando:

- Flujo de firma ordenado: cliente → gerencia comercial → gerencia general
- Almacenamiento seguro de contratos en HubSpot
- Notificaciones automáticas por email a firmantes y directores
- Registro de actividad en MongoDB

---

## 🚀 Tecnologías utilizadas

| Tecnología         | Descripción |
|--------------------|-------------|
| Node.js (ESM)      | Backend principal |
| MongoDB Atlas      | Almacenamiento de procesos y firmantes |
| AutenticSign API   | Firma digital de contratos |
| HubSpot API (OAuth2) | Upload de archivos y asociación |
| Microsoft Graph API| Envío de correos de recordatorio |
| LibreOffice Convert| Conversión de DOCX → PDF |
| Azure App Service  | Despliegue en contenedor Docker |
| GitHub Actions     | Automatización de CI/CD |

---

## 🗂️ Estructura de carpetas

```
src/
├── contratos/
├── controllers/
├── models/
├── routes/
├── services/
├── templates/
├── utils/
├── server.js
```

---

## 🔄 Flujo de trabajo paso a paso

1. **Inicio desde HubSpot**
2. **Generación del contrato**
3. **Conversión y envío a firma**
4. **Registro de firmas**
5. **Recordatorios automáticos**
6. **Correo a directores**
7. **Finalización y carga en HubSpot**

---

## 🛠️ Variables de entorno requeridas

```env
PORT=3000

AUTH_URL=
SIGNING_URL=
AUTENTIC_API_BASE=
END_POINT_API_GET_FILE=

AUDIENCE=
GRANT_TYPE=client_credentials
CLIENT_ID=
CLIENT_SECRET=

ENTERPRISE_ID=
SENDER_EMAIL=
SENDER_IDENTIFICATION=

CLIENT_ID_HUBSPOT=
CLIENT_SECRET_HUBSPOT=
END_POINT_GET_TOKEN_API_HUBSPOT=
SCOPE=
REFRESH_TOKEN_HUBSPOT=

MONGO_URI=
MONGO_DB=
USER_DB=
PASSWORD_DB=

CLIENT_SECRET_AD=
CLIENT_ID_AD=
TENANT_ID_AD=
GRAPH_SCOPE=

IMAGEN_NAME=
```

---

## ⚙️ Despliegue con GitHub Actions y Azure

Este proyecto se despliega automáticamente en Azure App Service mediante un workflow ubicado en:

```
.github/workflows/main_autenticsignintegracion.yml
```

### 📦 Dockerfile personalizado

```dockerfile
FROM node:20

RUN apt-get update && \
    apt-get install -y libreoffice && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

RUN echo "📁 Contenido de /usr/src/app/src" && \
    ls -la src

RUN mkdir -p src/contratos && chmod -R 755 src/contratos

EXPOSE 3000

CMD ["npm", "start"]
```

---

## 📨 Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/firmar` | Recibe datos de cliente y genera contrato |
| POST | `/api/procesos/consultarEstadoProceso` | Consulta en que estado se encuentra el proceso de firma |
| POST | `/api/adjuntarcontrato` | Descarga PDF firmado y lo sube a HubSpot |
| POST | `/api/procesos/correo` | Guarda registro de firma desde correo HTML en Power Automate|
| POST | `/api/hubspot/emailReminder` | Envía correo al firmante pendiente |
| POST | `/api/hubspot/emailReminderDirector` | Envía correo a director por zona |

---

## 📌 Consideraciones

- Todos los firmantes usan método OTP
- Archivos firmados se suben públicos (`PUBLIC_INDEXABLE`) a HubSpot
- El reglamento se adjunta como segundo archivo PDF

---

## 📬 Contacto

- Desarrollador actual: Juan Diego Pinilla Montoya
- Correo: juan.pinilla@affi.net
