# Demo

## Useful code snippets
### Convert audio file to mono audio array
```javascript
function audioBuffertoMono(buffer) {
    if (buffer.numberOfChannels == 1) {
        return buffer.getChannelData(0);

    } else if (buffer.numberOfChannels == 2) {
        let channel_1 = buffer.getChannelData(0);
        let channel_2 = buffer.getChannelData(1);
        let mono = new Float32Array(channel_1.length);

        let length = mono.length;
        for (let i = 0; i < length; i++) {
            mono[i] = (channel_1[i] + channel_2[i]) * 0.5;
        }

        return mono;

    } else {
        throw new Error('audioBuffer has more than 2 channels');
    }
}

// ... //

let worker = new Worker('audioToBeatmap_WebWorker.js', { type: "module" });
let audioCtx = new AudioContext({ sampleRate: 44100 });
songInput.files[0].arrayBuffer()
        .then((arrayBuffer) => audioCtx.decodeAudioData(arrayBuffer))
        .then((audioBuffer) => {
            worker.postMessage(
                [
                    audioBuffertoMono(audioBuffer),
                    // ...
                ]
            );
        });
```

### Get audio file from URL
```javascript
function handleURLInput(value) {
    loadOverlay.style['display'] = 'flex';
    fetch(value).then((res) => {
        if (res.ok) {
            return res.blob();
        } else {
            throw Error('File not found')
        }
    }).then((blob) => {
        // if the audio exists
        if (blob) {
            // get file name
            let reversedURL = Array.from(value).reverse();
            let fileNameStart = reversedURL.indexOf('/');
            let fileName = reversedURL.slice(0, fileNameStart);
            fileName = fileName.reverse().join('');

            // set file as input
            let file = new File([blob], fileName);
            let dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            songInput.files = dataTransfer.files;
            let evt = new Event('change');
            songInput.dispatchEvent(evt);

            loadOverlay.style['display'] = 'none';
        }
    }).catch(() => {
        // on error
        loadOverlay.style['display'] = 'none';
        inform('File not found', 'white', '#cc0000');
    });
}
```