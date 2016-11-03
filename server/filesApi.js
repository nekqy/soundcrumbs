var
    fs = require('fs'),
    fileUpload = require('express-fileupload');

exports.init = function(app) {
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
                    saveToVk(req.body.sid, name, mainRes);
                });
                job.start();
            }
        });
    });

    function saveToVk(sid, name, mainRes) {
        var VK = require('vksdk');

        var vk = new VK({
            'appId'     : 5491230,
            'appSecret' : 'sOAx342oSt5aULyhsbdJ',
            'mode'      : 'oauth',
            'version'   : '5.59'
        });
        vk.setSecureRequests(true);
        vk.setToken(sid);

        vk.request('audio.getUploadServer');
        vk.on('done:audio.getUploadServer', function(_o) {
            if (!_o.response) {
                console.log('_o.response not found!', _o);
            }
            var uploadUrl = _o.response['upload_url'];

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
                    mainRes.status(500).send(err);
                } else {
                    vk.request('audio.save', {
                        server: body.server,
                        audio: body.audio,
                        hash: body.hash,
                        artist: 'soundcrumbs',
                        title: name
                    });
                    vk.on('http-error', function(_e) {
                        mainRes.status(500).send(_e);
                        unlinkFiles(name);
                    });
                    vk.on('parse-error', function(_e) {
                        mainRes.status(500).send(_e);
                        unlinkFiles(name);
                    });
                    vk.on('done:audio.save', function(_o) {
                        mainRes.write(JSON.stringify(_o));
                        mainRes.end();

                        unlinkFiles(name);
                    });

                }
            });
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