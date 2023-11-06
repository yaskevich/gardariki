import path from 'path';
import fs from 'fs';
import axios from 'axios';
import showdown from 'showdown';
import { inlineSource } from 'inline-source';
import mustache from 'mustache';
import pino from 'pino';
import GeoJSON from 'geojson';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
/* eslint-disable no-param-reassign */
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apiPort = process.env.API_PORT || 4040;
const serverPort = process.env.SERVER_PORT || 8080;

const languages = ['be', 'en'];

const isTestHost = (r) => r.headers.host === process.env.TEST_SITE;

const modules = [
  'jquery/dist',
  'leaflet/dist',
  'Leaflet.vector-markers/dist',
  'leaflet-easybutton/src',
  'leaflet-modal/dist',
  'materialize-css/dist',
];

const images = [
  'fortress.png',
  'flags-38754.svg',
  'Tower_gardarike-01.svg',
  'city-48636_640.png',
  'belarus-26903.svg'
];

const pubDir = path.join(__dirname, 'public');
const tildaDir = path.join(__dirname, 'tilda');
const dataDir = path.join(__dirname, 'data');
const landingDir = path.join(__dirname, 'landing');

const mapTemplatePath = path.join(pubDir, 'map.html');
const modalTemplatePath = path.join(pubDir, 'template.html');

const paths = {
  cache: path.join(dataDir, 'api'),
  cacheList: path.join(dataDir, 'list.json'),
  cacheListJS: path.join(dataDir, 'citylist.js'),
  magdeburgJSON: path.join(dataDir, 'magdeburg.json'),
  magdeburgJS: path.join(dataDir, 'magdeburg.js'),
  pub: pubDir,
  tilda: tildaDir,
  landing: landingDir,
  indexHTML: path.join(landingDir, 'index.html'),
  map: mapTemplatePath,
  inline: path.join(pubDir, 'inline.html'),
  indexBel: path.join(tildaDir, 'page9492899.html'),
  indexEng: path.join(tildaDir, 'page9962196.html'),
  dirs: modules.map((x) => path.join(__dirname, 'node_modules', x)).concat(pubDir, tildaDir, landingDir)
};
const modalTemplateHTML = fs.readFileSync(modalTemplatePath, 'utf8');

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true, translateTime: 'SYS:dd.mm.yyyy HH:MM:ss', ignore: 'pid,hostname',
    }
  }
});

const markup = new showdown.Converter({
  simpleLineBreaks: true,
  openLinksInNewWindow: true,
  customizedHeaderId: false
});

const makeFormatted = (text) => (text ? markup
  .makeHtml(text)
  .replace(/^(<p>)/m, '')
  .replace(/(<\/p>)$/m, '')
  .replace(/\}/gm, '</span>')
  .replace(/\{/gm, (x, y) => `<a class="btn-flat showaddon" id="add${y}"><i class="material-icons">fast_forward</i></a><span class="addon hide add${y}">`)
  : '');

const getCities = async () => axios.get(`http://localhost:${apiPort}/cities`);

const buildList = async (bRebuild, bHTML) => {
  let jsonOut = '';
  let htmlOut = '';

  if (fs.existsSync(paths.cacheList) && fs.existsSync(paths.inline) && !bRebuild) {
    logger.info(`list [served from cache]${bHTML ? ' HTML' : ''}`);
    jsonOut = JSON.parse(fs.readFileSync(paths.cacheList, 'utf8'));
    htmlOut = fs.readFileSync(paths.inline, 'utf8');
  } else {
    const response = await axios.get(`http://localhost:${apiPort}/cities`);
    const jsons = [];
    logger.info('regenerate list');
    // eslint-disable-next-line no-restricted-syntax
    for (const x of response.data) {
      const xx = x.placenames.filter((d) => d.language === 7).pop();
      const localName = xx?.name ? xx.name : `!${x.name}`;
      // logger.info(locl_name);
      jsons.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [
            x.lon,
            x.lat
          ]
        },
        properties: {
          id: x.id,
          name_be: x.name,
          name_en: localName,
          wiki: x.wiki_id,
          mentions: x.mentions
        }
      });
    }
    jsonOut = { type: 'FeatureCollection', features: jsons };
    try {
      fs.writeFileSync(paths.cacheList, JSON.stringify(jsonOut), 'utf8');
      logger.info('JSON file has been saved.');
    } catch (error) {
      logger.error('An error occured while writing JSON Object to File.');
      console.log(error);
    }

    try {
      htmlOut = await inlineSource(paths.map, {
        compress: true,
        rootpath: pubDir,
        // Skip all css types and png formats
        ignore: ['css', 'png']
      });
      logger.info('HTML rebuilt OK');

      try {
        fs.writeFileSync(paths.inline, htmlOut, 'utf8');
        logger.info('HTML has been saved.');
      } catch (error) {
        logger.error('An error occured while writing HTML to File.');
        console.log(error);
      }
    } catch (err) {
      logger.error(err);
    }
  }
  return bHTML ? htmlOut : jsonOut;
};

