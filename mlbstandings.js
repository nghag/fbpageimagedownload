var apiKey = 'e66mcfnfxwsxeu8eyfy7cggu';
var http = require('http');
var parseXMLResponse = require('xml2js').parseString;


//mlbStandings(mlbStandingsCallback);
mlbStandingsCallback('/sport/v2/baseball/MLB/standings/2016/standings_MLB.xml?apiKey=CBB9A3EF-D268-455D-BF19-E86C81DB7620');

function mlbStandings(callback) {

    var options = {
        hostname: 'data.tmsapi.com',
        path: '/mlb/standings?maxCount=1&api_key=' + apiKey,
        method: 'GET'
    }

    var xmlResponse = "";

    var req = http.request(options, (res) => {

        res.on('end', () => {
            parseXMLResponse(xmlResponse, (err, result) => {
                callback(result.feed.entry[0].link[0].$.href);
            });

        });
    });

    req.on('error', (e) => {
        console.log(`problem with request: ${e.message}`);
    });

    req.end();
}

function mlbStandingsCallback(standingsLink) {
    var options = {
        hostname: 'xml.sportsdirectinc.com',
        path: standingsLink,
        method: 'GET'
    }

    var standingsResponse = "";

    var req = http.request(options, (res) => {

        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            standingsResponse = standingsResponse + chunk
        });

        res.on('end', () => {
            parseXMLResponse(standingsResponse, (err, result) => {
                console.log(result['sport:content']['team-sport-content'][0]['league-content'][0]['season-content'][0]);
            });
        });

    });

    req.end();
}