let orientationLock = document.getElementById('orientationLock');
let startScreen = document.getElementById('startScreen');
let startBtn = document.getElementById('startBtn');
let songInput = document.getElementById('songInput');
let songInputBtn = document.getElementById('songInputBtn');
let songURLInput = document.getElementById('songURLInput');
let loadOverlay = document.getElementById('loadOverlay');
let configBtn = document.getElementById('configBtn');
let configOverlay = document.getElementById('configOverlay');
let configInput = document.getElementById('configInput');
let configSubmit = document.getElementById('configSubmit');
let configReset = document.getElementById('configReset');
let configCancel = document.getElementById('configCancel');
let muteBtn = document.getElementById('muteBtn');

let SCREEN_WIDTH = screen.width;
function handleOrientationLock(onrightorientation, onwrongorientation) {
    if (SCREEN_WIDTH <= 768) {
        if (screen.orientation.type != 'portrait-primary') {
            orientationLock.style['display'] = 'flex';
            onwrongorientation();
        } else {
            orientationLock.style['display'] = 'none';
            onrightorientation();
        }
    } else {
        if (screen.orientation.type != 'landscape-primary') {
            orientationLock.style['display'] = 'flex';
            onwrongorientation();
        } else {
            orientationLock.style['display'] = 'none';
            onrightorientation();
        }
    }
}

handleOrientationLock(() => { }, () => { });

function inform(message, color, background) {
    let infoBox = document.createElement('div');
    infoBox.className = 'info';
    infoBox.innerHTML = message;
    if (color) { infoBox.style['color'] = color; }
    if (background) { infoBox.style['background'] = background; }

    infoBox.addEventListener('click', (e) => {
        document.body.removeChild(e.target);
    });

    infoBox.addEventListener('animationend', (e) => {
        document.body.removeChild(e.target);
    });

    document.body.appendChild(infoBox);
    infoBox.style['left'] = `${screen.width / 2 - infoBox.offsetWidth / 2}px`;
}