const buildModal = async (lang, id, bRebuild) => {
  const lng = lang === languages[0] ? languages[0] : languages[1];
  let rs;
  const pathLang = path.join(paths.cache, lng);
  fs.mkdirSync(pathLang, { recursive: true });

  const htmlSinglePath = path.join(pathLang, `${String(id)}.html`);
  // logger.info(html_path);

  if (fs.existsSync(htmlSinglePath) && !bRebuild) {
    logger.info(`${String(id)} [served from cache]`);
    rs = fs.readFileSync(htmlSinglePath, 'utf8');
  } else {
    //   let datum;
    const transResp = await axios.get(`http://localhost:${apiPort}/translations`);
    const translations = transResp.data
      .filter((x) => x.part === 'card')
      .map((x) => [x.var, x[`text_${lng}`]])
      // eslint-disable-next-line no-return-assign, no-sequences
      .reduce((o, [k, v]) => (o[k] = v, o), {});

    // console.log(translations);

    const cc = await axios.get(`http://localhost:${apiPort}/cities?id=${id}`);

    const rr = await axios.get(`http://localhost:${apiPort}/stats?cities=${id}`);
    const dd = rr.data[0];

    const rr2 = await axios.get(`http://localhost:${apiPort}/persons?city=${id}`);

    const persons = rr2.data.map((x) => (x.data?.[lng] ? Object.assign(x.data[lng], {
      wiki_id: x.wiki_id,
      events_desc: x[`events_${lng}`],
      def: x.def
    }) : null)).filter((x) => x);

    const responseOrgs = await axios.get(`http://localhost:${apiPort}/orgs?cities=${id}`);
    const orgs = responseOrgs.data.map((x) => ({
      title: x[`title_${lng}`], addr: x[`addr_${lng}`], url: x.url, lon: x.lon, lat: x.lat
    }));

    // console.log(orgs);

    const response = await axios.get(`http://localhost:${apiPort}/episodes?cities=${id}`);
    const { data } = response;
    const one = data[0];
    // const key = one[Object.keys(one)[0]];
    const city = one.cities;
    const wid = city.wiki_id;
    // const oid = city.osm_id;
    const img = city.wiki_img;

    // const photos = city.photos.map(x => Object.assign(x,
    // {'thumb': x.url.replace('uploads', 'uploads/thumb')},
    // {'pre': x.url.replace('uploads', 'uploads/pre')} )
    // );

    // console.log(cc.data[0].cityview);

    const photos = cc.data[0].cityview.map((x) => Object.assign(
      x,
      { title: x[`title_${lng}`] }
    ));

    // console.log(photos);

    const xx = cc.data[0].placenames.filter((d) => d.language === 7).pop();
    const localName = xx?.name ? xx.name : `!${city.name}`;

    const names = { en: localName, be: city.name };

    const hist = data.map((x) => {
      const match = /([\d?]{4})/.exec(x.date_from);
      x.year = match ? match[1] : '0';
      return {
        year: x.year, date_from: x.date_from, id: x.event.id, code: x.event.code, unit_be: x[`unit_${lng}`] ? x[`unit_${lng}`] : x.unit_be, event: x.event[`name_${lng}`]
      };
    }).sort((a, b) => (`${a.year}`).localeCompare(b.year));

    const events = {
      become_settlement: ["<span class='purple-text'>", '</span>'], get_magdeburg: ["<span class='red-text darken-4'>", '</span>'], become_city: ['', ''], become_town: ['', ''], become_village: ['', ''], change_state: ['', ''], become_agrotown: ['', '']
    };
    let histlist = '';
    if (hist) {
      histlist = hist.map((x) => {
        const evt = events[x.code][0] + (x.event || '') + events[x.code][1];
        x.show = x.date_from
          ? x.date_from.replace(/\d+\?\?$/, () => `${+x.date_from.substring(0, 2) + 1} ст.`)
          : x.year;

        return `<li class="collection-item"><div>${x.show}<span class="secondary-content">${evt ? (`${evt} `) : ''}${x.unit_be}</span></div></li>`;
      });
      histlist = histlist.join('');
    }

    rs = mustache.render(modalTemplateHTML, {
      name: names[lng],
      histlist,
      wid,
      mentions: city[`mentions_${lng}`],
      legends: makeFormatted(city[`legends_${lng}`]),
      lead: city[`lead_${lng}`],
      etym: makeFormatted(city[`etym_${lng}`]),
      stats: { qty: dd.qty, year: dd.year },
      img,
      persons,
      orgs,
      photos,
      loc: translations
    });

    fs.writeFileSync(htmlSinglePath, rs, 'utf8', (err) => {
      if (err) {
        logger.error('An error occured while writing HTML to File.');
        return;
      }
      logger.info('HTML file has been saved.');
    });
  }
  return rs;
};

