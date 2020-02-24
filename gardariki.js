var isRotate = false;
var timer;
var defLayerIndex = 10;
var osm_attr = 'Map data <a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia maps</a> &copy; <a href="http://openstreetmap.org" target="_blank">OpenStreetMap</a>';
var wikimedia = L.tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png', { maxZoom: 19, minZoom: 6, opacity: 1} );
var datamap = L.tileLayer('https://datamap.by/bright/{z}/{x}/{y}.png', { maxZoom: 19, minZoom: 6, opacity: 1} );
var natmap = L.tileLayer.wms("http://basemap.nationalmap.gov/ArcGIS/services/USGSImageryTopo/MapServer/WMSServer", { layers: "0", format: "image/png", transparent: false, attribution: "USGS" });

function getColor(d) {
    return d > 50 ? '#800026' :
           d > 40  ? '#BD0026' :
           d > 30  ? '#E31A1C' :
           d > 20  ? '#FC4E2A' :
           d > 15   ? '#FD8D3C' :
           d > 10   ? '#FEB24C' :
           d > 5   ? '#FED976' :
                      '#FFEDA0';
}

function style(feature) {
    return {
        fillColor: "red",
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
};
var redMarker = L.VectorMarkers.icon({
	//icon: 'exclamation-triangle',
	 icon: 'paw',
	 markerColor:"yellow",
	iconColor: "black",
	prefix: 'fa',
	// spin: true,
  });

// init:

function popUp(f,l){
	var desc = '';
	var p = f.properties;
    // var out = [];
    // if (f.properties){
        // for(key in f.properties){
            // out.push(key+": "+f.properties[key]);
        // }
        // l.bindPopup(out.join("<br />"));
    // }
	desc+="<b>"+p.title+"</b><br/>Тип: "+p.type+"<br/>Дата установки: "+p.open+"</br>Адрес: "+p.addr;
	if (p.fulltext){
		desc+="<div style=\"border: 2px solid black;padding: 5px;margin-top: 5px;\"><i>"+p.fulltext+"</i></div>";
	}
	if (p.init){
		desc+="</br>Установка инициирована: " + p.init;
	}
	l.bindPopup(desc);
}

var baseLayers2 = {			

	"Datamap":  datamap,
	"OSM":  L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', { maxZoom: 19, minZoom: 6, opacity: 1} ),
	"OSM.DE":  L.tileLayer("https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png", { maxZoom: 19, minZoom: 4, opacity: 1} ),
	"AWMC":  L.tileLayer("https://a.tiles.mapbox.com/v3/isawnyu.map-knmctlkh/{z}/{x}/{y}.png", { maxZoom: 19, minZoom: 6, opacity: 1} ),
	//positron
	"CartoDB":  L.tileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png", { maxZoom: 19, minZoom: 6, opacity: 1, "attribution":
      "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> &copy; <a href='http://cartodb.com/attributions'>CartoDB</a>",
    "subdomains": "abcd"} ),
	"OSM (no lbl)":  L.tileLayer('https://tiles.wmflabs.org/osm-no-labels/{z}/{x}/{y}.png', { maxZoom: 19, minZoom: 6, opacity: 1} ),
	"Watercolor":  L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg', { maxZoom: 19, minZoom: 6, opacity: 1} ),
	"River":  L.tileLayer('https://{s}.tile.openstreetmap.fr/openriverboatmap/{z}/{x}/{y}.png', { maxZoom: 19, minZoom: 6, opacity: 1} ),
	//'',
	// ,
	"Wikimedia": wikimedia,
	"USGS": natmap,
	"ESRI Satellite": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'	, { attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, 	IGP, UPR-EGP, and the GIS User Community'}),
	"Google Satellite" : L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
		maxZoom: 20,
		subdomains:['mt0','mt1','mt2','mt3'],
		attribution: "Google Maps"
	})	
};

var overlays = {
};
  
var map = L.map('map', { 
	zoomControl:false, 
	center: [53.916667, 27.55],
	zoom: 7, 
	// layers: [wikimedia],
	layers: [datamap],
});

map.createPane('borders');
map.getPane('borders').style.zIndex = 650;
map.getPane('borders').style.pointerEvents = 'none';

