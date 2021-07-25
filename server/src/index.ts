import path from 'node:path';
import * as http from 'node:http';
import express from 'express';
import { isImageMagickInstalled } from './Crop.js';
import { Points } from './types/Points.js';
import { Coordinator } from './Coordinator.js';
import { Dimensions } from './types/Dimensions.js';

const app = express();
const server = http.createServer(app);
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
app.use(express.json());
app.use(express.static(path.resolve(process.cwd(), '../client/dist')));

let picturesDir = '';

app.post('/api/points', function (req, res) {
  console.dir(req.body);
  const points = req.body.points as Points;
  const imgSize = req.body.imgSize as Dimensions;
  coordinator.cropAndTile(points, imgSize);
});

app.post('/api/names', async function (req, res) {
  const { names } = req.body;
  console.log('names', names);
  coordinator.cardNames = names;
  coordinator.export();
  res.sendStatus(200);
});

app.get('/api/spritesheet', async function (req, res) {
  res.sendFile(path.join(coordinator.spritesheetsDir, 'front.jpg'));
});

app.get('/api/crop', async function (req, res) {
  if (coordinator.files.length !== 0) {
    return res.sendFile(coordinator.files[0].path);
  }
  res.sendStatus(404);
});

const port = process.env.PORT || 8558;
server.listen(port);

if (!isImageMagickInstalled()) {
  console.error(
    'ImageMagick is not installed or not avaible on path. "convert" binary is not available\nExiting...'
  );
  process.exit(1);
}
picturesDir = process.argv[2];
if (!picturesDir) {
  picturesDir = process.cwd();
}

const coordinator = new Coordinator(picturesDir);
coordinator.start();
