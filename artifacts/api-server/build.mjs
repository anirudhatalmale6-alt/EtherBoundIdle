import { build } from "esbuild";
import path from "path";
import { fileURLToPath } from "url";
import { rm, cp, access } from "fs/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run() {
  const distDir = path.resolve(__dirname, "dist");

  await rm(distDir, { recursive: true, force: true });

  await build({
    entryPoints: ["src/index.ts"],
    platform: "node",
    format: "esm",
    outfile: "dist/index.js",
    bundle: true,
    target: "node20",

    // 🔥 DAS IST DER WICHTIGE TEIL
    packages: "external"
  });

  const gameDist = path.resolve(__dirname, "..", "game", "dist");
  const publicDir = path.resolve(distDir, "public");

  try {
    await access(gameDist);
    await cp(gameDist, publicDir, { recursive: true });
    console.log("✅ Frontend copied to dist/public");
  } catch {
    console.log("⚠️ Frontend not built");
  }
}

run();
