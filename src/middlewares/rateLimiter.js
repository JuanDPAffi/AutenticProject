// src/middlewares/rateLimiter.js

class RateLimiter {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.requestsPerSecond = 5; // Máximo 5 requests por segundo
    this.delayBetweenRequests = 1000 / this.requestsPerSecond; // 200ms entre requests
  }

  async add(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    while (this.queue.length > 0) {
      const { fn, resolve, reject } = this.queue.shift();
      
      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        reject(error);
      }

      // ⏱️ Esperar antes de procesar el siguiente
      if (this.queue.length > 0) {
        await this.delay(this.delayBetweenRequests);
      }
    }

    this.processing = false;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Instancia global del rate limiter
const rateLimiter = new RateLimiter();

export default rateLimiter;