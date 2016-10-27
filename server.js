var express = require('express'),
    cors = require('cors');

var app = express();
var corsOptions = {
    "preflightContinue": true,
    origin: true,
    credentials: true
};
app.use(cors());

app.options('*', cors(corsOptions)); // include before other routes
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "GET, POST","PUT");
    next();

});
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(express.static('app'));
app.listen(3000, '0.0.0.0', function () {
    console.log('Example app listening on port 3000!');
});

var fileUpload = require('express-fileupload');
app.use(fileUpload());
app.post('/upload', function(req, mainRes) {
    var sampleFile;

    if (!req.files) {
        mainRes.send('{"error": "error! No files were uploaded"}');
        return;
    }
    if (!req.body.sid) {
        mainRes.send('{"error": "error! no sid"}');
        return;
    }

    sampleFile = req.files.sampleFile;
    var uuid = require('node-uuid');

    var name = uuid.v4() + '.mp3';

    sampleFile.mv(__dirname + '/' + name, function(err) {
        if (err) {
            mainRes.status(500).send(err);
        }
        else {
            var VK = require('vksdk');

            var vk = new VK({
                'appId'     : 5491230,
                'appSecret' : 'sOAx342oSt5aULyhsbdJ',
                'mode'      : 'oauth',
                'version'   : '5.59'
            });
            vk.setSecureRequests(true);
            vk.setToken(req.body.sid);

            vk.request('audio.getUploadServer');
            vk.on('done:audio.getUploadServer', function(_o) {
                var uploadUrl = _o.response['upload_url'];

                var request = require('request');
                var fs = require('fs');

                var params = {
                    uri: uploadUrl,
                    method: 'POST',
                    json: true,
                    formData: {file: fs.createReadStream(__dirname + '/' + name)}
                };

                request(params, function (err, resp, body) {
                    if (err) {
                        console.log('Error!');
                    } else {
                        vk.request('audio.save', {
                            server: body.server,
                            audio: body.audio,
                            hash: body.hash,
                            artist: 'soundcrumbs',
                            title: name
                        });
                        vk.on('done:audio.save', function(_o) {
                            mainRes.write(JSON.stringify(_o));
                            mainRes.end();

                            fs.unlink(__dirname + '/' + name);
                        });

                    }
                });
            });
        }
    });
});
