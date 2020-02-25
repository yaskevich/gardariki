$(function() {
	var pois = {};
	var defLayerIndex = 10;
	var osm_attr = 'Map data <a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia maps</a> &copy; <a href="http://openstreetmap.org" target="_blank">OpenStreetMap</a>';
	var wikimedia = L.tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png', { maxZoom: 19, minZoom: 6, opacity: 1} );
	var datamap = L.tileLayer('https://datamap.by/bright/{z}/{x}/{y}.png', { maxZoom: 19, minZoom: 6, opacity: 1} );
	var natmap = L.tileLayer.wms("http://basemap.nationalmap.gov/ArcGIS/services/USGSImageryTopo/MapServer/WMSServer", { layers: "0", format: "image/png", transparent: false, attribution: "USGS" });

	var west = L.tileLayer('https://tiles.historic.place/region/Westrussland/{z}/{x}/{y}.png', { maxZoom: 11, minZoom: 8, opacity: 1} );
	

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

	var datalayer = L.featureGroup()
	 // .bindPopup('Hello world!')
		// .on('click', function(e) { 
			// alert('Clicked on a member of the group!'); 
			// // console.log(e);
			// console.log(this.options);
			// console.log(e);
		// })
		;  

	var overlays = {
		"Гарады": datalayer,
		"1905": west
	};

	var map = L.map('map', { 
		zoomControl:false, 
		center: [53.916667, 27.55],
		zoom: 7, 
		// layers: [wikimedia],
		// layers: [datamap, vkl],
		layers: [datamap, datalayer],
	});
	  
	L.control.layers(Object.assign(baseLayers2), overlays).addTo(map);
	
		var redMarker = L.VectorMarkers.icon({
		//icon: 'exclamation-triangle',
		icon: 'landmark',
		markerColor:"white",
		iconColor: "black",
		extraClasses: 'fas',
		prefix: 'fa'
		// spin: true,
	  });
	  
	  
	// L.marker([53.916667, 27.55], {icon: redMarker}).bindPopup('Мінск').addTo(map);


	 var CustomIcon = L.Icon.extend({
				options: {
					iconSize:     [40, 40],
					// shadowSize:   [50, 64],
					// iconAnchor:   [22, 94],
					// shadowAnchor: [4, 62],
					// popupAnchor:  [-3, -76]
				}
			});

	var MagdIcon = new CustomIcon({iconUrl: '/mdbg.svg'});
	// var nIcon = L.divIcon({ html: mgdsvg, iconSize: [24, 38], iconAnchor: [12, 38] })
			
			
	var onMarkerClick = function(e){
		var cid = this.options.city;
		var cll = e.latlng;
		console.log(cid, e.latlng);
		// return;
		d3.text("/api?id="+cid, function(result) {
			map.openModal({content: result});
			$('.tabs').tabs();
			$('.click').click(function(){
				// map.panTo(new L.LatLng(52, 24));
				console.log(cid);
				map.setView(cll, 14);
				map.closeModal();
				if (pois.hasOwnProperty(cid)){
					// pois[cid]
				} else {
					d3.json("data/poi/"+cid+'.json', function(info) {
							pois[cid] = info;
							
							for (x of info){
									console.log(x.tourism);
									// console.log(x);
									// console.log(x.geometry.coordinates);
									// L.marker([x.geometry.coordinates[1], x.geometry.coordinates[0]], {icon: redMarker}).bindPopup('Мінск').addTo(vkl);
									L.marker([x.geometry.coordinates[1], x.geometry.coordinates[0]], {icon: redMarker}).addTo(map).on('mouseover', function(e){console.log("kek");});
							}
					});							
				}
			});
		});		
	}		
	// L.marker([53.56807, 26.13735], {icon: MagdIcon}).bindPopup('Камень').addTo(datalayer);
	// L.marker([53.56807, 26.13735], {"icon": MagdIcon, "city": 100});

	d3.json("list.json", function(geo) {
		geo.features.forEach(function(d) {
			if (d.properties.id != 6) {
			var ll = d["geometry"]["coordinates"];
			d.LatLng = new L.LatLng(ll[1],ll[0]);	
			// var c = L.circleMarker(d.LatLng, { radius : 5, text : d.properties.name});
			var place =  L.marker(d.LatLng, {"icon": MagdIcon, "city": d.properties.id})
				.on('click', onMarkerClick)
				// .bindLabel('123', { noHide: true, direction: 'auto'})
				.bindTooltip(d.properties.name, {permanent: true, className: "cityname", offset: [0, -20], opacity: 1, direction: "center" })
				// .bindPopup('Скарб')
				.addTo(datalayer)
				;
			}
		})
	})			 
});