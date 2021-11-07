const axios = require('axios');
const path = require('path');
const fs = require('fs');
const config = require('config');
const showdown  = require('showdown');
const markup = new showdown.Converter({"simpleLineBreaks":true, "openLinksInNewWindow": true, "customizedHeaderId": false});
const { inlineSource } = require('inline-source');
const mustache = require('mustache');
const pino = require('pino');
const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true, translateTime: "SYS:dd.mm.yyyy HH:MM:ss", ignore: 'pid,hostname', 
    }
  }
});

function makeFormatted(text){
	return (text ? markup
					.makeHtml(text)
					.replace(/^(\<p\>)/m, "")
					.replace(/(\<\/p\>)$/m, "")
					.replace(/\}/gm, '</span>')
					.replace(/\{/gm, function(x,y){
						return '<a class="btn-flat showaddon" id="add'+y+'"><i class="material-icons">fast_forward</i></a><span class="addon hide add'+y+'">'
					} ) 
				: 
				"");
}

let cfg = {};

module.exports = {
  foo: async function () {
	logger.info("from here", module.exports.config.hosts);
  },
  
  logger: logger, 
  
  getAllCities: async function () {
	const cc = await axios.get("http://localhost:4141/cities");
	return cc;
  },
  init: function () {
	const front = config.get('frontend')
	const paths = {
		"cache" 	: path.join(__dirname, front.dirs.cache),
		"cacheList" : path.join(__dirname, front.dirs.pub, 'list.json'),
		"cacheListJS" : path.join(__dirname, front.dirs.pub, 'citylist.js'),
		"pub"		: path.join(__dirname, front.dirs.pub),
		"tilda"		: path.join(__dirname, front.dirs.tilda),
		"tilda2"		: path.join(__dirname, front.dirs.tilda2),
		"old"		: path.join(__dirname, front.dirs.pub, 'landing.html'),
		"map"		: path.join(__dirname, front.dirs.pub, 'map.html'),
		"inline"		: path.join(__dirname, front.dirs.pub, 'inline.html'),
		// const path_tilda_index = path.join(tilda, 'page9492899.html');
		// "root"		: path.join(__dirname, front.dirs.tilda, 'pretty.html')
		"root"		: path.join(__dirname, front.dirs.tilda, 'page9492899.html'),
		"rootEN"		: path.join(__dirname, front.dirs.tilda2, 'page9962196.html'),
		// "root"		: path.join(__dirname, front.dirs.tilda, 'page9492899.html')
	}
	const html = fs.readFileSync(path.join(__dirname, "template.html"), 'utf8');
	cfg  = {"front": front, "paths": paths, "html": html};
	return cfg;
  },
  rebuildAll: function (cacheFilePath) {
	// logger.info("from here");
	
  },
  generateCityModal: async function (lng, id, bRebuild) {
	let rs;
	const pathLang = path.join(cfg.paths.cache, lng);
	fs.mkdirSync(pathLang, { recursive: true });
	
	const html_path = path.join(pathLang, String(id)+'.html');
	// logger.info(html_path);
	
	if (fs.existsSync(html_path) && !bRebuild) {
		logger.info(String(id) +" [served from cache]");
		rs = fs.readFileSync(html_path, 'utf8');
	} else {
		let datum;
		const transResp = await axios.get("http://localhost:4141/translations");
		const translations = transResp.data
			.filter(function (x) {
				return x.part=="card";
			})
			.map((x) => [ x["var"], x["text_"+lng]])
			.reduce((o,[k,v]) => (o[k]=v,o), {});
		
		// console.log(translations);
		
		const cc = await axios.get("http://localhost:4141/cities?id="+id);
		
		const rr = await axios.get("http://localhost:4141/stats?cities="+id);
		const dd = rr.data[0];
		
		const rr2 = await axios.get("http://localhost:4141/persons?city="+id);
		
		const persons = rr2.data.map(function(x) { 
				
				// const info = x.data.hasOwnProperty(lng) ? x.data[lng] : 
							// x.data.hasOwnProperty("be") ? x.data["be"] : 
							// x.data.hasOwnProperty("ru") ? x.data["ru"] :
							// x.data[x.def];
				return x.data.hasOwnProperty(lng) ? Object.assign(x.data[lng], {
					"wiki_id": x.wiki_id, 
					"events_desc":x["events_"+lng], 
					"def": x.def
				}) : null; 
		}).filter(function (x) {
			return x;
		});
		
		const resp_orgs = await axios.get("http://localhost:4141/orgs?cities="+id);
		const orgs  = resp_orgs.data.map((x) => ({"title": x["title_"+lng], "addr": x["addr_"+lng], "url": x.url, "lon": x.lon, "lat": x.lat}));
		
		// console.log(orgs);
		
		const response = await axios.get("http://localhost:4141/episodes?cities="+id);
		const data = response.data;
		const one = data[0];
		const key = one[Object.keys(one)[0]];
		const city = one.cities;
		const wid = city.wiki_id;
		const oid = city.osm_id;
		const img = city.wiki_img;
		
		// const photos = city.photos.map(x => Object.assign(x, 
			// {'thumb': x.url.replace('uploads', 'uploads/thumb')}, 
			// {'pre': x.url.replace('uploads', 'uploads/pre')} )
		// );


		// console.log(cc.data[0].cityview);
		
		const photos = cc.data[0].cityview.map(x => Object.assign(x, 
			{'title': x["title_"+lng]})
		);
		
		// console.log(photos);
		
		const xx = cc.data[0].placenames.filter(function(d) {return d.language == 7;}).pop();
		const locl_name = xx && xx.hasOwnProperty("name")? xx.name : "!"+city.name;
		
		var names  = {"en": locl_name, "be": city.name};
			
		const hist = data.map(function(x) {
			const match = /([\d\?]{4})/.exec(x["date_from"]);
			x["year"] = match ? match[1] : "0";			
			return {"year": x.year, "date_from": x.date_from, "id": x.event.id, "code": x.event.code, "unit_be": x["unit_"+lng]?x["unit_"+lng]: x["unit_be"], "event": x.event["name_"+lng]};
		}).sort(function(a, b) { return ('' + a.year).localeCompare(b.year)});
		
		
		
		const events = {"become_settlement": ["<span class='purple-text'>", "</span>"], "get_magdeburg":["<span class='red-text darken-4'>", "</span>"], "become_city": ["", ""],"become_town": ["", ""], "become_village": ["", ""], "change_state": ["", ""], "become_agrotown": ["", ""]};
		let histlist = '';
		if(hist) {
			histlist = hist.map(function(x){
				var evt = events[x.code][0]+(x.event||"")+events[x.code][1];
				x.show = x["date_from"] ?
						x["date_from"].replace(/\d+\?\?$/, function(d){
							return +x["date_from"].substring(0, 2) + 1 + " ст.";
						})
						: x["year"];
				
				return '<li class="collection-item"><div>'+ (x["show"]) +'<span class="secondary-content">'+(evt?(evt+" "):"")+x.unit_be+'</span></div>' +'</li>';
			});
			histlist = histlist.join('');
		}


		rs  = mustache.render(cfg.html, {
			"name": names[lng],
			"histlist": histlist,
			"wid": wid,
			"mentions": city["mentions_"+lng],
			"legends": makeFormatted(city["legends_"+lng]),
			"lead": city["lead_"+lng],
			"etym": makeFormatted(city["etym_"+lng]),
			"stats": {"qty": dd.qty, "year": dd.year},
			"img": img,
			"persons": persons,
			"orgs": orgs,
			"photos": photos,
			"loc": translations
			});
	
	fs.writeFileSync(html_path, rs, 'utf8', function (err) {
		if (err) {
			logger.error("An error occured while writing HTML to File.");
			return;
		}
		logger.info("HTML file has been saved.");
	});
	}
	return rs;
  },
  generateListOfCities: async function (bRebuild, bHTML) {
    let json_out = "";
	let html_out = "";
	
	if (fs.existsSync(cfg.paths.cacheList) && fs.existsSync(cfg.paths.inline) && !bRebuild) {
		logger.info("list [served from cache]"+(bHTML? " HTML": ""));
		json_out = JSON.parse(fs.readFileSync(cfg.paths.cacheList, 'utf8'));
		html_out = fs.readFileSync(cfg.paths.inline, 'utf8');
	} else {
		const response = await axios.get("http://localhost:4141/cities");
		let jsons = [];
		logger.info("regenerate list");
		for (x of response.data){
			const xx = x.placenames.filter(function(d) {return d.language == 7;}).pop();
			const locl_name = xx && xx.hasOwnProperty("name")? xx.name : "!"+x.name;
			// logger.info(locl_name);
			jsons.push(	{
				"type": "Feature",
				"geometry": {
					"type": "Point",
					"coordinates": [
					  x.lon,
					  x.lat
				]},
				"properties": {
					"id": x.id,
					"name_be": x.name,
					"name_en": locl_name,
					"wiki": x.wiki_id,
					"mentions": x.mentions
					}
				});	
		}	
		json_out = {"type": "FeatureCollection", "features": jsons};		
		fs.writeFileSync(cfg.paths.cacheList, JSON.stringify(json_out), 'utf8', function (err) {
			if (err) {
				logger.error("An error occured while writing JSON Object to File.");
				return console.log(err);
			}
			logger.info("JSON file has been saved.");
		});	
		

		try {
		  html_out = await inlineSource(cfg.paths.map, {
			compress: true,
			rootpath: path.resolve(__dirname+'/public'),
			// Skip all css types and png formats
			ignore: ['css', 'png']
		  });
		  logger.info("HTML rebuilt OK");
		  
		fs.writeFileSync(cfg.paths.inline, html_out, 'utf8', function (err) {
			if (err) {
				logger.error("An error occured while writing HTML to File.");
				return console.log(err);
			}
			logger.info("HTML has been saved.");
		});	
		  
		  // Do something with html
		} catch (err) {
		  logger.error(err);
		}
		
	}
	return bHTML?html_out:json_out;
  }
};



// export default function foo(router) {
  // return async (dispatch) => {
    // try {
      // const {data: {success, message}} = await axios.get('/logout');
 
      // (success)
        // ? dispatch({ type: LOGOUT_SUCCESS })
        // : dispatch({ type: LOGOUT_FAILURE, message });
 
     // } catch (e) {
         // dispatch({ type: LOGOUT_FAILURE, e.data.message });
     // }
   // };
// }