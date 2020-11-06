$(window).on('load', function(){
	var pois = {};
	var mapCenter = new L.LatLng(53.916667, 27.55);
	var coordsNow;
	var lang = "be";
	var cur_id;
	var mode = "";
	
	// init materialize.css
	// $('.sidenav').sidenav();
	// $('.parallax').parallax();
	// init materialize.css
	
    function getUrl() {
        var match, pl = /\+/g,
            search = /([^&=]+)=?([^&]*)/g,
            decode = function(s) {
                return decodeURIComponent(s.replace(pl, " "));
            },
            query = window.location.search.substring(1);

        var urlParams = {};
        while (match = search.exec(query))
            urlParams[decode(match[1])] = decode(match[2]);

        return urlParams;
    }

    function setUrl() {
        if (history.pushState) {
            var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname;
			var sep = '?';
			if (cur_id) {
				newurl += sep + 'id=' + cur_id;
				sep = '&';
			}
			
            if (mode) {
                newurl += sep + 'q=' + mode;
				sep = '&';
            }
			if (lang != "be") {
				newurl += sep + 'l=' + lang;
			}
            window.history.pushState({
                path: newurl
            }, '', newurl);
        }
		console.log(newurl);
    }
	var urlObj = getUrl();
	if (!urlObj.hasOwnProperty("l")) {
		lang = "be";
	} else {
		lang=urlObj["l"];
	}
	if (urlObj.hasOwnProperty("q")) {
		mode = urlObj["q"];
	}
	
	if (urlObj.hasOwnProperty("id")) {
		cur_id = urlObj["id"];
	}
	
	console.log(JSON.stringify(urlObj));
    
    var osm_attr = 'Map data &copy; <a href="https://openstreetmap.org" target="_blank">OpenStreetMap</a>';
    var wikimedia = L.tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png', {
        maxZoom: 19,
        minZoom: 6,
        opacity: 1
    });
    var datamap = L.tileLayer('https://datamap.by/tile/{z}/{x}/{y}.png', {
        maxZoom: 19,
        minZoom: 6,
        opacity: 1
    });
    var natmap = L.tileLayer.wms("https://basemap.nationalmap.gov/ArcGIS/services/USGSImageryTopo/MapServer/WMSServer", {
        layers: "0",
        format: "image/png",
        transparent: false,
        attribution: "USGS"
    });

    var west = L.tileLayer('https://tiles.historic.place/region/Westrussland/{z}/{x}/{y}.png', {
        maxZoom: 11,
        minZoom: 8,
        opacity: 1
    });


    var baseLayers2 = {

        "Datamap": datamap,
        "OSM": L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            minZoom: 6,
            opacity: 1
        }),
        "OSM.DE": L.tileLayer("https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png", {
            maxZoom: 19,
            minZoom: 4,
            opacity: 1
        }),
        "AWMC": L.tileLayer("https://a.tiles.mapbox.com/v3/isawnyu.map-knmctlkh/{z}/{x}/{y}.png", {
            maxZoom: 19,
            minZoom: 6,
            opacity: 1
        }),
        //positron
        "CartoDB": L.tileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png", {
            maxZoom: 19,
            minZoom: 6,
            opacity: 1,
            "attribution": "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> &copy; <a href='http://cartodb.com/attributions'>CartoDB</a>",
            "subdomains": "abcd"
        }),
        "OSM (no lbl)": L.tileLayer('https://tiles.wmflabs.org/osm-no-labels/{z}/{x}/{y}.png', {
            maxZoom: 19,
            minZoom: 6,
            opacity: 1
        }),
        "Watercolor": L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg', {
            maxZoom: 19,
            minZoom: 6,
            opacity: 1
        }),
        "River": L.tileLayer('https://{s}.tile.openstreetmap.fr/openriverboatmap/{z}/{x}/{y}.png', {
            maxZoom: 19,
            minZoom: 6,
            opacity: 1
        }),
        //'',
        // ,
        // "Wikimedia": wikimedia,

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
        // zoomControl:false, 
        center: mapCenter,
        zoom: 7,
        // layers: [wikimedia],
        // layers: [datamap, vkl],
        layers: [datamap, datalayer],
    });

    function map_update(d) {
        var z = map.getZoom();
        if (z < 7) {
            $('.cityname').addClass("noshowlabel");
        } else {
            $('.cityname').removeClass("noshowlabel");
        }
    }

    // $(document).ready(function(){
    // $('.materialboxed').materialbox();
    // });

    $(document).on("click", ".cityscape, .backstory", function() {
        $(".story").toggleClass("hide");
        $(".gallery").toggleClass("hide");
    }).on("click", ".showaddon", function() {
        $(".addon."+$(this).attr("id")).toggleClass("hide");
    }).on("click", ".orgview", function(ev) {
		var item = $(this);
		var latlon = [item.data("lat"), item.data("lon")];
		var name = item.data("title");
		mode = "";
		cur_id = getUrl()["id"];
		ev.preventDefault();
		map.closeModal();
		L.marker(latlon, {icon: oMarker}).addTo(map).bindPopup(name);
		map.setView(latlon, 14);
				
		// map.closeModal();
		// cur_id = id;
		// showCity(id, coords);
    });


    map.on("viewreset", map_update);
    map.on("zoomend", map_update);

    L.easyButton('fa-home', function(btn, map) {
        window.location.href = '/';
    }).addTo(map);

    L.easyButton('fa-globe', function(btn, map) {
        map.setView(mapCenter, 7);
		cur_id = "";
		mode = "";
		setUrl();
    }).addTo(map);
	
	// L.easyButton('<img src="Flag_of_the_United_States_cleaned.svg" style="" class="responsive-img svgbtn">', function(btn, map){
    // var antarctica = [-77,70];
    // map.setView(antarctica);
	// }).addTo(map);
	
	
	L.Control.Watermark = L.Control.extend({
    onAdd: function(map) {
        var img = L.DomUtil.create('img', 'languages');
		// 
        img.src = lang=="be"? 'flags-38754.svg':"belarus-26903.svg";
		// console.log("create flag", lang);
        img.style.width = '80px';
        return img;
    }
});

