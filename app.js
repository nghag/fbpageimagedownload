var FB = require('fb');
var http = require('https');
var fs = require('fs');
var async = require('async');

var dir = "./FacebookImages/"

FB.options({

    appId: 944133355628236,
    appSecret: '230f5dd4b8fb5b2a8a076fdf49603bec',
    accessToken: '944133355628236|m83r3DdRtrkvavTuxgzvzog4Xd0'
});

FB.api('oauth/access_token', {
    client_id: '944133355628236',
    client_secret: '230f5dd4b8fb5b2a8a076fdf49603bec',
    grant_type: 'client_credentials'
}, function (res) {
    if (!res || res.error) {
        console.log(!res ? 'error occurred' : res.error);
        return;
    }
});

//86037497258 - Chelsea FC pageid


FB.api(
    '/86037497258/albums',
    'GET',
    { "fields": "id,name,count,updated_time", "limit": "5" },
    function (response) {
        if (!response || response.error) {
            console.log(response ? 'error occurred' : response.error);
            return;
        }


        //change for loop
        for (var index = 1; index < response.data.length; index++) {

            //check update datetime and count 
            //check and create album directory            

            //convert to function
            FB.api(
                '/' + response.data[index].id,
                'GET',
                { "fields": "photos{images,id,created_time,updated_time}" },
                function (response) {

                    if (!response || response.error) {
                        console.log(response ? 'error occurred' : response.error);
                        return;
                    }

                    //change for loop
                    for (counter = 0; counter < response.photos.data.length; counter++) {

                        console.log("Downloading : " + dir + '/' + response.photos.data[counter].images[0].source);
                        downloadImage(dir + response.photos.data[counter].id, response.photos.data[counter].images[0].source);

                    }
                }
            );
        }
    }
);

function downloadImage(imageId, imageURL) {

    try {
        http.get(imageURL, function (fileResponse) {
            var file = fs.createWriteStream(imageId + ".jpg");
            fileResponse.pipe(file);
            console.log("Download Complete " + imageId);
        });
    } catch (err) {
        console.log(err.message);
    }
}

function guid() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
}