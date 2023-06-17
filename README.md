# audioToBeatmap.js

## Usage
**async audioToBeatmap(\n**
    **audioURL, beatsPerSecond = 4, successiveThreshold = 400, longThreshold = 900, filter = true\n**
**)**

### HTML
```html
<script src="audioToBeatmap.js" type="module"></script>
```
```javascript
audioToBeatmap(audioURL, beatsPerSecond, successiveThreshold, longThreshold, filter)
    .then((beatmap) => {
        // process beatmap
    });
```

### WebWorker
```javascript
let worker = new Worker('audioToBeatmap_WebWorker.js', { type: "module" });

// send arguments
worker.postMessage([
    monoAudioArray, beatsPerSecond, successiveThreshold, longThreshold, filter
]);

// get result
worker.onmessage = (msg) => {
    if (typeof msg.data == 'object' && msg.data !== null) {
        let beatmap = msg.data;
        // process beatmap
    
    } else {
        alert(msg.data); // "ERROR: {error message}"
    }
};
```

### NodeJs
```javascript
const audioToBeatmap = require('./audioToBeatmap_NodeJS');

audioToBeatmap.audioToBeatmap(monoAudioArray, beatsPerSecond, successiveThreshold, longThreshold, filter)
    .then((beatmap) => {
        // process beatmap
    });
```

## demo
Try a working example at: <https://audiotobeatmap.onrender.com/>