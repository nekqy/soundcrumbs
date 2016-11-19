var
    fs = require('fs'),
    fileUpload = require('express-fileupload');

exports.init = function(app) {
    app.use(fileUpload());

    app.post('/uploadmp3', function(req, mainRes) {
        var sampleFile;

        if (!req.files) {
            mainRes.send('{"error": "error! No files were uploaded"}');
            return;
        }
        if (!req.body.sid) {
            mainRes.send('{"error": "error! no sid"}');
            return;
        }
        if (!req.body.uploadUrl) {
            mainRes.send('{"error": "error! no uploadUrl"}');
            return;
        }

        sampleFile = req.files.file;
        var uuid = require('node-uuid');

        var name = uuid.v4();

        console.log('saving to: ' + __dirname + '/' + name + '.mp3');
        sampleFile.mv(__dirname + '/' + name + '.mp3', function(err) {
            if (err) {
                mainRes.status(500).send(err);
            }
            else {
                console.log('audiofile saved');
                saveToVk(req.body.sid, name, mainRes, req.body.uploadUrl);
            }
        });
    });

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
        if (!req.body.uploadUrl) {
            mainRes.send('{"error": "error! no uploadUrl"}');
            return;
        }

        sampleFile = req.files.file;
        var uuid = require('node-uuid');

        var name = uuid.v4();

        console.log('saving to: ' + __dirname + '/' + name + '.wav');
        sampleFile.mv(__dirname + '/' + name + '.wav', function(err) {
            if (err) {
                mainRes.status(500).send(err);
            }
            else {
                console.log('audiofile saved');

                var sox = require('sox');

                console.log('transcode: ' + name + '.wav');
                console.log('exists:' ,fs.existsSync(__dirname + '/' + name + '.wav'));
                var job = sox.transcode('server/' + name + '.wav', 'server/' + name + '.mp3');
                job.on('error', function(err) {
                    console.error(err);
                    fs.rename(__dirname + '/' + name + '.wav', __dirname + '/' + name + '.mp3');
                    saveToVk(req.body.sid, name, mainRes);
                });
                job.on('end', function() {
                    console.log('audiofile converted');
                    saveToVk(req.body.sid, name, mainRes, req.body.uploadUrl);
                });
                job.start();
            }
        });
    });

    function saveToVk(sid, name, mainRes, uploadUrl) {
        var request = require('request');

        var params = {
            uri: uploadUrl,
            method: 'POST',
            json: true,
            formData: {file: fs.createReadStream(__dirname + '/' + name + '.mp3')}
        };

        request(params, function (err, resp, body) {
            if (err) {
                console.log('Error!');
                unlinkFiles(name);
                mainRes.status(500).send(err);
            } else {
                unlinkFiles(name);
                mainRes.write(JSON.stringify({
                    server: body.server,
                    audio: body.audio,
                    hash: body.hash,
                    artist: 'soundcrumbs',
                    title: name
                }));
                mainRes.end();
            }
        });
    }
    function unlinkFiles(name) {
        function unlinkFile(name) {
            fs.exists(__dirname + '/' + name, function(exists) {
                if (exists) {
                    fs.unlink(__dirname + '/' + name);
                }
            });
        }
        unlinkFile(name + '.wav');
        unlinkFile(name + '.mp3');
    }
};