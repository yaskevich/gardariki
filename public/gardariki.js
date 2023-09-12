/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
/* eslint-disable vars-on-top */
/* eslint-disable no-var */

$(window).on('load', () => {
  var flags = { en: 'belarus-26903.svg', be: 'flags-38754.svg' };
  var poiCache = {};
  var mapCenter = new L.LatLng(53.916667, 27.55);
  var lang = 'be';
  var currentId;
  var mode = '';

  var oMarker = L.VectorMarkers.icon({
    // icon: 'exclamation-triangle',
    icon: 'landmark',
    markerColor: 'white',
    iconColor: 'black',
    extraClasses: 'fas',
    prefix: 'fa'
    // spin: true,
  });
  var vMarker = L.VectorMarkers.icon({
    // icon: 'exclamation-triangle',
    icon: 'star',
    markerColor: 'white',
    iconColor: 'black',
    extraClasses: 'fas',
    prefix: 'fa'
    // spin: true,
  });

  // L.marker([53.916667, 27.55], {icon: vMarker}).bindPopup('Мінск').addTo(map);
  var CustomIcon = L.Icon.extend({
    options: {
      iconSize: [40, 40],
      // shadowSize:   [50, 64],
      iconAnchor: [20, 40],
      // shadowAnchor: [4, 62],
      // popupAnchor:  [-3, -76]
    }
  });

  // var MagdIcon = new CustomIcon({ iconUrl: '/mdbg.svg'});
  var MagdIcon = new CustomIcon({ iconUrl: './Tower_gardarike-01.svg' });
  // var nIcon = L.divIcon({ html: mgdsvg, iconSize: [24, 38], iconAnchor: [12, 38] })

  function getUrl() {
    var match; var pl = /\+/g;
    var search = /([^&=]+)=?([^&]*)/g;
    var decode = (s) => decodeURIComponent(s.replace(pl, ' '));
    var query = window.location.search.substring(1);
    var urlParams = {};
    // eslint-disable-next-line no-cond-assign
    while (match = search.exec(query)) { urlParams[decode(match[1])] = decode(match[2]); }
    return urlParams;
  }

  function setUrl() {
    if (history.pushState) {
      var newurl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
      var sep = '?';
      if (currentId) {
        newurl += `${sep}id=${currentId}`;
        sep = '&';
      }
      if (mode) {
        newurl += `${sep}q=${mode}`;
        sep = '&';
      }
      if (lang !== 'be') {
        newurl += `${sep}l=${lang}`;
      }
      window.history.pushState({
        path: newurl
      }, '', newurl);
    }
  }
  var urlObj = getUrl();
  if (!('l' in urlObj)) {
    lang = 'be';
  } else {
    lang = urlObj.l;
  }
  if ('q' in urlObj) {
    mode = urlObj.q;
  }
  if ('id' in urlObj) {
    currentId = urlObj.id;
  }

  console.log(JSON.stringify(urlObj));

  var osmAttribution = 'Map data &copy; <a href="https://openstreetmap.org" target="_blank">OpenStreetMap</a>';
  //   var wikimedia = L.tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png', {
  //     maxZoom: 19,
  //     minZoom: 6,
  //     opacity: 1,
  //   });
  //   var datamap = L.tileLayer('https://tiles.gardariki.by/tile/{z}/{x}/{y}.png', {
  //     maxZoom: 19,
  //     minZoom: 6,
  //     opacity: 1
  //   });
  //   var natmap = L.tileLayer.wms('https://basemap.nationalmap.gov/ArcGIS/services/USGSImageryTopo/MapServer/WMSServer', {
  //     layers: '0',
  //     format: 'image/png',
  //     transparent: false,
  //     attribution: 'USGS'
  //   });

  var west = L.tileLayer('https://tiles.historic.place/region/Westrussland/{z}/{x}/{y}.png', {
    maxZoom: 11,
    minZoom: 8,
    opacity: 1
  });

  var osmmap = L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    minZoom: 6,
    opacity: 1,
    attribution: osmAttribution
  });

  var baseLayers2 = {

    // "Datamap": datamap,
    OSM: osmmap,
    'OSM.DE': L.tileLayer('https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png', {
      maxZoom: 19,
      minZoom: 4,
      opacity: 1,
      attribution: osmAttribution
    }),

    'OSM.FR': L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
      maxZoom: 19,
      minZoom: 4,
      opacity: 1,
      attribution: osmAttribution
    }),

    // "AWMC": L.tileLayer("https://a.tiles.mapbox.com/v3/isawnyu.map-knmctlkh/{z}/{x}/{y}.png", {
    //     maxZoom: 19,
    //     minZoom: 6,
    //     opacity: 1
    // }),

    // positron
    CartoDB: L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
      maxZoom: 19,
      minZoom: 6,
      opacity: 1,
      attribution: "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> &copy; <a href='http://cartodb.com/attributions'>CartoDB</a>",
      subdomains: 'abcd'
    }),
    //   "OSM (no lbl)": L.tileLayer('https://tiles.wmflabs.org/osm-no-labels/{z}/{x}/{y}.png', {
    //       maxZoom: 19,
    //       minZoom: 6,
    //       opacity: 1
    //   }),
    Watercolor: L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg', {
      maxZoom: 19,
      minZoom: 6,
      opacity: 1,
      attribution: ' Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'
    }),
    River: L.tileLayer('https://{s}.tile.openstreetmap.fr/openriverboatmap/{z}/{x}/{y}.png', {
      maxZoom: 19,
      minZoom: 6,
      opacity: 1,
      attribution: osmAttribution
    }),
  };

  var datalayer = L.featureGroup();

  var overlays = {
    Гарады: datalayer,
    1905: west
  };

  var map = L.map('map', {
    // zoomControl:false,
    center: mapCenter,
    zoom: 7,
    // layers: [wikimedia],
    // layers: [datamap, vkl],
    layers: [osmmap, datalayer],
  });

  function updateMap() {
    var z = map.getZoom();
    if (z < 7) {
      $('.cityname').addClass('noshowlabel');
    } else {
      $('.cityname').removeClass('noshowlabel');
    }
  }

  $(document).on('click', '.cityscape, .backstory', () => {
    $('.story').toggleClass('hide');
    $('.gallery').toggleClass('hide');
  }).on('click', '.showaddon', () => {
    $(`.addon.${$(e.target).attr('id')}`).toggleClass('hide');
  }).on('click', '.orgview', (e) => {
    var item = $(e.target);
    var latlon = [item.data('lat'), item.data('lon')];
    var name = item.data('title');
    mode = '';
    currentId = getUrl().id;
    e.preventDefault();
    map.closeModal();
    L.marker(latlon, { icon: oMarker }).addTo(map).bindPopup(name);
    map.setView(latlon, 14);
  });

  map.on('viewreset', updateMap);
  map.on('zoomend', updateMap);

  L.easyButton('fa-home', () => {
    window.location.href = '/';
  }).addTo(map);

  L.easyButton('fa-globe', () => {
    map.setView(mapCenter, 7);
    currentId = '';
    mode = '';
    setUrl();
  }).addTo(map);

  // render flag button for switching a language
  (new (L.Control.extend({
    onAdd() {
      var img = L.DomUtil.create('img', 'languages');
      img.src = flags[lang];
      return img;
    }
  }))({ position: 'bottomleft' })).addTo(map);

  $('.languages').on('click', (e) => {
    $('.cityname > .be, .cityname > .en').toggleClass('hide');
    lang = (lang === 'be') ? 'en' : 'be';
    $(e.target).attr('src', flags[lang]);
    setUrl();
  });

  L.control.layers(Object.assign(baseLayers2), overlays).addTo(map);

  function showCity(coords) {
    map.setView(coords, 14);
    if (!(currentId in poiCache)) {
      $.getJSON(`data/poi/${currentId}.json`, (info) => {
        poiCache[currentId] = info;
        // eslint-disable-next-line no-restricted-syntax
        for (x of info) {
          var objname = x.name;
          L.marker([x.geometry.coordinates[1], x.geometry.coordinates[0]], {
            icon: vMarker
          })
            .addTo(map)
            .bindPopup(objname);
        }
      });
    }
  }

  function showCard(coords) {
    // var query = "/api?id=" + id + "&l=" + lang;
    const thisId = currentId;
    var query = `/data/api/${lang}/${currentId}`;
    $.get(query, (result) => {
      mode = 1;
      setUrl();
      mode = 0;
      currentId = '';
      map.openModal({
        content: result,
        transitionDuration: 0,
        MODAL_CLS: 'citycard',
        onHide() {
          setUrl();
        }
      });
      $('.tabs').tabs();
      $('body').on('click', (event) => {
        if (!($(event.target).closest('.citycard').length && !$(event.target).is('.citycard'))) {
          map.closeModal();
        }
      });
      $('.mapview').on('click', () => {
        map.closeModal();
        currentId = thisId;
        showCity(coords);
      });
    });
  }

  var onMarkerClick = (e) => {
    currentId = e.target.options.city;
    showCard(e.latlng);
  };

  function populateMap(geodata) {
    var pref = { be: 'hide', en: 'hide' };
    pref[lang] = '';
    // console.log("pref", pref);
    geodata.features.forEach((d) => {
      if (d.properties.id !== 6) {
        var ll = d.geometry.coordinates;
        var { id } = d.properties;
        d.LatLng = new L.LatLng(ll[1], ll[0]);
        // var c = L.circleMarker(d.LatLng, { radius : 5, text : d.properties.name});
        // console.log(d.properties.name_be, id);
        // var offsetX = id == 40 ? 40 : 0;
        var offsetX = id === 40 ? 40 : 0;
        // var offsetY = id == 58 ? -30 : -20;
        var offsetY = id === 58 ? -30 : 0;
        if (!offsetY) { // Барысаў
          offsetY = id === 12 ? -4 : 0;
        }
        if (!offsetY) { // Мінск
          offsetY = id === 47 ? -5 : 0;
        }
        if (!offsetY) { // Віцебск
          offsetY = id === 51 ? -3 : 0;
        }
        if (!offsetY) { // Гомель
          offsetY = id === 52 ? -2 : 0;
        }
        if (Number(currentId) === id) {
          // eslint-disable-next-line no-unused-expressions
          mode ? showCard(d.LatLng) : showCity(d.LatLng);
        }

        var fmtName = `<span class="be ${pref.be}">${d.properties.name_be}</span><span class="en ${pref.en}">${d.properties.name_en}</span>`;
        L.marker(d.LatLng, {
          icon: MagdIcon,
          city: d.properties.id
        })
        // var place =  L.circleMarker(d.LatLng, { "radius": 10, "color": "darkred", "city": d.properties.id})
          .on('click', onMarkerClick)
        // .bindLabel('123', { noHide: true, direction: 'auto'})
          .bindTooltip(fmtName, {
            permanent: true,
            className: 'cityname',
            offset: [offsetX, offsetY],
            opacity: 1,
            direction: 'center'
          })
        // .bindPopup('Скарб')
          .addTo(datalayer);
      }
    });
  }
  populateMap(geojson);
  // if (geojson) {
  //   populateMap(geojson);
  // } else {
  //   $.getJSON('list.json', (geo) => {
  //     populateMap(geo);
  //   });
  // }
});
