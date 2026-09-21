#!/usr/bin/env node

import { mkdir, readdir, copyFile, stat, rename, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const DEFAULT_INPUT_DIR = path.join(projectRoot, "public", "images", "errors");
const SUPPORTED_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp"]);

function parseArgs(argv) {
  const args = {
    inputDir: DEFAULT_INPUT_DIR,
    sourceDir: null,
    backup: true,
    inPlace: true,
    outputDir: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];

    if (value === "--input" && argv[index + 1]) {
      args.inputDir = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }

    if (value === "--source" && argv[index + 1]) {
      args.sourceDir = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }

    if (value === "--output" && argv[index + 1]) {
      args.outputDir = path.resolve(argv[index + 1]);
      args.inPlace = false;
      index += 1;
      continue;
    }

    if (value === "--no-backup") {
      args.backup = false;
    }
  }

  return args;
}

/** Fake PNG transparency: neutral gray / white checkerboard cells only. */
function isCheckerboardBackground(red, green, blue) {
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const chroma = max - min;

  if (chroma > 14) return false;

  const avg = (red + green + blue) / 3;
  return avg >= 165 && avg <= 255;
}

/** Solid scene backdrops (404 lavender wall / purple floor) — edge-connected only. */
function isPurpleSceneBackground(red, green, blue) {
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const chroma = max - min;

  if (max > 215 && blue > 210 && red > 190 && green > 175 && chroma < 70) {
    return true;
  }

  if (blue > red && blue > green && max >= 120 && max <= 210 && chroma >= 35) {
    return true;
  }

  if (blue > 70 && red > 35 && green < 90 && max <= 120 && chroma >= 25) {
    return true;
  }

  return false;
}

function isRemovableBackground(red, green, blue, alpha, mode) {
  if (alpha < 8) return true;
  if (isCheckerboardBackground(red, green, blue)) return true;
  if (mode === "purple-scene" && isPurpleSceneBackground(red, green, blue)) {
    return true;
  }
  return false;
}

function detectBackgroundMode(data, width, height, channels) {
  let checkerboardHits = 0;
  let samples = 0;
  const pixelIndex = (x, y) => (y * width + x) * channels;

  for (let y = 0; y < height; y += 4) {
    for (let x = 0; x < width; x += 4) {
      const index = pixelIndex(x, y);
      const red = data[index];
      const green = data[index + 1];
      const blue = data[index + 2];
      samples += 1;
      if (isCheckerboardBackground(red, green, blue)) checkerboardHits += 1;
    }
  }

  return checkerboardHits / samples < 0.08 ? "purple-scene" : "checkerboard";
}

function removeBackgroundFromBuffer(data, width, height, channels) {
  const mode = detectBackgroundMode(data, width, height, channels);
  const visited = new Uint8Array(width * height);
  const queue = [];

  for (let x = 0; x < width; x += 1) {
    queue.push([x, 0], [x, height - 1]);
  }

  for (let y = 0; y < height; y += 1) {
    queue.push([0, y], [width - 1, y]);
  }

  const pixelIndex = (x, y) => (y * width + x) * channels;
  const visitIndex = (x, y) => y * width + x;

  while (queue.length > 0) {
    const [x, y] = queue.pop();
    if (x < 0 || y < 0 || x >= width || y >= height) continue;

    const visitedIndex = visitIndex(x, y);
    if (visited[visitedIndex]) continue;
    visited[visitedIndex] = 1;

    const index = pixelIndex(x, y);
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    const alpha = data[index + 3];

    if (!isRemovableBackground(red, green, blue, alpha, mode)) continue;

    data[index + 3] = 0;

    queue.push(
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    );
  }

  if (mode === "checkerboard") {
    let changed = true;
    while (changed) {
      changed = false;
      for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
          const index = pixelIndex(x, y);
          if (data[index + 3] === 0) continue;

          const red = data[index];
          const green = data[index + 1];
          const blue = data[index + 2];
          if (!isCheckerboardBackground(red, green, blue)) continue;

          const touchesTransparent =
            (x > 0 && data[pixelIndex(x - 1, y) + 3] === 0) ||
            (x < width - 1 && data[pixelIndex(x + 1, y) + 3] === 0) ||
            (y > 0 && data[pixelIndex(x, y - 1) + 3] === 0) ||
            (y < height - 1 && data[pixelIndex(x, y + 1) + 3] === 0);

          if (touchesTransparent) {
            data[index + 3] = 0;
            changed = true;
          }
        }
      }
    }
  }

  return data;
}

async function processImage(inputPath, outputPath) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const cleaned = removeBackgroundFromBuffer(
    Buffer.from(data),
    info.width,
    info.height,
    info.channels,
  );

  await sharp(cleaned, {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels,
    },
  })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(outputPath);
}

async function listImageFiles(directory) {
  const entries = await readdir(directory);
  const files = [];

  for (const entry of entries) {
    if (entry === "original" || entry.endsWith(".tmp.png")) continue;

    const fullPath = path.join(directory, entry);
    const extension = path.extname(entry).toLowerCase();

    if (!SUPPORTED_EXTENSIONS.has(extension)) continue;

    const fileStat = await stat(fullPath);
    if (!fileStat.isFile()) continue;

    files.push(fullPath);
  }

  return files.sort();
}

async function writeInPlace(inputPath, outputPath, processor) {
  if (inputPath === outputPath) {
    const tempPath = `${outputPath}.tmp.png`;
    await processor(inputPath, tempPath);
    await unlink(inputPath).catch(() => undefined);
    await rename(tempPath, outputPath);
    return;
  }

  await processor(inputPath, outputPath);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const inputDir = args.inputDir;
  const sourceDir = args.sourceDir ?? inputDir;
  const outputDir = args.outputDir ?? inputDir;

  await mkdir(outputDir, { recursive: true });

  if (args.backup && args.inPlace && sourceDir === outputDir) {
    await mkdir(path.join(outputDir, "original"), { recursive: true });
  }

  const files = await listImageFiles(sourceDir);

  if (files.length === 0) {
    console.log(`No se encontraron imágenes en ${sourceDir}`);
    process.exit(0);
  }

  console.log(`Procesando ${files.length} imagen(es) desde ${sourceDir}...`);

  for (const sourcePath of files) {
    const fileName = path.basename(sourcePath);
    const pngName = `${path.parse(fileName).name}.png`;
    const outputPath = path.join(outputDir, pngName);

    if (args.backup && args.inPlace && sourceDir === outputDir) {
      const backupPath = path.join(outputDir, "original", fileName);
      try {
        await stat(backupPath);
      } catch {
        await copyFile(sourcePath, backupPath);
      }
    }

    await writeInPlace(sourcePath, outputPath, processImage);
    console.log(`  ✓ ${pngName}`);
  }

  console.log("\nListo. PNG con transparencia real generados.");
  console.log("Recarga el navegador con Ctrl+Shift+R para ver los cambios.");
  if (args.backup && args.inPlace) {
    console.log(`Copias originales en: ${path.join(outputDir, "original")}`);
  }
}

main().catch((error) => {
  console.error("Error procesando imágenes:", error);
  process.exit(1);
});