let NOTE_FALL_DURATION = 2000;
function start(beatmap, audio) {
    document.removeEventListener('visibilitychange', handleLetterAnimation);
    pauseLetterAnimation();

    document.title = songInput.files[0].name;
    document.body.removeChild(document.body.children[1]);

    // gameScreen //
    let gameScreen = document.getElementById('gameScreen');
    gameScreen.style['display'] = 'flex';
    let gameScreenHead = document.getElementById('gameScreenHead');
    let pointCounter = document.getElementById('pointCounter');
    let pauseOverlay = document.getElementById('pauseOverlay');
    let pauseContinueBtn = document.getElementById('pauseContinueBtn');
    let pauseRestartBtn = document.getElementById('pauseRestartBtn');

    let noteColumns = {};
    let noteCollectors = {};
    for (let i = 1; i <= 5; i++) {
        noteColumns[i] = document.getElementById(`noteColumn${i}`);
        noteCollectors[i] = document.getElementById(`noteCollector${i}`);

        noteCollectors[i].addEventListener('animationend', () => {
            noteCollectors[i].style['animation'] = 'none';
        });
        noteCollectors[i].addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        noteColumns[i].addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        noteColumns[i].addEventListener('pointerdown', () => {
            let key = Object.keys(keyIndex)[i - 1];
            if (currentKey != key) {
                if (currentKey != '') {
                    noteCollectors[keyIndex[currentKey]].classList.remove(
                        'noteCollectorActive'
                    );
                }
                noteCollectors[i].classList.add(
                    'noteCollectorActive'
                );
                currentKey = key;
            }
        });
        noteColumns[i].addEventListener('pointerup', () => {
            if (currentKey == Object.keys(keyIndex)[i - 1]) {
                noteCollectors[i].classList.remove(
                    'noteCollectorActive'
                );
                currentKey = '';
            }
        });
    }

    let keyIndex = { 'KeyW': 1, 'KeyE': 2, 'Space': 3, 'KeyO': 4, 'KeyP': 5 };
    let currentKey = '';
    document.addEventListener('keyup', (key) => {
        if (Object.keys(keyIndex).includes(key.code) && currentKey == key.code) {
            noteCollectors[keyIndex[currentKey]].classList.remove(
                'noteCollectorActive'
            );
            currentKey = '';
        }
    });

    document.addEventListener('keydown', (key) => {
        // move collector to pressed key
        if (Object.keys(keyIndex).includes(key.code) && currentKey != key.code) {
            if (currentKey != '') {
                noteCollectors[keyIndex[currentKey]].classList.remove(
                    'noteCollectorActive'
                );
            }
            noteCollectors[keyIndex[key.code]].classList.add(
                'noteCollectorActive'
            );
            currentKey = key.code;
        }

        // pause if esc was pressed
        if (key.code == 'Escape' && !paused) {
            audio.pause();
            paused = true;
            if (!audio.ended) {
                Array.from(document.getElementsByClassName('note')).forEach((el) => {
                    el.style['animationPlayState'] = 'paused';
                });
                pauseOverlay.style['display'] = 'flex';
            }
        }
    });

    // also pause if gameScreenHead was clicked
    gameScreenHead.addEventListener('click', () => {
        if (!paused) {
            audio.pause();
            paused = true;
            if (!audio.ended) {
                Array.from(document.getElementsByClassName('note')).forEach((el) => {
                    el.style['animationPlayState'] = 'paused';
                });
                pauseOverlay.style['display'] = 'flex';
            }
        }
    });

    // also pause on orientation change
    screen.orientation.onchange = () => {
        handleOrientationLock(() => { }, () => {
            if (!paused) {
                audio.pause();
                paused = true;
                if (!audio.ended) {
                    Array.from(document.getElementsByClassName('note')).forEach((el) => {
                        el.style['animationPlayState'] = 'paused';
                    });
                    pauseOverlay.style['display'] = 'flex';
                }
            }
        });
    };

    // resume
    let paused = false;
    let gameloopStarted = false;
    let gameloopBeforeStartContinueTime = undefined;

    pauseContinueBtn.addEventListener('click', () => {
        pauseOverlay.style['display'] = 'none';
        paused = false;
        Array.from(document.getElementsByClassName('note')).forEach((el) => {
            el.style['animationPlayState'] = 'running';
        });
        if (gameloopStarted) {
            audio.play();
            gameloop();
        } else {
            gameloopBeforeStart(gameloopBeforeStartContinueTime);
        }

    });

    pauseRestartBtn.addEventListener('click', () => {
        pauseOverlay.style['display'] = 'none';
        pauseContinueBtn.disabled = false;
        restart();
    });

    // if the user leaves the tab
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden' && !paused) {
            paused = true;
            audio.pause();
            if (!audio.ended) {
                pauseContinueBtn.disabled = true;
                pauseOverlay.style['display'] = 'flex';
            }
        }
    });

    function judge(noteAtColumnIdx) {
        // if note was collected
        if (keyIndex[currentKey] == noteAtColumnIdx) {
            // visualize
            noteCollectors[noteAtColumnIdx].style['animation'] = 'visualizeHit ease-out 0.2s';

            // add one point
            pointCounter.innerHTML = 1 + (+pointCounter.innerHTML);
        } else {
            // visualize
            noteCollectors[noteAtColumnIdx].style['animation'] = 'visualizeMiss ease-out 0.2s';
        }
    }

    function dropNote(columnIdx) {
        let note = document.createElement('img');
        note.className = 'note';
        note.setAttribute('data-column', columnIdx);
        note.style['animation-duration'] = `${NOTE_FALL_DURATION}ms`;

        // generate random symbol
        let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!§$%&()?[]{}@<>#0123456789';
        note.src = `note_icons/${chars[Math.floor(Math.random() * chars.length)].charCodeAt()}.png`;

        // remove note after it lands
        note.addEventListener('animationend', (e) => {
            e.target.parentNode.removeChild(e.target);
            judge(e.target.dataset.column);
        });

        // place note in column
        noteColumns[columnIdx].insertBefore(
            note, noteColumns[columnIdx].children[0]
        );
    }

    let noteDropData = {};
    let noteDropDataBeforeStart = {};
    Object.keys(beatmap).forEach((k) => {
        if (k - NOTE_FALL_DURATION >= 0) {
            noteDropData[k - NOTE_FALL_DURATION] = beatmap[k];
        } else {
            noteDropDataBeforeStart[NOTE_FALL_DURATION + (k - NOTE_FALL_DURATION)] = beatmap[k];
        }
    });
    let noteDropDataClone = structuredClone(noteDropData);
    let noteDropDataBeforeStartClone = structuredClone(noteDropDataBeforeStart);

    function gameloop() {
        if (!audio.ended && !paused) {
            let time = audio.currentTime * 1000;
            // drop note at right time
            if (time >= Object.keys(noteDropData)[0]) {
                dropNote(noteDropData[Object.keys(noteDropData)[0]].pos + 1);
                delete noteDropData[Object.keys(noteDropData)[0]];
            }
            setTimeout(gameloop, 1);
        }
    }

    function gameloopBeforeStart(startTime) {
        if (startTime == undefined) {
            startTime = Date.now();
        }
        if (!paused) {
            let time = Date.now() - startTime;
            // drop note at right time
            if (time >= Object.keys(noteDropDataBeforeStart)[0]) {
                dropNote(
                    noteDropDataBeforeStart[Object.keys(
                        noteDropDataBeforeStart
                    )[0]].pos + 1
                );
                delete noteDropDataBeforeStart[Object.keys(
                    noteDropDataBeforeStart
                )[0]];
            }
            if (time >= NOTE_FALL_DURATION) {
                // start main gameloop
                audio.play();
                gameloopStarted = true;
                gameloop()
            } else {
                setTimeout(() => { gameloopBeforeStart(startTime) }, 1);
            }
        } else {
            gameloopBeforeStartContinueTime = startTime;
        }
    }

    gameloopBeforeStart();

    function restart() {
        // reset collector position
        if (currentKey != '') {
            noteCollectors[keyIndex[currentKey]].classList.remove(
                'noteCollectorActive'
            );
            currentKey = '';
        }

        // reset variables
        paused = false;
        gameloopStarted = false;
        gameloopBeforeStartContinueTime = undefined;
        noteDropData = structuredClone(noteDropDataClone);
        noteDropDataBeforeStart = structuredClone(noteDropDataBeforeStartClone);

        // delete every note
        Array.from(document.getElementsByClassName('note')).forEach((el) => {
            el.parentNode.removeChild(el);
        });

        // reset pointCounter
        pointCounter.innerHTML = 0;

        // reset audio
        audio.pause();
        audio.currentTime = 0;

        // start again
        gameloopBeforeStart();
    }

    // resultScreen //
    let resultScreen = document.getElementById('resultScreen');
    let grade = document.getElementById('grade');
    let score = document.getElementById('score');
    let restartBtn = document.getElementById('restartBtn');
    let reloadBtn = document.getElementById('reloadBtn');

    restartBtn.addEventListener('click', () => {
        resultScreen.style['display'] = 'none';
        restart();
    });

    reloadBtn.addEventListener('click', () => {
        window.location.reload();
    })

    audio.addEventListener('ended', () => {
        resultScreen.style['display'] = 'flex';
        document.title = 'audioToBeatmap.js';

        // calculate percentage
        let totalNoteCount = Object.keys(
            noteDropDataClone
        ).length + Object.keys(noteDropDataBeforeStartClone).length;
        let percentage = ((+pointCounter.innerHTML) / totalNoteCount) * 100;
        // round to 2 decimals
        percentage = Math.round(percentage * 100) / 100;

        // calculate grade
        let gradeLetters = [
            '&xi;', 'S',
            'A+', 'A', 'A-',
            'B+', 'B', 'B-',
            'C+', 'C', 'C-',
            'D+', 'D', 'D-',
            'F'
        ];
        let gradeColors = [
            'goldenrod', '#000080',
            '#028a0f', '#028a0f', '#028a0f',
            '#bacc00', '#bacc00', '#bacc00',
            '#fdee00', '#fdee00', '#fdee00',
            '#ed7117', '#ed7117', '#ed7117',
            '#c21807'
        ];
        let gradeLetterIdx = [
            percentage == 100, // xi
            percentage >= 94, // S
            percentage >= 90, // A+
            percentage >= 87, // A
            percentage >= 84, // A-
            percentage >= 80, // B+
            percentage >= 77, // B
            percentage >= 74, // B-
            percentage >= 70, // C+
            percentage >= 67, // C
            percentage >= 64, // C-
            percentage >= 60, // D+
            percentage >= 57, // D
            percentage >= 54, // D-
            true // F
        ].findIndex((x) => x);
        let gradeLetter = gradeLetters[gradeLetterIdx];
        let gradeColor = gradeColors[gradeLetterIdx];

        grade.innerHTML = gradeLetter;
        grade.style['color'] = gradeColor;
        score.innerHTML = `${pointCounter.innerHTML}|${totalNoteCount}: ${percentage}%`;
    });
}

