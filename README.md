# audioToBeatmap.js

## Usage
**async audioToBeatmap(<br>**
&emsp;&emsp;**audioURL, beatsPerSecond = 4, successiveThreshold = 400, longThreshold = 900, filter = true<br>**
**)**

<table>
<tr>
    <th colspan="2">Parameters</th>
</tr>
<tr>
    <td><b>audioURL</b></td>
    <td>HTML: web url or blob uri of a audio file<br>WebWorker/NodeJS: mono audio signal array {Float32Array}</td>
</tr>
<tr>
    <td><b>beatsPerSecond</b></td>
    <td>number of sounds per second of the audio that are analyzed</td>
</tr>
<tr>
    <td><b>successiveThreshold</b></td>
    <td>minimum time interval between notes in milliseconds</td>
</tr>
<tr>
    <td><b>longThreshold</b></td>
    <td>minimum duration in milliseconds for a note to be considered long</td>
</tr>
<tr>
    <td><b>filter</b></td>
    <td>whether an equal-loudness filter should be applied or not</td>
</tr>
<tr>
    <th colspan="2">Returns</th>
</tr>
<tr></tr>
<tr>
    <td><b>beatmap</b></td>
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