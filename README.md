# audioToBeatmap.js
Description

**Table of Contents**
+ [Usage](#usage)
    + [HTML application example](#html-application-example)
    + [WebWorker application example](#webworker-application-example)
    + [NodeJS application example](#nodejs-application-example)
    + [Compatibility table](#compatibility-table)
+ [Demo](#demo)

## Usage
**async audioToBeatmap(audioURL, nPositions = 5, beatsPerSecond = 4, successiveThreshold = 400, longThreshold = 900, filter = true)**

<table>
<tr>
    <th colspan="2">Parameters</th>
</tr>
<tr>
    <td>audioURL</td>
    <td>
    HTML: web url or blob uri of a audio file {String}<br>
    WebWorker/NodeJS: mono audio signal array {Float32Array}<br>
    (<a href="https://github.com/IcyPebble/audioToBeatmap.js/tree/main/demo#convert-audio-file-to-mono-audio-array">How do I get a mono audio array?</a>)
    </td>
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

<br></tr>
<tr>
    <td>error<br>(only for the WebWorker version)</td>
    <td>string indicating that an error has occurred, as follows:<br><code>"ERROR: {message}"</code></td>
</tr>
</table>

### HTML application example
```html
<head>
    <script src="https://cdn.jsdelivr.net/npm/essentia.js@0.1.3/dist/essentia.js-core.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/essentia.js@0.1.3/dist/essentia-wasm.web.js"></script>
    <script src="audioToBeatmap.js"></script>
</head>
```
```javascript
audioToBeatmap(audioURL, nPositions, beatsPerSecond, successiveThreshold, longThreshold, filter)
    .then((beatmap) => {
        // process beatmap
    });
```

### WebWorker application example
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

### NodeJs application example
```javascript
const audioToBeatmap = require('./audioToBeatmap_NodeJS');

audioToBeatmap.audioToBeatmap(monoAudioArray, nPositions, beatsPerSecond, successiveThreshold, longThreshold, filter)
    .then((beatmap) => {
        // process beatmap
    });
```

**Dependencies:**
+ essentia.js: ^0.1.3

### Compatibility table
&nbsp; | ![Chrome](https://raw.githubusercontent.com/alrra/browser-logos/main/src/chrome/chrome_48x48.png) | ![Firefox](https://raw.githubusercontent.com/alrra/browser-logos/main/src/firefox/firefox_48x48.png) | ![Edge](https://raw.githubusercontent.com/alrra/browser-logos/main/src/edge/edge_48x48.png) | ![Opera](https://raw.githubusercontent.com/alrra/browser-logos/main/src/opera/opera_48x48.png) | ![Safari](https://raw.githubusercontent.com/alrra/browser-logos/main/src/safari/safari_48x48.png) | ![NodeJS](https://raw.githubusercontent.com/alrra/browser-logos/main/src/node.js/node.js_48x48.png)
--- | --- | --- | --- | --- | --- | --- 
HTML | 74+ ✔️ | 61+ ✔️ | 79+ ✔️ | 62+ ✔️ | ❌ | ❌ 
WebWorker | 80+ ✔️ | 114+ ✔️ | 80+ ✔️ | 67+ ✔️ | 15+ ✔️ | ❌ 
NodeJS | ❌ | ❌ | ❌ | ❌ | ❌ | ✔️ 

## Demo
Try a working example at: <https://audiotobeatmap.onrender.com/>