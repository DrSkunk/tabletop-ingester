import canvas from 'canvas';
import fs from 'node:fs/promises';
import path from 'node:path';
import { JPG_QUALITY, SPRITESHEET_COLUMNS, SPRITESHEET_ROWS } from './Constants.js';
import { File } from './types/File.js';

const { createCanvas, loadImage } = canvas;

export default async function tiler(
  files: string[],
  maxSize: number,
  outputFile: string
): Promise<void> {
  console.log(
    `Tiling spritesheet with ${SPRITESHEET_COLUMNS} columns, ${SPRITESHEET_ROWS} and maxWidth ${maxSize}`
  );

  const firstImage = await loadImage(files[0]);
  const canvas = createCanvas(
    firstImage.width * SPRITESHEET_COLUMNS,
    firstImage.height * SPRITESHEET_ROWS
  );
  const ctx = canvas.getContext('2d');
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const image = await loadImage(file);
    const x = (i % SPRITESHEET_COLUMNS) * image.width;
    const y = Math.floor(i / SPRITESHEET_COLUMNS) * image.height;
    ctx.drawImage(image, x, y);
  }
  const imageBuffer = canvas.toBuffer('image/jpeg', { quality: JPG_QUALITY });
  await fs.writeFile(outputFile, imageBuffer);
}
