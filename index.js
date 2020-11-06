const express = require('express');
const asyncRoute = require('route-async');
const pr = require('./processing');
const satelize = require('satelize-lts');

const app = express();
const cfg = pr.init();
const port = cfg.front.port;

const isTestHost = (r) => r.headers.host === cfg.front.hosts.test;


app.use(express.static(cfg.paths.pub));
app.use(express.static(cfg.paths.tilda));
app.use(express.static(cfg.paths.tilda2));
cfg.front.mods.forEach(x => app.use(express.static(__dirname + x)));

app.set('trust proxy', true);

app.use( (req, res, next) => {
	// req.headers["test"] = req.headers.host === "test.gardariki.by" ? 1:0;
		const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		// pr.logger.info(req.ip);
		satelize.satelize({ip:req.ip}, function(err, payload) {
		  // if used with expressjs
		  // res.send(payload);
		  // res.json...
		  // pr.logger.info("catch *", req.originalUrl, req.query);
		  // TypeError: Cannot read property 'en' of null
		  if (payload) {
			var country = (payload.hasOwnProperty("country") && payload.country && payload.country.hasOwnProperty("en") && payload.country.en) ? payload.country.en: "Unknown";
			pr.logger.info(`${req.ip} ${country} ${req.headers.host}${req.originalUrl}`);
		  } else {
			  pr.logger.info(req.ip);
		  }
	});
	return next();
});

app.get("/old", (req, res) => {
	// console.log("old");
    res.sendFile(cfg.paths.old);
});

app.get("/", (req, res) => {
	// console.log("landing be");
    res.sendFile(cfg.paths.root);
});

app.get("/by", (req, res) => {
    res.sendFile(cfg.paths.root);
});

app.get("/en", (req, res) => {
	// console.log("landing en");
    res.sendFile(cfg.paths.rootEN);
});

app.get("/map", (req, res) =>  {
    res.sendFile(cfg.paths.map);
});

app.get("/map2", async(req, res) =>  {
	res.send( await pr.generateListOfCities (isTestHost(req), true) );
	// res.sendFile( await pr.generateListOfCities (isTestHost(req)) );
});

app.get("/list.json", async(req, res) =>  {
	res.json( await pr.generateListOfCities (isTestHost(req)) );
	// res.sendFile( await pr.generateListOfCities (isTestHost(req)) );
});

app.get("/citylist.js", async(req, res) =>  {
	res.sendFile(cfg.paths.cacheList);
});

app.all("/api", async(req, res) =>  {
	console.log(req.headers.host, req.query);
	let id = parseInt(req.query.id);
	if (id) {
		const lng = req.query.l == cfg.front.languages[0] ? cfg.front.languages[0]: cfg.front.languages[1];
		let rs = (id == 6) ? "Казімірава Слабада зараз частка Мсціслава" : 
			await pr.generateCityModal(lng, id, isTestHost(req));
		res.send(rs);
	} else {
		res.status(404).send("ID error");
	}
});

// app.all("*", (req, res) => {
  // pr.logger.warn("catch * -> redir");
  // // res.send("Hi, stranger!");
  // res.redirect("/");
// });

app.listen(port, () => {
  pr.logger.info("Listening on port " + port);
});