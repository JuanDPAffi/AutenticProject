// src/services/tokenManager.js

import axios from "axios";

class TokenManager {
  constructor(config) {
    this.config = config;
    this.token = null;
    this.expiracion = null;
    this.refreshPromise = null; // Evita solicitudes simultáneas de token
    this.lockTimeout = 10000; // Timeout del lock: 10 segundos
  }

  /**
   * Obtiene un token válido (con protección contra race conditions)
   */
  async obtenerToken() {
    const ahora = Date.now();

    // ✅ 1. Si hay token válido en caché, usarlo
    if (this.token && this.expiracion && ahora < this.expiracion) {
      console.log("🔑 Usando token en caché");
      return this.token;
    }

    // ✅ 2. Si ya hay otro proceso solicitando token, esperar su resultado
    if (this.refreshPromise) {
      console.log("⏳ Esperando token en renovación...");
      try {
        return await this.refreshPromise;
      } catch (error) {
        // Si falló, intentar nosotros mismos
        console.log("⚠️ Renovación anterior falló, intentando nuevamente...");
      }
    }

    // ✅ 3. Crear nueva promesa de renovación (otros esperarán esta)
    this.refreshPromise = this._solicitarNuevoToken();

    try {
      const nuevoToken = await this.refreshPromise;
      return nuevoToken;
    } finally {
      // Liberar el lock después de un tiempo
      setTimeout(() => {
        this.refreshPromise = null;
      }, this.lockTimeout);
    }
  }

  /**
   * Solicita un nuevo token a Autentic (privado)
   */
  async _solicitarNuevoToken() {
    try {
      console.log("📤 Solicitando nuevo token de Autentic...");

      const tokenUrl = "https://authorizer.autenticsign.com/v2/authorizer/getToken";
      const payload = {
        audience: this.config.audience,
        grant_type: "client_credentials",
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret
      };

      const response = await axios.post(tokenUrl, payload, {
        timeout: 15000,
        headers: { "Content-Type": "application/json" }
      });

      if (!response.data?.access_token) {
        throw new Error("Token no recibido en la respuesta de Autentic");
      }

      const ahora = Date.now();
      this.token = response.data.access_token;
      this.expiracion = ahora + (5 * 60 * 1000); // 5 minutos

      console.log("🔑 Token obtenido y cacheado exitosamente (válido por 5 min)");
      return this.token;

    } catch (error) {
      // Limpiar caché en caso de error
      this.token = null;
      this.expiracion = null;

      console.error("❌ Error obteniendo token:", error.response?.data || error.message);
      throw new Error(`Fallo al obtener token de Autentic: ${error.message}`);
    }
  }

  /**
   * Invalida el token actual (útil cuando detectas un 401)
   */
  invalidar() {
    console.log("🔄 Invalidando token...");
    this.token = null;
    this.expiracion = null;
    this.refreshPromise = null;
  }

  /**
   * Verifica si el token actual es válido
   */
  esValido() {
    return this.token && this.expiracion && Date.now() < this.expiracion;
  }
}

export default TokenManager;