// startScreen //

function generateLetter() {
    let letter = document.createElement('img');

    letter.className = 'letter';
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!§$%&()?[]{}@<>#0123456789';
    letter.src = `note_icons/${chars[Math.floor(Math.random() * chars.length)].charCodeAt()}.png`;

    let deg = Math.floor(Math.random() * 360);
    let rotation = ((deg < 90 || (deg >= 180 && deg < 270)) ? -1 : 1);
    letter.style.setProperty('--deg', `${deg}deg`);
    letter.style.setProperty('--rotation', `${rotation}`);


    letter.addEventListener('animationend', (e) => {
        e.target.parentNode.removeChild(e.target);
    });

    return letter;
}

let letterAnimationPaused;
let letterAnimationAudio = new Audio('background_music.mp3');
letterAnimationAudio.loop = true;
letterAnimationAudio.muted = true;
let prevTime;
function letterAnimation(time) {
    if (time - prevTime >= 706 || !prevTime) {
        startScreen.appendChild(generateLetter());
        prevTime = time;
    }
    if (!letterAnimationPaused) {
        requestAnimationFrame(letterAnimation);
    }
}

function startLetterAnimation() {
    letterAnimationAudio.play();
    letterAnimationPaused = false;
    requestAnimationFrame(letterAnimation);
}

