var FB = require('fb');
var http = require('https');
var fs = require('fs');
var async = require('async');
var pathModule = require('path');

var imageDir = "FacebookImages"

FB.options({
    appId: 944133355628236,
    appSecret: '230f5dd4b8fb5b2a8a076fdf49603bec',
    accessToken: '944133355628236|m83r3DdRtrkvavTuxgzvzog4Xd0'
});

//86037497258 - Chelsea FC pageid
var pageId = '/86037497258';
var pageFields = {};



var pageAlbumPath = pageId + '/albums'
var albumFields = {
    "fields": "id,name,count,updated_time",
    "after": ""
};


var albumPhotoDetails = {
    "fields": "photos{images,id,created_time,updated_time}"
};
var albumArray = [];

// getPageDetails(pageId, pageFields, pageDetailsCallBack);
// loopPageAlbum(pageAlbumPath, albumFields, albumDetailsCallback);

async.waterfall(
    [

        fbPageDetails,
        createPageDir,
        createAlbumDir,
        downloadAlbum

    ], function final(err, result) {
        if (err) {
            console.log(err.message);
            return;
        }

        console.log(result);
    }
);

function fbPageDetails(callback) {

    function pageDetailsCallBack(response) {
        if (!response || response.error) {
            console.log(response ? 'error occurred' : response.error);
            callback(response.error);
        }
        callback(null, response.name);
    }

    function getPageDetails(pageId, pageFields, callback) {
        FB.api(pageId, 'GET', pageFields, callback);
    }

    getPageDetails(pageId, pageFields, pageDetailsCallBack);

}

function createPageDir(pageName, callback) {
    checkCreateDir(pageName, callback);
}

function createAlbumDir(pageName, callback) {

    function loopPageAlbum(path, albumFields, callback) {
        FB.api(path, 'GET', albumFields, callback);
    }

    function albumDetailsCallback(response) {
        if (!response || response.error) {
            console.log(response ? 'error occurred' : response.error);
            return;
        }

        //filter album with no photos
        var filteredAlbumData = response.data.filter((albumItem) => {
            return albumItem.count > 0;
        });

        if (filteredAlbumData.length > 0) {

            filteredAlbumData.forEach((value) => {

                albumArray.push(value);

                var albumPath = pathModule.join(__dirname, imageDir, pageName, value.name.replace(':', '').replace('/', '') + '-' + value.id)

                fs.access(albumPath, fs.F_OK, (err) => {
                    if (err) {
                        if (err.errno === -4058) {

                            fs.mkdir(albumPath, (err) => {
                                if (err) {
                                    console.log(err.message);
                                    return;
                                }
                            });
                        }
                        else {
                            console.log(err.message);
                        }
                    }
                    else {
                        //Commenting it for now
                        //console.log("Director exists");
                    }
                });

            });
        }

        if (response.data.length !== 0) {
            albumFields.after = response.paging.cursors.after;
            loopPageAlbum(pageAlbumPath, albumFields, albumDetailsCallback);
        }
        else {
            console.log("End of response");
            callback(null, albumArray, pageName);
        }
    }

    loopPageAlbum(pageAlbumPath, albumFields, albumDetailsCallback);
}

function downloadAlbum(albumDetails, pageName, callback) {

    loopAlbumDetails(albumDetails[1].id);

    function loopAlbumDetails(albumId) {
        FB.api('/' + albumId, 'GET', albumPhotoDetails, downloadAlbumCallBack);
    }

    function downloadAlbumCallBack(albumDetailsResponse) {
        if (!albumDetailsResponse || albumDetailsResponse.error) {
            console.log(response ? 'error occurred' : response.error);
            callback(err.message);
        }

        //change for loop
        for (counter = 0; counter < albumDetailsResponse.photos.data.length; counter++) {

            //var downloadAlbumPath = pathModule.join(__dirname, imageDir, pageName, albumDetails[1].name.replace(':', '').replace('/', '') + '-' + albumDetails[1].id)
            //console.log(downloadAlbumPath);

            //console.log("Downloading : " + dir + '/' + response.photos.data[counter].images[0].source);
            downloadImage(albumDetailsResponse.photos.data[counter].id, albumDetailsResponse.photos.data[counter].images[0].source);
        }
    }
}



function checkCreateDir(dirName, callback) {

    var dirPath = pathModule.join(__dirname, imageDir, dirName.replace(':', '').replace('/', ''));

    fs.access(dirPath, fs.F_OK, (err) => {
        if (err) {
            if (err.errno === -4058) {

                fs.mkdir(dirPath, (err) => {
                    if (err) {
                        callback(err);
                    }
                });
            }
            else {
                callback(err);
            }
        }
        else {
            console.log("Director exists");
        }
        callback(null, dirName);
    });
}

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