map.createPane('cities');
map.getPane('cities').style.zIndex = 1050;
map.getPane('cities').style.pointerEvents = 'all';

L.control.layers(Object.assign(baseLayers2), overlays).addTo(map);
// L.marker([53.916667, 27.55], {icon: redMarker}).bindPopup('Мінск').addTo(map);




	/* Initialize the SVG layer */
	var svgLayer = L.svg({attribution: "Gardariki", className: 'dots', pane: 'cities'});
	svgLayer.addTo(map); 
	var tip;

	/* We simply pick up the SVG from the map object */
		var svg = d3.select("#map").select("svg");
		
		svg.style("pointer-events", "all"); 
		
		// svg.raise();
		// console.log("raise");
		
		var g = d3.select("#map").select("svg").select('g');
		g
		// .attr("class", "leaflet-zoom-hide")
		 // .style("position", "absolute")
    // .style("background", "white")
    // .style("opacity", "0")
    // .style("padding", "0 10px")
    // .style("z-index", "999");
	;
		
tip = d3.tip().attr('class', 'd3-tip').html(function(d) { 
		// console.log(d.properties.name);
		return d.properties.name; 
		});
		svg.call(tip); 
		

	d3.json("geo.json", function(geo) {
		/* Add a LatLng object to each item in the dataset */
		// console.log(htls);
		var datum = geo.features;
		datum.forEach(function(d) {
			
			if (d.hasOwnProperty("geometry")){
				var ll = d["geometry"]["coordinates"];
				d.LatLng = new L.LatLng(ll[1],ll[0]);	
				// console.log(d.LatLng);
			}
			
		})
		// var domainOnlyScale = d3.scale.linear().domain([0,2]);
		
		var colors = d3.scaleQuantize()
		.domain([0,2])
		.range(['#f1eef6','#d7b5d8','#df65b0','#dd1c77','#980043']);
		
		var cls  = ['#c994c7','#df65b0','#e7298a','#ce1256','#91003f'];
	
	
	
		var feature = g.selectAll("circle")
			.data(datum)
			.enter().append("circle")
			.style("stroke", "pink")  
			// .style("opacity", .6) 
			// .style("fill", "red")
			.style("fill", function(d){
				// var dm = parseFloat(d.min);
				// console.log(dm);
				// if (dm == 0.01){
					// return cls[4];
				// } else {
					// // console.log("yes");
					// return "black";
				// }
				// return colors(dm);
				return "darkred";
			})
			.attr("r", 7)
			.on('mouseover', tip.show)
			.on('mouseout', tip.hide)
			.on('click' , function(d){ 
				var wikimgd = d.properties.magdeburg_wiki?'<p>Магдэбургскае права (Wiki): '+d.properties.magdeburg_wiki+'</p>':'';
				map.openModal({content: "<h3>" + d.properties.name + "</h3><div><p><a target='_blank' href='https://www.wikidata.org/wiki/" +d.properties.wiki+ "'>Wikidata</a></p><p>Магдэбургскае права: " + d.properties.magdeburg + "</p>"+wikimgd+"</div>"});  
			})
			;  
		map.on("viewreset", update);
		map.on("zoomend", update);
		
		
		
		
		update();
		function update() {
			// console.log("update zoom");
						
			feature.attr("transform", 
			function(d) { 
				return "translate("+ 
					map.latLngToLayerPoint(d.LatLng).x +","+ 
					map.latLngToLayerPoint(d.LatLng).y +")";
				}
			)
		}
	})			 

var customControl =  L.Control.extend({
  options: {
	position: 'topleft'
  },
  onAdd: function (map) {
	var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom info');
	container.innerHTML = map.getZoom();
	// container.onclick = function(){
	  // console.log('buttonClicked');
	// }
	return container;
  },
  update: function (props) {	
	this._container.innerHTML = props;
	}
});

var info = new customControl();
map.addControl(info);
map.on('baselayerchange', function (e) {
	info.update(e.name);
});
map.on('overlayadd', function (e) {
console.log(e.layer.bringToBack());	
}); 

var layerControlElement = document.getElementsByClassName('leaflet-control-layers')[0];