function pauseLetterAnimation() {
    letterAnimationAudio.pause();
    letterAnimationPaused = true;
    prevTime = undefined;
}

function handleLetterAnimation() {
    if (document.visibilityState === 'hidden') {
        pauseLetterAnimation();
    } else {
        startLetterAnimation();
    }
}
document.addEventListener('visibilitychange', handleLetterAnimation);
screen.orientation.onchange = () => {
    handleOrientationLock(startLetterAnimation, pauseLetterAnimation);
};

muteBtn.addEventListener('click', () => {
    letterAnimationAudio.muted = !letterAnimationAudio.muted;
    muteBtn.src = (
        (letterAnimationAudio.muted) ? 'volume_off.png' : 'volume_up.png'
    );
})

startLetterAnimation();

let BEATS_PER_SECOND = 6;
let SUCCESSIVE_THRESHOLD = 400;
let FILTER = true;
let VIDEO = true;
let VIDEO_OPACITY = 0.2;
function config(noteFallDuration, beatsPerSecond, successiveThreshold, filter, video, videoOpacity) {
    NOTE_FALL_DURATION = 2000 * noteFallDuration;
    BEATS_PER_SECOND = beatsPerSecond;
    SUCCESSIVE_THRESHOLD = NOTE_FALL_DURATION * (successiveThreshold / 100);
    FILTER = filter;
    VIDEO = video;
    VIDEO_OPACITY = videoOpacity;
}

configBtn.addEventListener('click', () => {
    configOverlay.style['display'] = 'flex';
});

function precision(a) {
    let e = 1;
    while (Math.round(a * e) / e !== a) { e *= 10; }
    return Math.log(e) / Math.LN10;
}

configSubmit.addEventListener('click', () => {
    let noteFallDuration = +(configInput.children[1].value);
    if (!(noteFallDuration >= 0.2) || precision(noteFallDuration) > 2) {
        inform('noteFallDuration must be a float with a maximum of two decimal places that is greater than or equal to 0.2', 'white', '#cc0000');
        return;
    }

    let beatsPerSecond = +(configInput.children[3].value);
    if (!(beatsPerSecond >= 1) || !Number.isInteger(beatsPerSecond)) {
        inform('beatsPerSecond must be an integer greater than or equal to 1', 'white', '#cc0000');
        return;
    }

    let successiveThreshold = +(configInput.children[5].value);
    if (!(successiveThreshold >= 10 && successiveThreshold <= 100) || !Number.isInteger(successiveThreshold)) {
        inform('successiveThreshold must be an integer between 10 and 100', 'white', '#cc0000');
        return;
    }

    let filter = configInput.children[7].checked;

    let video = configInput.children[9].checked;

    let videoOpacity = +(configInput.children[11].value);
    if (!(videoOpacity >= 0 && videoOpacity <= 100) || !Number.isInteger(videoOpacity)) {
        inform('videoOpacity must be an integer between 0 and 100', 'white', '#cc0000');
        return;
    }
    videoOpacity = videoOpacity / 100;

    config(noteFallDuration, beatsPerSecond, successiveThreshold, filter, video, videoOpacity);

    configOverlay.style['display'] = 'none';
});

function resetConfig() {
    configInput.children[1].value = 1;
    configInput.children[3].value = 6;
    configInput.children[5].value = 20;
    configInput.children[7].checked = true;
    configInput.children[9].checked = true;
    configInput.children[11].value = 20;
}

resetConfig();
configReset.addEventListener('click', resetConfig);

configCancel.addEventListener('click', () => {
    configOverlay.style['display'] = 'none';
})

songInput.addEventListener('change', () => {
    songInputBtn.innerHTML = songInput.files[0].name;
});

// set default file
fetch('test.mp3').then((res) => res.blob()).then((blob) => {
    let file = new File([blob], 'test.mp3');
    let dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    songInput.files = dataTransfer.files;
    let evt = new Event('change');
    songInput.dispatchEvent(evt);
});

