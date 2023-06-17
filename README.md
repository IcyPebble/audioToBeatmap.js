# audioToBeatmap.js

## HTML
```html
<script src="audioToBeatmap.js" type="module"></script>
```
```javascript
audioToBeatmap(
    AUDIO_URL, BEATS_PER_SECOND, SUCCESSIVE_THRESHOLD, LONG_THRESHOLD, FILTER
).then((beatmap) => {
    // process beatmap
});
```

## WebWorker
```javascript
let worker = new Worker('audioToBeatmap_WebWorker.js', { type: "module" });

// send arguments
worker.postMessage([
    MONO_AUDIO_ARRAY, BEATS_PER_SECOND,
    SUCCESSIVE_THRESHOLD, LONG_THRESHOLD, FILTER
]);

// get result
worker.onmessage = (msg) => {
    if (typeof msg.data == 'object' && msg.data !== null) {
        let beatmap = msg.data;
        // process beatmap
    
    } else {
        alert(msg.data); // "ERROR: {error message}"
    }
}
```

## NodeJs
```javascript
const audioToBeatmap = require('./audioToBeatmapNodeJS');

audioToBeatmap.audioToBeatmap(
    AUDIO_URL, BEATS_PER_SECOND, SUCCESSIVE_THRESHOLD, LONG_THRESHOLD, FILTER
).then((beatmap) => {
    // process beatmap
});
```

## demo
Try a working example at: <https://audiotobeatmap.onrender.com/>