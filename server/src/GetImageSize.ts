import { exec } from 'child-process-promise';
import fs from 'node:fs/promises';

export default async function getImageSize(file: string) {
  await fs.access(file);
  const inputString = `convert -auto-orient ${file} -format "%w:%h" info:`;

  const result = await exec(inputString);
  const [width, height] = result.stdout.split(':');
  return {
    width: parseInt(width, 10),
    height: parseInt(height, 10),
  };
}
