const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

// const fetch = require('node-fetch');
// const proxy = require('http-proxy-middleware');
const csv = require('csvtojson')
const app = express();
const port = 1067;
const public = path.join(__dirname, 'public')
app.use(express.static(public));


let citydata, histdata;

async function getCsv() {
	const csv1 = await csv().fromFile('1.csv');
	citydata = csv1.reduce((obj, item) => (obj[item.wiki_id] = item, obj) ,{});
	const csv2 = await csv().fromFile('2.csv');
	histdata = csv2;
}
getCsv();


async function getWikidata(id) {
	const wikiapi_url = 'https://www.wikidata.org/w/api.php?action=wbgetentities&ids='+id+'&languages=en&format=json';
	
	
  try {
	const response = await axios.get(wikiapi_url);
	data = await response.data;
	// console.log(response.request.res.req.agent.protocol+"//"+response.request.res.connection._host+response.request.path);
	return data;
	
  } catch (error) {
	console.error(error);
  }
}

app.use(express.static(__dirname + '/node_modules/materialize-css/dist'));
// app.use(express.static(__dirname + '/node_modules/jquery/dist'));
// app.use(express.static(__dirname + '/node_modules/d3/dist'));
// app.use(express.static(__dirname + '/node_modules/popper.js/dist/umd'));

// app.get('/', function (req, res) {
  // res.send('Hello World!');
// });

app.get('/', function(req, res) {
    res.sendFile(path.join(public, 'index.html'));
});

app.get('/map', function(req, res) {
    res.sendFile(path.join(public, 'mp.html'));
});

app.get('/mp', function(req, res) {
    res.sendFile(path.join(public, 'map.html'));
});

app.get('/list.json', function(req, res) {
	(async() => {
		const response = await axios.get("http://localhost:4141/cities");
		let jsons = [];
		for (x of response.data){
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
					"name": x.name,
					"wiki": x.wiki_id,
					"mentions": x.mentions
					}
				});	
		}	
		res.json({"type": "FeatureCollection", "features": jsons});
	})();
});

app.all('/city', function(req, res) {
	let id = "Q744167";
	// console.log("body", req.body);
	console.log("query", req.query);
	if (req.query.hasOwnProperty("id")){
		id = req.query.id;
	}
	let datum;
	
	// Call start
		(async() => {
			const json_path = path.join(public, "data", id);
			  if (fs.existsSync(json_path)) {
				console.log(id, "cached...");
				datum = JSON.parse(fs.readFileSync(json_path, 'utf8'));
			  } else {
				  try {
					var myRegexp = /(\d{4})/;
					const hist = histdata.filter(function(x) {
						 if (x['wikidata1'] == id){
							var match = myRegexp.exec(x["date_from"]);
							if (match) {
								x["year"] = match[1];
							} else {
								x["year"] = "0000";
							}
							return x;
						 }
						 
					});
					datum = citydata[id];
					console.log(id, "loading...");
					const wiki = await getWikidata(id);
					const imgentity = wiki["entities"][id]["claims"]["P94"];
					datum["img"] = imgentity ?
						("https://commons.wikimedia.org/wiki/Special:FilePath/"+imgentity[0]["mainsnak"]["datavalue"]["value"]) 
						: 
						"/fortress.png";					
						
					datum["history"] = hist.sort(function(a, b) {
						return a["year"] - b["year"];
					});

					fs.writeFileSync(json_path, JSON.stringify(datum), 'utf8', function (err) {
						if (err) {
							console.log("An error occured while writing JSON Object to File.");
							return console.log(err);
						}
						console.log("JSON file has been saved.");
					});
				  } catch (error) {
					console.error(error);
				  }
			  }
			
			
			res.json(datum)
		})();

});