const buildAllModals = () => {
  axios.get(`http://localhost:${apiPort}`)
    .then((resp) => {
      logger.info(`Backend status ${resp.status}`);
      if (resp.status === 200) {
        logger.info('Querying backend...');
        getCities().then((result) => {
          const items = result.data;
          const ids = items
            .map((x) => languages
              .map((l) => buildModal(l, x.id, true)
                .then(() => logger.info(`done ${l} ${x.id}`))));
          Promise.all(ids.flat())
            .then(() => logger.info(`modals done [${items.length}]`));
        });
        buildList(true).then(() => logger.info('list done'));
      }
    })
    .catch((err) => {
      logger.error('Backend is not available!', err);
    });
};

const buildInlineMap = async () => {
  const distDir = path.join(__dirname, 'dist');
  const mapPath = path.join(distDir, 'map.html');
  const apiLink = path.join(tildaDir, 'data');
  if (!fs.existsSync(apiLink)) {
    fs.symlinkSync(dataDir, apiLink, 'dir');
  }
  // eslint-disable-next-line no-restricted-syntax
  for (const file of images) {
    const assetsLink = path.join(tildaDir, file);
    if (!fs.existsSync(assetsLink)) {
      fs.symlinkSync(path.join(landingDir, file), assetsLink, 'dir');
    }
  }

  const htmlTemplate = fs.readFileSync(mapTemplatePath, { encoding: 'utf8', flag: 'r' }).replaceAll('script src="', `script inline src="http://localhost:${serverPort}/`)
    .replaceAll('link rel="stylesheet" href="', `link rel="stylesheet" inline href="http://localhost:${serverPort}/`);

  console.log('Source:', mapTemplatePath);

  try {
    const htmlResult = await inlineSource(htmlTemplate, {
      saveRemote: false,
      compress: true,
      rootpath: dataDir,
      // Skip all css types and png formats
      // ignore: ['css', 'png']
      ignore: ['png']
    });

    if (htmlResult) {
      fs.mkdirSync(distDir, { recursive: true });
      fs.writeFileSync(mapPath, htmlResult);
      console.log('Result:', mapPath);
      const mapLink = path.join(tildaDir, 'map.html');
      if (!fs.existsSync(mapLink)) {
        fs.symlinkSync(mapPath, mapLink);
      }
    }
  } catch (err) {
    console.log(err);
  }
};

const getMagdeburg = async (isQuiet = false) => {
  const resp = await axios.get('https://magdeburg-law.com/historic-city/');
  if (!isQuiet) {
    console.log('Magdeburg Law -> status', resp.status);
  }
  if (resp?.status === 200) {
    const data = resp.data.replace(/(\r\n|\n|\r)/gm, '').replace(/(\s+)/gm, ' ');
    const re = /\s+markers\s=\s(.*)(?=var\simage)/m;
    const datum = re.exec(data);
    const expression = `var ${datum.shift()} return [markers, infoWindowContent]`;
    // eslint-disable-next-line no-new-func
    const results = new Function(expression)();
    const objects = results?.[0].map((x) => {
      const [name, country] = x[0].split(', ');
      return ({
        name, country, lat: x[1], lon: x[2]
      });
    });
    const geo = GeoJSON.parse(objects, { Point: ['lat', 'lon'] });
    // const chunk = JSON.stringify(results?.[0], null, 2);
    const chunk = JSON.stringify(geo, null, 2);
    fs.writeFileSync(paths.magdeburgJSON, chunk);
    fs.writeFileSync(paths.magdeburgJS, `var magdeburgs = ${chunk}`);
    if (!isQuiet) {
      console.log('Magdeburg Law -> data', chunk?.length);
    }
    // fs.writeFileSync('datum2.json', JSON.stringify(boxes, null, 2));
  }
};

export default {
  // cwd: __dirname,
  isTestHost,
  getCities,
  buildList,
  buildModal,
  languages,
  paths,
  logger,
  buildAllModals,
  buildInlineMap,
  getMagdeburg,
};
