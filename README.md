# audioToBeatmap.js

## HTML

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
    
    } else {
        alert(msg.data); // "ERROR: {error message}"
    }
}
```

## NodeJs

## demo
Try a working example at: <https://audiotobeatmap.onrender.com/>