import express from 'express';
import pr from './processing.js';

const app = express();
const port = process.env.SERVER_PORT || 8080;
app.use(pr.paths.dirs.map((x) => express.static(x)));
app.set('trust proxy', true);

app.get('/land', (req, res) => {
  res.sendFile(pr.paths.indexHTML);
});

app.get('/', (req, res) => {
  res.sendFile(pr.paths.indexBel);
});

app.get('/by', (req, res) => {
  res.sendFile(pr.paths.indexBel);
});

app.get('/en', (req, res) => {
  res.sendFile(pr.paths.indexEng);
});

app.get('/map', (req, res) => {
  res.sendFile(pr.paths.map);
});

app.get('/map2', async (req, res) => {
  res.send(await pr.buildList(pr.isTestHost(req), true));
});

app.get('/list.json', async (req, res) => {
  res.json(await pr.buildList(pr.isTestHost(req)));
});

app.get('/citylist.js', async (req, res) => {
  res.sendFile(pr.paths.cacheListJS);
});

app.all('/data/api/:lang/:id', async (req, res) => {
  // console.log(req.headers.host, req.params);
  const id = Number(req.params.id) || 1;
  const html = (id === 6) ? 'Казімірава Слабада зараз частка Мсціслава'
    : await pr.buildModal(req.params.lang, id, pr.isTestHost(req));
  res.set('Content-Type', 'text/html');
  res.send(html);
});

app.listen(port, () => {
  pr.logger.info(`Listening on port ${port}`);
});
