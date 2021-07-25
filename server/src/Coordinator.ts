import fs from 'node:fs/promises';
import path from 'node:path';
import open from 'open';
import { File } from './types/File.js';
import { Points } from './types/Points';
import inquirer from 'inquirer';
import { WEB_PORT } from './Constants.js';
import { ExportType } from './enums/ExportType.js';
import cropAll from './Crop.js';
import { Phase } from './enums/Phase.js';
import tiler from './Tiler.js';
import { exportTabletopSimulator } from './Export.js';
import { Dimensions } from './types/Dimensions.js';

export class Coordinator {
  picturesDir: string;
  files: File[];
  exportType: ExportType;
  phase: Phase;
  get croppedDir(): string {
    return path.join(this.picturesDir, 'cropped/');
  }
  get croppedFrontDir(): string {
    return path.join(this.croppedDir, 'front/');
  }
  get croppedBackDir(): string {
    return path.join(this.croppedDir, 'back/');
  }
  get rawDir(): string {
    return path.join(this.picturesDir, 'raw/');
  }
  get spritesheetsDir(): string {
    return path.join(this.picturesDir, 'spritesheets/');
  }
  get spritesheetFront(): string {
    return path.join(this.spritesheetsDir, 'front.jpg');
  }
  get spritesheetBack(): string {
    return path.join(this.spritesheetsDir, 'back.jpg');
  }

  public cardNames: string[];

  constructor(picturesDir: string) {
    this.picturesDir = picturesDir;
    this.files = [];
    this.exportType = ExportType.TabletopSimulator;
    this.cardNames = [];
    this.phase = Phase.Setup;
  }

  async start() {
    this.files = (await fs.readdir(this.picturesDir))
      .filter((file) => file.endsWith('.jpg') || file.endsWith('.jpeg'))
      .map(
        (file) =>
          ({
            path: path.join(this.picturesDir, file),
            fileName: file,
          } as File)
      );
    const { wantToExit } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'wantToExit',
        message: `Directory ${this.picturesDir} contains ${this.files.length} jpg files.\nContinue?`,
      },
    ]);
    if (!wantToExit) {
      process.exit(0);
    }

    try {
      await fs.readdir(this.croppedDir);
      await fs.readdir(this.rawDir);
      console.log(
        'Subdirectories "cropped" and "raw" can\'t exist. Please remove them first.\nExiting...'
      );
      process.exit(1);
    } catch (error) {}

    const { exportType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'exportType',
        message: 'Which type of export do you want?',
        choices: ['Tabletop Simulator', 'Screentop'],
      },
    ]);
    this.exportType = exportType;
    // console.log('exportType', exportType);
    // const exportType = 'Tabletop Simulator';

    console.log(`Select the crop points in browser: http://localhost:${WEB_PORT}`);
    open(`http://localhost:${WEB_PORT}?page=crop`);
    this.phase = Phase.Cropping;
    // calculate targetSize from points from web interface by caluclating a rough aspect ratio
    // maxSize is calculated from exportType.
    // ScreenTop = 5000, TTS = 10000, but 8000 is used
  }

  async cropAndTile(points: Points, relativeImageSize: Dimensions) {
    if (this.phase !== Phase.Cropping) {
      throw new Error(`Current phase is ${this.phase}, not cropping`);
    }
    const targetSize = { width: 220, height: 400 } as Dimensions;

    function map(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
      return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    }
    const scaledPoints = points.map(([x, y]) => [
      map(x, 0, relativeImageSize.width, 0, targetSize.width),
      map(y, 0, relativeImageSize.height, 0, targetSize.height),
    ]) as Points;

    console.log('points', points);
    console.log('scaledPoints', scaledPoints);

    await fs.mkdir(this.croppedFrontDir, { recursive: true });
    await fs.mkdir(this.croppedBackDir, { recursive: true });
    await cropAll(this.rawDir, this.croppedDir, this.files, scaledPoints, targetSize);

    let maxSize = 8000;
    if (this.exportType === ExportType.ScreenTop) {
      maxSize = 5000;
    }
    fs.mkdir(this.spritesheetsDir);
    const frontImages = (await fs.readdir(this.croppedFrontDir))
      .filter((file) => file.endsWith('.png'))
      .map((file) => path.join(this.croppedFrontDir, file));
    const backImages = (await fs.readdir(this.croppedBackDir))
      .filter((file) => file.endsWith('.png'))
      .map((file) => path.join(this.croppedBackDir, file));
    await tiler(frontImages, maxSize, this.spritesheetFront);
    await tiler(backImages, maxSize, this.spritesheetBack);
    this.phase = Phase.Tiling;
    open(`http://localhost:${WEB_PORT}?page=names`);
  }

  async export() {
    if (this.phase !== Phase.Tiling) {
      throw new Error(`Current phase is ${this.phase}, not tiling`);
    }

    const { name, faceUrl, backUrl } = await inquirer.prompt([
      {
        type: 'name',
        name: 'faceUrl',
        message: "What's the face spritesheet URL?",
      },
      {
        type: 'input',
        name: 'faceUrl',
        message: "What's the back spritesheet URL?",
      },
      {
        type: 'input',
        name: 'backUrl',
        message: "What's the name?",
      },
    ]);
    if (this.exportType === ExportType.ScreenTop) {
      // TODO: add support for ScreenTop
      // maxSize = 5000;
    } else {
      // names of the cards
      const fileName = path.join(this.picturesDir, `${name}.json`);
      await exportTabletopSimulator(name, this.cardNames, faceUrl, backUrl, fileName);
      open(this.picturesDir);
    }
  }
}
