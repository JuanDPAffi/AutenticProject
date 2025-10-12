// src/middlewares/simpleRateLimiter.js

class SimpleRateLimiter {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.delayBetweenRequests = 200; // 200ms entre requests = 5 req/segundo
  }

  /**
   * Procesa requests UNO POR UNO
   */
  async add(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.processQueue();
    });
  }

  /**
   * Procesa la cola secuencialmente
   */
  async processQueue() {
    // Si ya está procesando, no hacer nada
    if (this.processing) return;
    
    // Si no hay items, terminar
    if (this.queue.length === 0) return;

    this.processing = true;

    // Procesar items UNO POR UNO
    while (this.queue.length > 0) {
      const { fn, resolve, reject } = this.queue.shift();
      
      try {
        console.log(`📦 Procesando... (${this.queue.length} en cola)`);
        const result = await fn();
        resolve(result);
      } catch (error) {
        reject(error);
      }

      // ⏱️ Esperar antes del siguiente (evita saturar Autentic)
      if (this.queue.length > 0) {
        await this.delay(this.delayBetweenRequests);
      }
    }

    this.processing = false;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStats() {
    return {
      queueSize: this.queue.length,
      processing: this.processing
    };
  }
}

// Instancia global
const rateLimiter = new SimpleRateLimiter();

export default rateLimiter;