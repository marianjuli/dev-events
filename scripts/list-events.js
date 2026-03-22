/**
 * Lista los eventos en MongoDB con su slug.
 * Uso: node scripts/list-events.js
 */

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const envPath = path.resolve(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .forEach((line) => {
      const t = line.trim();
      if (t.startsWith("MONGODB_URI=")) {
        process.env.MONGODB_URI = t.slice(11).trim().replace(/^["']|["']$/g, "");
      }
    });
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI no encontrada en .env.local");
    process.exit(1);
  }

  await mongoose.connect(uri);
  const events = await mongoose.connection.db.collection("events").find({}).toArray();

  console.log("Eventos en la base de datos:\n");
  events.forEach((e, i) => {
    console.log(`${i + 1}. Título: ${e.title}`);
    console.log(`   Slug: ${e.slug}`);
    console.log(`   URL: /event/${e.slug}`);
    console.log("");
  });

  await mongoose.disconnect();
}

main().catch(console.error);
