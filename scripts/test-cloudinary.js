/**
 * Diagnóstico: prueba la conexión a Cloudinary directamente (sin Next.js).
 * Uso: node scripts/test-cloudinary.js
 *
 * Carga CLOUDINARY_URL desde .env.local para verificar credenciales.
 */

const fs = require("fs");
const path = require("path");

// Cargar .env.local manualmente
const envPath = path.resolve(__dirname, "..", ".env.local");
if (!fs.existsSync(envPath)) {
  console.error("No se encontró .env.local en:", envPath);
  process.exit(1);
}
const content = fs.readFileSync(envPath, "utf8");
content.split(/\r?\n/).forEach((line) => {
  const trimmed = line.trim();
  if (trimmed.startsWith("CLOUDINARY_URL=")) {
    const val = trimmed.slice(15).trim().replace(/^["']|["']$/g, "");
    process.env.CLOUDINARY_URL = val;
  }
});

const cloudinary = require("cloudinary").v2;

async function main() {
  if (!process.env.CLOUDINARY_URL) {
    console.error("CLOUDINARY_URL no encontrada en .env.local");
    process.exit(1);
  }

  console.log("Cloud name:", process.env.CLOUDINARY_URL.split("@")[1] || "(no detectado)");
  console.log("Probando subida...\n");

  // Imagen PNG mínima (1x1 pixel transparente) en base64
  const tinyPng =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

  try {
    // Probar primero SIN carpeta (algunas cuentas restringen carpetas)
    const result = await cloudinary.uploader.upload(
      `data:image/png;base64,${tinyPng}`,
      { public_id: "test-diagnostic" }
    );
    console.log("OK - Subida correcta");
    console.log("URL:", result.secure_url);
    console.log("\nLas credenciales funcionan. El 403 puede deberse a:");
    console.log("- Restricciones en Cloudinary Console > Settings > Security");
    console.log("- IP permitidas (Allowed Admin API IP Addresses)");
    console.log("- Probar sin carpeta: quitar 'folder: events' en la API");
  } catch (err) {
    console.error("Error:", err.message);
    if (err.message.includes("403")) {
      console.log("\nPosibles causas del 403:");
      console.log("1. Regenera el API Secret en https://console.cloudinary.com/settings/api-keys");
      console.log("2. Verifica que no haya espacios ni comillas extra en CLOUDINARY_URL");
      console.log("3. Revisa Security > Allowed Admin API IP Addresses (si está activo, desactívalo para pruebas)");
      console.log("4. Asegúrate de usar el Cloud Name correcto del Product Environment actual");
    }
    process.exit(1);
  }
}

main();
