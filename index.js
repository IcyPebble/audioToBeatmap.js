const path = require('path');
const readline = require('readline');
const ytdl = require('ytdl-core');
const audioToBeatmap = require('./audioToBeatmapNodeJS');
const express = require('express');
const app = express();

app.use(express.static(__dirname));
app.use(express.json({ limit: '1gb' }));

// index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/getYoutubeAudio', (req, res) => {
    let url = req.query.URL;
    if (ytdl.validateURL(url)) {
        ytdl(
            url, { quality: 'highestaudio', filter: 'audioandvideo' }
        ).pipe(res);
    } else {
        res.status(400).json({ error: "Bad request" });
    }
});

app.get('/getYoutubeTitle', (req, res) => {
    let url = req.query.URL;
    if (ytdl.validateURL(url)) {
        ytdl.getBasicInfo(url).then((info) => {
            res.json({ title: info.videoDetails.title });
        });
    } else {
        res.status(400).json({ error: "Bad request" });
    }
});

app.post('/audioToBeatmap', (req, res) => {
    let args = req.body;
    args.audioArray = new Float32Array(Object.values(args.audioArray));
    args.longThreshold = (
        (args.longThreshold === null) ? Infinity : args.longThreshold
    );

    audioToBeatmap.audioToBeatmap(args.audioArray, args.beatsPerSecond, args.successiveThreshold, args.longThreshold, args.filter)
        .then((beatmap) => { res.json(beatmap); })
        .catch(() => { res.status(400).json({ error: "Bad request" }); });
});

// open app
app.listen(8080, () => {
    import('open').then((open) => {
        open.default('http://localhost:8080');
        console.log('Running at http://localhost:8080\nPress CTRL + Q to quit');
    });
});

// close on CTRL + Q
readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
}

process.stdin.on('keypress', (str, key) => {
    if (key.ctrl && key.name === 'q') {
        process.exit();
    }
});