var http = require('http');

var apiKey = 'e66mcfnfxwsxeu8eyfy7cggu'; //OnConnect API Key


movieShowTimesAPIAI('Teenage Mutant Ninja Turtles: Out of the Shadows');

function movieShowTimesAPIAI(movieName) {

  var today = getTodaysDate();

  var options = {
    hostname: 'data.tmsapi.com',
    path: '/v1.1/movies/showings?startDate=' + today + '&zip=78701&api_key=' + apiKey,
    method: 'GET'
  }

  var jsonResponse = "";

  var req = http.request(options, (res) => {

    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      jsonResponse = jsonResponse + chunk
    });

    res.on('end', () => {
      console.log('No more data in response.');

      var data = JSON.parse(jsonResponse);      

      var movieDetails = data.filter((data) => data.title === movieName)[0];
            

      var msgDataObj = {
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements: []
          }
        }
      };

      var showtimeslength = (movieDetails.showtimes.length < 9? 9 : movieDetails.showtimes.length)

      console.log(showtimeslength);        

      for (var innerindex = 0; innerindex < showtimeslength; innerindex++) {

        var elementObj = {};
        elementObj.title = movieDetails.title;
        elementObj.subtitle = movieDetails.showtimes[innerindex].theatre.name + " " + movieDetails.showtimes[innerindex].dateTime;
        if (movieDetails.preferredImage.uri) {
          elementObj.image_url = 'http://demo.tmsimg.com/' + movieDetails.preferredImage.uri + '?api_key=' + apiKey;
        }

        elementObj.buttons = [];

        if (movieDetails.officialUrl) {
          elementObj.buttons.push(
            {
              type: "web_url",
              url: movieDetails.officialUrl,
              title: "Official URL"
            });
        }

        if (movieDetails.showtimes[innerindex].ticketURI) {
          elementObj.buttons.push(
            {
              type: "web_url",
              url: movieDetails.showtimes[innerindex].ticketURI,
              title: "Fandango URL"
            });
        }

        msgDataObj.attachment.payload.elements.push(elementObj);
      }

      console.log(msgDataObj);

    });
  });

  req.on('error', (e) => {
    console.log(`problem with request: ${e.message}`);
  });

  req.end();
}

function getTodaysDate() {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1;
  var yyyy = today.getFullYear();

  if (dd < 10) { dd = '0' + dd }
  if (mm < 10) { mm = '0' + mm }

  return yyyy + "-" + mm + "-" + dd;
}