L.control.watermark = function(opts) {
    return new L.Control.Watermark(opts);
}

L.control.watermark({ position: 'bottomleft' }).addTo(map);

$('.languages').on('click', function () {
	$('.cityname > .be, .cityname > .en').toggleClass('hide');
	// console.log("lang", lang);
	if (lang == "be") {
		// switch to English
		lang = "en";
		$(this).attr("src","belarus-26903.svg");
		
	} else {
		// switch to Belarusian
		$(this).attr("src","flags-38754.svg");
		lang = "be";
	}
	setUrl();
	
	
});

    L.control.layers(Object.assign(baseLayers2), overlays).addTo(map);

    var oMarker = L.VectorMarkers.icon({
        //icon: 'exclamation-triangle',
        icon: 'landmark',
        markerColor: "white",
        iconColor: "black",
        extraClasses: 'fas',
        prefix: 'fa'
        // spin: true,
    });
    var vMarker = L.VectorMarkers.icon({
        //icon: 'exclamation-triangle',
        icon: 'star',
        markerColor: "white",
        iconColor: "black",
        extraClasses: 'fas',
        prefix: 'fa'
        // spin: true,
    });


    // L.marker([53.916667, 27.55], {icon: vMarker}).bindPopup('Мінск').addTo(map);


    var CustomIcon = L.Icon.extend({
        options: {
            iconSize: [40, 40],
            // shadowSize:   [50, 64],
            iconAnchor:   [20, 40],
            // shadowAnchor: [4, 62],
            // popupAnchor:  [-3, -76]
        }
    });

    // var MagdIcon = new CustomIcon({ iconUrl: '/mdbg.svg'});
    var MagdIcon = new CustomIcon({ iconUrl: '/Tower_gardarike-01.svg'});
    // var nIcon = L.divIcon({ html: mgdsvg, iconSize: [24, 38], iconAnchor: [12, 38] })

	function showCity(id, coords) {
		map.setView(coords, 14);
			if (!pois.hasOwnProperty(id)) {
				$.getJSON("data/poi/" + id + '.json', function(info) {
					pois[id] = info;

					for (x of info) {
						var objname = x.name;
						L.marker([x.geometry.coordinates[1], x.geometry.coordinates[0]], {
								icon: vMarker
							})
							.addTo(map)
							.bindPopup(objname)
							.on('mouseover', function(e) {
								// console.log("kek");
							});
					}
				});
			}
	}
	
	function showCard(id, coords) {
        $.get("/api?id=" + id+"&l=" + lang, function(result) {
			mode = 1;
            setUrl();
			mode = 0;
			cur_id = "";
            map.openModal({
                content: result,
				transitionDuration: 0,
                MODAL_CLS: 'citycard',
				onHide: function(evt){ 
					// var modal = evt.modal; ...
					// console.log("close modal", cur_id, mode);
					setUrl();
					// setUrl(urlObj["id"]);
					// urlObj = {};
				}
            });
			// $('.i18n.'+lang).removeClass('hide');
            $('.tabs').tabs();
            $('body').click(function(event) {
                if (!($(event.target).closest('.citycard').length && !$(event.target).is('.citycard'))) {
                    map.closeModal();
				 }
            });
            // $('.materialboxed').materialbox();
            // $('.slider').slider({"height": 100});
            $('.mapview').click(function() {
				map.closeModal();
				cur_id = id;
				showCity(id, coords);
            });
			
        });		
	}
	
    var onMarkerClick = function(e) {
        var cid = this.options.city;
        var cll = e.latlng;
		cur_id = cid;
        showCard(cid, cll);
    }	

	function populateMap(geodata){
		var pref = {"be": "hide", "en": "hide"};
		pref[lang] = "";
		// console.log("pref", pref);
		geodata.features.forEach(function(d) {
            if (d.properties.id != 6) {
                var ll = d["geometry"]["coordinates"];
                var id = d.properties.id;
                d.LatLng = new L.LatLng(ll[1], ll[0]);
                // var c = L.circleMarker(d.LatLng, { radius : 5, text : d.properties.name});
                // console.log(d.properties.name_be, id);
                // var offset_x = id == 40 ? 40 : 0;
                var offset_x = id == 40 ? 40 : 0;
                
				
				
                // var offset_y = id == 58 ? -30 : -20;
                var offset_y = id == 58 ? -30 : 0;
				
				if(!offset_y) { //Барысаў
					offset_y = id == 12 ? -4 : 0;
				}
				if(!offset_y) { //Мінск
					offset_y = id == 47 ? -5 : 0;
				}
				if(!offset_y) { // Віцебск
					offset_y = id == 51 ? -3 : 0;
				}
				if(!offset_y) { // Гомель
					offset_y = id == 52 ? -2 : 0;
				}
				

				if (cur_id == id){
					(mode == 1) 
						? 
						showCard(id, d.LatLng) 
						: 
						showCity(id, d.LatLng);
				}
				// console.log("lang", lang);
				
				var fmtName  = '<span class="be 	'+pref["be"]+'">' + d.properties.name_be + '</span><span class="en '+pref["en"]+'">' + d.properties.name_en + '</span>';				
                var place = L.marker(d.LatLng, {
                        "icon": MagdIcon,
                        "city": d.properties.id
                    })
                    // var place =  L.circleMarker(d.LatLng, { "radius": 10, "color": "darkred", "city": d.properties.id})
                    .on('click', onMarkerClick)
                    // .bindLabel('123', { noHide: true, direction: 'auto'})
                    .bindTooltip(fmtName, {
                        permanent: true,
                        className: "cityname",
                        offset: [offset_x, offset_y],
                        opacity: 1,
                        direction: "center"
                    })
                    // .bindPopup('Скарб')
                    .addTo(datalayer);
            }
        })
	}


    $.getJSON("list.json", function(geo) {
		populateMap(geo);
    })
});