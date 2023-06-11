import Essentia from 'https://cdn.jsdelivr.net/npm/essentia.js@0.1.3/dist/essentia.js-core.es.js';
import { EssentiaWASM } from 'https://cdn.jsdelivr.net/npm/essentia.js@0.1.3/dist/essentia-wasm.es.js';

const essentia = new Essentia(EssentiaWASM);

async function melodyExtraction(audioURL, filter) {
    //load audio
    let audioCtx = new AudioContext({ sampleRate: 44100 });
    const audioBuffer = await essentia.getAudioBufferFromURL(
        audioURL, audioCtx
    );

    // down mix to mono
    let audio = essentia.arrayToVector(
        essentia.audioBufferToMonoSignal(audioBuffer)
    );

    // apply eq loudness filter
    if (filter) {
        audio = essentia.EqualLoudness(audio).signal;
    }

    // compute f0 with MELODIA
    let pitch = essentia.PredominantPitchMelodia(audio).pitch;
    pitch = essentia.vectorToArray(pitch);

    return pitch
}

function range(start, stop, step) {
    if (typeof stop == 'undefined') {
        // one param defined
        stop = start;
        start = 0;
    }

    if (typeof step == 'undefined') {
        step = 1;
    }

    if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
        return [];
    }

    var result = [];
    for (var i = start; step > 0 ? i < stop : i > stop; i += step) {
        result.push(i);
    }

    return result;
}

function smoothFreqWithMidi(frequencies) {
    let result = [];
    frequencies.forEach((f) => {
        if (f > 0) {
            let midiNote = Math.round((12 * Math.log2(f / 440) + 69));
            result.push(440 * 2 ** ((midiNote - 69) / 12));
        } else {
            result.push(0.0);
        }
    });

    return result;
}

function groupBy(arr, key) {
    let result = [[]];
    let emptyGroupPushed = true;
    arr.forEach((e) => {
        if (key(e)) {
            result[result.length - 1].push(e)
            emptyGroupPushed = false;
        } else if (!emptyGroupPushed) {
            result.push([]);
            emptyGroupPushed = true;
        }
    });

    return result;
}

function sliceSound(frequencies, step) {
    // separate silence
    let sounds = groupBy(frequencies, (e) => { return (e != 0) });
    let silence = groupBy(frequencies, (e) => { return (e == 0) });

    let result = (frequencies[0] != 0) ? [] : silence[0];
    if (result.length > 0) {
        silence.splice(0, 1);
    }
    sounds.forEach((group, idx) => {
        let sliced_group = [];
        for (let i = 0; i < group.length; i += step) {
            let e = group[i];
            sliced_group.push(...(new Array(step).fill(e)));
        }

        // trim
        if (sliced_group.length > group.length) {
            sliced_group = sliced_group.slice(0, group.length);
        }

        // fill with previous slice if end slice is not long enough
        if (((sliced_group.length % step) > 0) && sliced_group.length > step) {
            let i = -(sliced_group.length % step);
            sliced_group.splice(
                i, -i,
                ...(new Array(-i).fill(
                    sliced_group[(i - 1) + sliced_group.length]
                ))
            );
        }

        // concatenate silence with sound
        sliced_group.forEach((e) => { result.push(e) });
        if (idx < silence.length) {
            silence[idx].forEach((e) => { result.push(e) });
        }
    });

    return result;
}

function freqToRhythm(frequencies, noteDuration, nPos, longThreshold) {
    let rhythm = {};
    let prevFreq = 0;
    let prevPos = Math.floor(Math.random() * nPos);
    let prevTime = 0;
    let longStart = undefined;
    let isLong = false;
    let direction = 1;
    for (let i = 0; i < frequencies.length; i++) {
        let freq = frequencies[i];
        if (freq > 0) {
            let time = i * noteDuration;
            // after silence
            if (prevFreq == 0) {
                // set random position
                let position = Math.floor(Math.random() * nPos);
                while (position == prevPos) {
                    position = Math.floor(Math.random() * nPos);
                }
                // write note
                rhythm[time] = { 'pos': position, 'type': 'normal' };

                prevFreq = freq;
                prevPos = position;
                prevTime = time;

                // same note
            } else if (prevFreq == freq) {
                if (longStart === undefined) {
                    longStart = prevTime;
                }
                if (time - longStart > longThreshold && !isLong) {
                    isLong = true;

                    // change note
                    rhythm[longStart]['type'] = 'long_start';
                }
                prevFreq = freq;
                prevTime = time;

                // different note
            } else {
                // end and reset (long) note
                if (isLong) {
                    rhythm[prevTime] = { 'pos': prevPos, 'type': 'long_end' };
                    isLong = false;
                }
                if (longStart !== undefined) {
                    longStart = undefined;
                }

                // compute step
                let maxStep = Math.max(prevPos, nPos - prevPos - 1);
                let thresholds = range(maxStep - 1, -1, -1).map(
                    (x) => (Math.max(...frequencies) / maxStep) * x
                );
                let step;
                for (let i = 0; i < thresholds.length; i++) {
                    if (Math.abs(prevFreq - freq) > thresholds[i]) {
                        step = maxStep - i;
                        break;
                    }
                }

                let position;
                if (freq > prevFreq) {
                    // change direction if necessary
                    if (prevPos + (-step * direction) < 0 || (
                        prevPos + (-step * direction) >= nPos)) {
                        direction = -direction;
                    }
                    position = prevPos + (-step * direction);
                } else {
                    // change direction if necessary
                    if (prevPos + (step * direction) < 0 || (
                        prevPos + (step * direction) >= nPos)) {
                        direction = -direction
                    }
                    position = prevPos + (step * direction);
                }
                // write note
                rhythm[time] = { 'pos': position, 'type': 'normal' };

                prevFreq = freq;
                prevPos = position;
                prevTime = time;
            }
        } else {
            // end and reset long note
            if (isLong) {
                rhythm[prevTime] = { 'pos': prevPos, 'type': 'long_end' };
            }
            if (longStart !== undefined) {
                longStart = undefined;
                isLong = false;
            }
            prevFreq = freq;
            direction = 1;
        }
    }

    return rhythm;
}

function removeFastSuccessiveNotes(beatmap, threshold) {
    let prevTime = parseInt(Object.keys(beatmap)[0]);
    let keepTimes = [prevTime,];
    Object.keys(beatmap).slice(1).forEach((time) => {
        time = parseInt(time);
        if (time - prevTime > threshold) {
            keepTimes.push(time);
            prevTime = time;
        }
    });

    let result = {};
    keepTimes.forEach((t) => {
        result[t] = beatmap[t];
    });

    return result;
}

window.audioToBeatmap = async function (
    audioURL, beatsPerSecond = 4, successiveThreshold = 400, longThreshold = 900, filter = true) {
    let pitch = await melodyExtraction(audioURL, filter);
    pitch = smoothFreqWithMidi(pitch);

    let step = Math.trunc((1 / (128 / 44100)) / beatsPerSecond);
    pitch = sliceSound(pitch, step);

    let rhythm = freqToRhythm(pitch, 128 / 44100 * 1000, 5, longThreshold);
    let intRhythm = {}
    Object.keys(rhythm).forEach((k) => {
        intRhythm[Math.round(k)] = rhythm[k]
    });

    let beatmap = removeFastSuccessiveNotes(intRhythm, successiveThreshold);

    return beatmap;
}

// only use 'shutdown' if audioToBeatmap or melodyExtraction are not reused later in the program
window.shutdown = function () {
    essentia.shutdown();
    essentia.delete();
}