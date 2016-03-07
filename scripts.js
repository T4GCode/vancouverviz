/**
 * Created by pannellr on 2016-03-05.
 */


//================rickey map listings by neighborhood

var neighbourhoodFrequncy = {};

_.each(listings, function(listing) {
    if (!neighbourhoodFrequncy.hasOwnProperty(listing.neighbourhood)) {
        neighbourhoodFrequncy[listing.neighbourhood] = {
            name: listing.neighbourhood,
            frequency: 1
        };
    } else {
        neighbourhoodFrequncy[listing.neighbourhood]['frequency']++;
    }
});

var map = L.map('map').setView([49.2827, -123.1207], 12);

function getColor(d) {
    console.log('in color');
    console.log(d);
    return d > 640 ? '#800026' :
        d > 320  ? '#BD0026' :
        d > 160  ? '#E31A1C' :
        d > 80  ? '#FC4E2A' :
        d > 40   ? '#FD8D3C' :
        d > 20   ? '#FEB24C' :
        d > 10   ? '#FED976' :
        '#FFEDA0';
}

function style(feature) {
    console.log('in style');
    console.log(feature.properties.neighbourhood);
    return {
        fillColor: getColor(neighbourhoodFrequncy[feature.properties.neighbourhood]['frequency']),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.light'
}).addTo(map);

L.geoJson(neighbourhoods, {style: style}).addTo(map);

//=====================end rickey===================