function isAudioFileURL(url) {
    return /(\.wav|\.mp3|\.ogg|\.acc|\.aif|\.flac|\.iff|\.m4a|\.mpa|\.mpc|\.oga|\.opus|\.snd|\.wma|\.mp4)$/.test(url);
}

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

songInputBtn.addEventListener('click', (e) => {
    let x = e.clientX;
    let boundingBox = songInputBtn.getBoundingClientRect();
    let threshold = boundingBox.x + boundingBox.width / 2;

    // if clicked on right half
    if (x > threshold) {
        e.preventDefault();
        songInputBtn.style['background'] = 'linear-gradient(to right, #f3f3f3 50%, #b0b0b0 50%)';

        // open URLInput
        let URLInput = prompt('Enter an URL:');
        if (URLInput != null) {
            if (isAudioFileURL(URLInput)) {
                handleURLInput(URLInput);
            } else {
                inform('URL was not accepted.<br>Please use only URLs to audio files in the following formats:<br>.wav, .mp3, .ogg, .acc, .aif, .flac, .iff, .m4a, .mpa, .mpc, .oga, .opus, .snd, .wma, .mp4', 'white', '#cc0000');
            }
        }
    } else {
        songInputBtn.style['background'] = 'linear-gradient(to left, #f3f3f3 50%, #b0b0b0 50%)';
    }
});

songInputBtn.addEventListener('mousemove', (e) => {
    let x = e.clientX;
    let boundingBox = songInputBtn.getBoundingClientRect();
    let threshold = boundingBox.x + boundingBox.width / 2;

    songInputBtn.innerHTML = 'Select file | Enter URL';

    // if pointer on left half
    if (x <= threshold) {
        songInputBtn.style['background'] = 'linear-gradient(to left, #f3f3f3 50%, #dddddd 50%)';
    } else {
        songInputBtn.style['background'] = 'linear-gradient(to right, #f3f3f3 50%, #dddddd 50%)';
    }
});

songInputBtn.addEventListener('mouseleave', () => {
    songInputBtn.style['background'] = '#f3f3f3';
    if (songInput.files[0]) {
        songInputBtn.innerHTML = songInput.files[0].name;
    }
});

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

function generateBeatmap() {
    // remove configButton
    startScreen.removeChild(configBtn);

    // disable songInputButton
    let fileName = document.createElement('div');
    fileName.id = 'songInputFileName';
    fileName.innerHTML = songInput.files[0].name;
    startScreen.insertBefore(fileName, startScreen.children[1]);
    startScreen.removeChild(startScreen.children[2]);

    startBtn.innerHTML = 'Start';
    startBtn.disabled = true;

    // add loader
    let loader = document.createElement('div');
    loader.className = 'loader';
    startScreen.insertBefore(loader, startScreen.children[3]);

    let fileURL = URL.createObjectURL(songInput.files[0]);
    let audio;
    if (!VIDEO || /(\.wav|\.mp3|\.ogg|\.acc|\.aif|\.flac|\.iff|\.m4a|\.mpa|\.mpc|\.oga|\.opus|\.snd|\.wma)$/.test(songInput.files[0].name)) {
        audio = new Audio(fileURL);
    } else {
        audio = document.createElement('video');
        audio.style['opacity'] = `${VIDEO_OPACITY}`;

        let videoSource = document.createElement('source');
        videoSource.src = fileURL;
        audio.appendChild(videoSource);

        gameScreen.appendChild(audio);
    }

    // generate beatmap
    let worker = new Worker('audioToBeatmap_WebWorker.js', { type: "module" });
    let audioCtx = new AudioContext({ sampleRate: 44100 });
    songInput.files[0].arrayBuffer()
        .then((arrayBuffer) => audioCtx.decodeAudioData(arrayBuffer))
        .then((audioBuffer) => {
            worker.postMessage(
                [
                    audioBuffertoMono(audioBuffer), BEATS_PER_SECOND,
                    SUCCESSIVE_THRESHOLD, Infinity, FILTER
                ]
            );
        })
        .catch(() => {
            // on error
            alert('An error occured while processing the file.\nMake sure that the audio has no more than 2 channels.');
            window.location.reload();
        });

    worker.onmessage = (msg) => {
        if (typeof msg.data == 'object' && msg.data !== null) {
            startScreen.removeChild(startScreen.children[3]);

            startBtn.removeEventListener('click', generateBeatmap);
            startBtn.addEventListener('click', () => { start(msg.data, audio) })
            startBtn.disabled = false;
        } else {
            // on error
            alert('An error occured while processing the file.\nMake sure that the audio has no more than 2 channels.');
            window.location.reload();
        }
    }
}

startBtn.addEventListener('click', generateBeatmap);
