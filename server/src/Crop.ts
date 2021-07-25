import fs from 'node:fs/promises';
import path from 'node:path';
import { exec } from 'child-process-promise';
import PQueue from 'p-queue';
import { Points } from './types/Points';
import { File } from './types/File';
import { Dimensions } from './types/Dimensions';

export async function isImageMagickInstalled(): Promise<boolean> {
  const result = await exec('convert -version');
  return result.stdout.includes('ImageMagick');
}

export default async function cropAll(
  rawDir: string,
  croppedDir: string,
  files: File[],
  points: Points,
  targetSize: Dimensions
) {
  const queue = new PQueue({ concurrency: 4 });
  const crops = files.map((file, i) => () => {
    let outputFilename = 'front/';
    if (i % 2 === 1) {
      outputFilename = 'back/';
    }
    outputFilename += `${Math.floor(i / 2)
      .toString()
      .padStart(3, '0')}.png`;
    console.log(`writing ${outputFilename}`);
    return crop(file.path, path.join(croppedDir, outputFilename), points, targetSize);
  });
  await queue.addAll(crops);
  console.log('done, moving input files to "raw" folder');
  await fs.mkdir(rawDir, { recursive: true });
  for (const file of files) {
    fs.rename(file.path, path.join(rawDir, file.fileName));
  }
  console.log('Moved all files.');

  // const tilerFiles = await (
  //   await fs.readdir(croppedDir)
  // ).filter((file) => file.startsWith('A') && file.endsWith('.jpg'));
}

async function crop(
  inputFile: string,
  outputFile: string,
  p: Points,
  ts: Dimensions
): Promise<void> {
  // p = input points
  // ts = target size

  // https://www.imagemagick.org/script/command-line-options.php#distort
  const inputString = `convert \\
  -auto-orient \\
  -resize x${ts.height} \\
  -distort Perspective '${p[0][0]},${p[0][1]},0,0
  ${p[1][0]},${p[1][1]},${ts.width},0
  ${p[2][0]},${p[2][1]},${ts.width},${ts.height}
  ${p[3][0]},${p[3][1]},0,${ts.height}' \\
  -crop ${ts.width}x${ts.height}+0+ \\
  ${inputFile} \\
  ${outputFile}`;

  await exec(inputString);
}
