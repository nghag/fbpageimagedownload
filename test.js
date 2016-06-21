var path = require('path');

//console.log(path.join(__dirname,"FacebookImage"));

var interval = 10 * 1000; // 10 seconds;

for (var i = 0; i <= 10; i++) {
    setTimeout(function (i) {
        var url = 'www.myurl.com=' + TheUrl[i];
        request(url, function (error, resp, body) {
            
        });
    }, interval * i, i);
}