/**
 * Created by pannellr on 2016-03-05.
 */

var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var formatPercent = d3.format(".0%");

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1, 1);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(formatPercent);

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


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

d3.json("./vancouver_data/listings.json", function(error, l) {



    //convert to array
    var frequencyList = Object.keys(neighbourhoodFrequncy).map(function (key) {return neighbourhoodFrequncy[key]});

    frequencyList.forEach(function(d) {
        d.frequency = +d.frequency;
    });

    x.domain(frequencyList.map(function(d) { return d.name; }));
    y.domain([0, d3.max(frequencyList, function(d) { return d.frequency; })]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .style("text-anchor", "end");

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Frequency");

    svg.selectAll(".bar")
        .data(frequencyList)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.name); })
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d.frequency); })
        .attr("height", function(d) { return height - y(d.frequency); });

    d3.select("input").on("change", change);

    var sortTimeout = setTimeout(function() {
        d3.select("input").property("checked", true).each(change);
    }, 2000);

    function change() {
        clearTimeout(sortTimeout);

        // Copy-on-write since tweens are evaluated after a delay.
        var x0 = x.domain(frequencyList.sort(this.checked
                ? function(a, b) { return b.frequency - a.frequency; }
                : function(a, b) { return d3.ascending(a.name, b.name); })
            .map(function(d) { return d.name; }))
            .copy();

        svg.selectAll(".bar")
            .sort(function(a, b) { return x0(a.name) - x0(b.name); });

        var transition = svg.transition().duration(750),
            delay = function(d, i) { return i * 50; };

        transition.selectAll(".bar")
            .delay(delay)
            .attr("x", function(d) { return x0(d.name); });

        transition.select(".x.axis")
            .call(xAxis)
            .selectAll("g")
            .delay(delay);
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
