import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.MONGO_DB
    });
    console.log("✅ Conexión a MongoDB exitosa");
    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error al conectar a MongoDB:", error.message);
  }
}

testConnection();
