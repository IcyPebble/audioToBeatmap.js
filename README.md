# audioToBeatmap.js

## Usage
**async audioToBeatmap(audioURL, nPositions = 5, beatsPerSecond = 4, successiveThreshold = 400, longThreshold = 900, filter = true)**

<table>
<tr>
    <th colspan="2">Parameters</th>
</tr>
<tr>
    <td>audioURL</td>
    <td>HTML: web url or blob uri of a audio file {String}<br>WebWorker/NodeJS: mono audio signal array {Float32Array}</td>
</tr>
<tr>
    <td>nPositions</td>
    <td>number of positions where notes can appear {Integer}</td>
</tr>
<tr>
    <td>beatsPerSecond</td>
    <td>number of sounds per second of the audio that are analyzed {Number}</td>
</tr>
<tr>
    <td>successiveThreshold</td>
    <td>minimum time interval between notes in milliseconds {Integer}</td>
</tr>
<tr>
    <td>longThreshold</td>
    <td>minimum duration in milliseconds for a note to be considered long {Number}</td>
</tr>
<tr>
    <td>filter</td>
    <td>whether an equal-loudness filter should be applied or not {Boolean}</td>
</tr>
<tr></tr>
<tr>
    <th colspan="2">Returns</th>
</tr>
<tr></tr>
<tr>
    <td>beatmap</td>
    <td>

object containing note information in the following format:<br>
```javascript
{
    "{time in ms}": {
        "pos": int,
        "type": "normal" | "long_start" | "long_end"
    }
}
```
e.g.:
```javascript
{
    "745": {
        "pos": 0,
        "type": "normal"
    }
}
```

</tr>
</table>

### HTML
```html
<script src="audioToBeatmap.js" type="module"></script>
```
```javascript
audioToBeatmap(audioURL, nPositions, beatsPerSecond, successiveThreshold, longThreshold, filter)
    .then((beatmap) => {
        // process beatmap
    });
```

### WebWorker
```javascript
let worker = new Worker('audioToBeatmap_WebWorker.js', { type: "module" });

// send arguments
worker.postMessage([
    monoAudioArray, nPositions, beatsPerSecond, successiveThreshold, longThreshold, filter
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

audioToBeatmap.audioToBeatmap(monoAudioArray, nPositions, beatsPerSecond, successiveThreshold, longThreshold, filter)
    .then((beatmap) => {
        // process beatmap
    });
```

## Demo
Try a working example at: <https://audiotobeatmap.onrender.com/>