app.all('/city2', function(req, res) {
	// console.log("query", req.query);
	let id = parseInt(req.query.id);
	

	(async() => {
		
	let datum;
	const json_path = path.join(public, "cache", String(id));
	// if (fs.existsSync(json_path)) {
		// console.log(id, "cached...");
		// datum = JSON.parse(fs.readFileSync(json_path, 'utf8'));
	// } else {
		
		const rr = await axios.get("http://localhost:4141/stats?cities="+id);
		const dd = rr.data[0];
		
		const rr2 = await axios.get("http://localhost:4141/persons?city="+id);
		const persons = rr2.data[0];
		
		const response = await axios.get("http://localhost:4141/episodes?cities="+id);
		const data = response.data;
		const one = data[0];
		const key = one[Object.keys(one)[0]];
		const city = one.cities;
		const wid = city.wiki_id;
		const oid = city.osm_id;
		const img = city.wiki_img||"/fortress.png";
		
		const hist = data.map(function(x) {
			const match = /([\d\?]{4})/.exec(x["date_from"]);
			x["year"] = match ? match[1] : "0";			
			return {"year": x.year, "date_from": x.date_from, "id": x.event.id, "code": x.event.code, "unit_be": x.unit_be};
		}).sort(function(a, b) { return ('' + a.year).localeCompare(b.year)});
		
		datum = {"wiki_id": wid, "history": hist, "etym": city.etym, name: city.name, legends: city.legends, mentions: city.mentions, "img": img, "stats": {"qty": dd.qty, "year": dd.year}, "persons": persons};
		
		
		// var wikimgd = d.properties.magdeburg_wiki?'<p>Магдэбургскае права (Wiki): '+d.properties.magdeburg_wiki+'</p>':'';

		// var wikimgd = d.properties.mentions?'<p>Першыя згадкі: '+d.properties.mentions+'</p>':'';
		var wikimgd = datum.mentions?'<p>Першыя згадкі: '+datum.mentions+'</p>':'';
					
		var events = {"become_settlement": "<span class='purple-text'>→ страта статусу горада</span>", "get_magdeburg":"<span class='red-text darken-4'>Магдэбургскае права</span>", "become_city": "горад","become_town": "горад", "become_village": "вёска", "change_state": "", "become_agrotown": "аграгарадок"};
		var histlist = '';
			if(datum.history) {
				histlist = datum.history.map(function(x){
					var evt = events[x.code];
					return '<li class="collection-item"><div>'+ (x["date_from"]||x["year"]) +'<span class="secondary-content">'+(evt?(evt+", "):"")+x.unit_be+'</span></div>' +'</li>';
				});
				histlist = histlist.join('');
			}
		let tmpl  = '<div class="col s12 m8 offset-m2 l6 offset-l3"><div class="card-panel grey lighten-5 z-depth-1"><div class="row valign-wrapper"><div class="col s2"><img src="'+datum["img"]+'" alt="" class="responsive-img"></div><div class="col s10"><span class="black-text flow-text"> '  + datum.name + '  </span></div></div></div></div>' +
					
					  '<div class="row"><div class="col s12"><ul class="tabs"><li class="tab col s3"><a class="active" href="#test1">Звесткі</a></li>						<li class="tab col s3"><a href="#test2">Гісторыя</a></li> 						<li class="tab col s3"><a href="#test3">Асобы</a></li> 						<li class="tab col s3"><a href="#test4">Арганізацыі</a></li> 					  </ul> 					</div> 					<div id="test1" class="col s12"><div class="row"><div class="col s12 m12"><div class="card red lighten-5"><div class="card-content black-text">'+datum.etym+'</div></div></div></div></div> <div id="test2" class="col s12"><ul class="collection">' + histlist + '</ul></div> 					<div id="test3" class="col s12">Test 3</div> 					<div id="test4" class="col s12">Test 4</div> 				  </div>'
					+
					"<div class='row'><p><a target='_blank' href='https://www.wikidata.org/wiki/" +datum.wiki_id+ "'>Wikidata</a></p><p class='hide'>Магдэбургскае права: " + datum.name + "</p>"+wikimgd+"</div>"	
		
		// console.log(one.city);
		// res.json(response.data);
		// fs.writeFileSync(json_path, JSON.stringify(datum), 'utf8', function (err) {
			// if (err) {
				// console.log("An error occured while writing JSON Object to File.");
				// return console.log(err);
			// }
			// console.log("JSON file has been saved.");
		// });
	// }
	// res.json(datum);	
	console.log("send to browser");
	res.send(tmpl);	
})();	
});


app.listen(port, function () {
  console.log('The app is on port ' + port);
});