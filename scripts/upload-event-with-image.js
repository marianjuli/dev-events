/**
 * Script para crear un evento subiendo event1.png a Cloudinary.
 * Uso: node scripts/upload-event-with-image.js
 *
 * Asegúrate de tener el servidor Next.js corriendo (npm run dev)
 * y las variables de Cloudinary en .env.local
 */

const fs = require("fs");
const path = require("path");

const IMAGE_PATH = path.join(__dirname, "..", "public", "images", "event1.png");
const API_URL = "http://localhost:3000/api/events";

async function main() {
  if (!fs.existsSync(IMAGE_PATH)) {
    console.error("No se encontró la imagen:", IMAGE_PATH);
    process.exit(1);
  }

  const imageBuffer = fs.readFileSync(IMAGE_PATH);
  const base64 = imageBuffer.toString("base64");
  const imageDataUrl = `data:image/png;base64,${base64}`;

  const payload = {
    title: "Evento de ejemplo",
    description: "Descripción del evento de ejemplo con imagen local.",
    overview: "Resumen breve del evento.",
    image: imageDataUrl,
    venue: "Sala Principal",
    location: "Ciudad, País",
    date: "2025-02-15",
    time: "18:00",
    mode: "hybrid",
    audience: "Desarrolladores",
    agenda: ["Registro", "Presentación", "Networking"],
    organizer: "Tu Organización",
    tags: ["tech", "networking"],
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Error:", JSON.stringify(data, null, 2));
      process.exit(1);
    }

    console.log("Evento creado correctamente:", data.event?.title);
    console.log("Imagen en Cloudinary:", data.event?.image);
  } catch (err) {
    console.error("Error de conexión. ¿Está el servidor corriendo (npm run dev)?", err.message);
    process.exit(1);
  }
}

main();
