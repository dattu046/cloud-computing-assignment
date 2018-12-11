var express = require('express');
var formidable = require('formidable');
var randomstring = require("randomstring");
const { Storage } = require('@google-cloud/storage');
const path = require('path');

var app = express();
var instanceId = randomstring.generate();
var fs = require('fs');

require('dotenv').config()

const store = new Storage({
    projectId: process.env.PROJECT_ID,
});
const bucket = store.bucket(process.env.BUCKET_NAME);

process.on('unhandledRejection', error => {
    console.log('unhandledRejection', error);
});

app.get('/id', function (req, res) {
    res.send(instanceId);
})

app.get("/", (req, res) => {
    res.sendFile(path.join(`${__dirname}/index.html`));
});

app.post('/upload', function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var oldpath = files.filetoupload.path;
        var newpath = './' + files.filetoupload.name;
        fs.rename(oldpath, newpath, function (err) {
            if (err) throw err;
            uploadFile(newpath);
            res.write("OK");
            res.end();
            // res.redirect('/');
        }, function (err, data) {
            if (err)
                console.log(err);
            else
                console.log(data);
        });
    });
})

app.get('/list', async function (req, res) {
    const [files] = await storage.bucket(process.env.BUCKET_NAME).getFiles();
    res.write('Files:\n');
    var slno = 1;
    files.forEach(file => {
        res.write((slno++) + '\t' +file.name + '\n' );
    });
    res.send();
})

app.get('/download/:file', async function (req, res) {
    const options = {
        destination: req.params.file,
    };
    await storage
        .bucket(process.env.BUCKET_NAME)
        .file(req.params.file)
        .download(options);
    var file = fs.readFileSync(req.params.file, 'binary');

    res.setHeader('Content-Length', file.length);
    res.write(file, 'binary');
    fs.unlinkSync(req.params.file);
    res.end();

})

app.get('/bucketInfo', function (req, res) {
    try {
        createBucket();
        res.send("success");
    } catch (err) {
        res.send(err);
    }
})

var server = app.listen(8081, function () {
    var port = server.address().port
    console.log("Server running at %s", port)
})

const storage = new Storage({
    projectId: process.env.PROJECT_ID,
});

async function createBucket() {
    await storage.createBucket(process.env.BUCKET_NAME);
    console.log(`Bucket ${bucketName} created.`);
}

async function uploadFile(fileLoc) {
    await storage.bucket(process.env.BUCKET_NAME).upload(fileLoc, {
        gzip: true,
        metadata: {
            cacheControl: 'public, max-age=31536000'
        },
        function(err, name) {
            if (err)
                console.log(err);
            else
                console.log(name);
        }
    }, (err, file) => {
        if (err)
            console.log(err);
        else
            fs.unlinkSync(fileLoc);
    });
}
