<template>
<div>
    <div id="micWave"></div>
    <div id="waveform"></div>
    <div id="controls">
        <!-- <button v-show="!isRecording" @click="toggleRecord">Record1</button> -->
        <button v-show="!isRecording" @click="toggleRecording">Record</button>
        <button v-show="isRecording" @click="toggleRecording">Stop Record</button>
        <p> | </p>
        <button v-show="!isPlaying" @click="wave.playPause()">Play</button>
        <button v-show="isPlaying" @click="wave.playPause()">Pause</button>
        <button v-show="isPlaying" @click="wave.stop()">Stop</button>
        <button @click="playSelectedRegion">Play Region</button>
        <button @click="trimRegion">Trim</button>
        <button @click="deleteRegion">Delete</button>

    </div>
    <div id="formats">Format: start recording to see sample rate</div>
    <h3>Recordings</h3>
    <ol id="recordingsList"></ol>

</div>
</template>
<script>
import WaveSurfer from "wavesurfer.js";
import MicrophonePlugin from "wavesurfer.js/dist/plugin/wavesurfer.microphone.min.js";
import RegionsPlugin from "wavesurfer.js/dist/plugin/wavesurfer.regions.min.js";
// import( /* webpackIgnore: true */ 'https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css').then((lib)=>{
//    console.log(lib)
// });

WaveSurfer.microphone = MicrophonePlugin;
WaveSurfer.regions = RegionsPlugin;

export default {
    name: "",
    data() {
        return {
            recorder: null,
            gumStream: null,
            wave: null,
            waveRegions: null,
            micWave: null
        };
    },
    mounted() {
        this.initWaveSurfer();

    },
    computed: {
        isRecording() {
            return this.recorder && this.recorder.state === "recording";
        },
        isPlaying() {
            if (this.wave) {
                return this.wave.isPlaying();
            }
            return false;
        }
    },
    methods: {
        deleteRegion() {
            // I had to fixed to two decimal if I don't do this not work, I don't know whyyy
            const start = this.wave.regions.list[Object.keys(this.wave.regions.list)[0]].start.toFixed(2);
            const end = this.wave.regions.list[Object.keys(this.wave.regions.list)[0]].end.toFixed(2);
            const originalBuffer = this.wave.backend.buffer;
            console.log(end, start, end, start, originalBuffer, (end - start) * (originalBuffer.sampleRate * 1))
            var emptySegment = this.wave.backend.ac.createBuffer(
                originalBuffer.numberOfChannels,
                (this.wave.getDuration() - (end - start)) * (originalBuffer.sampleRate * 1),
                originalBuffer.sampleRate
            );
            console.log("total nueva wave", this.wave.getDuration(), end, start)
            for (var i = 0; i < originalBuffer.numberOfChannels; i++) {
                var chanData = originalBuffer.getChannelData(i);
                var segmentChanData = emptySegment.getChannelData(i);
                const offset = end * originalBuffer.sampleRate;
                for (var j = 0, len = chanData.length; j < originalBuffer.length; j++) {
                    if (j < (start * originalBuffer.sampleRate)) {
                        //TODO: contemplate other cases when the region is at the end
                        segmentChanData[j] = chanData[j]
                    } else {
                        //if (j > end * originalBuffer.sampleRate) {
                        segmentChanData[j] = chanData[j + offset];
                        //} else {
                        //  segmentChanData[j] = chanData[j + offset];
                        //}
                    }
                }
            }
            //this.wave.drawer.clearWave();
            //this.wave.empty();
            this.wave.loadDecodedBuffer(emptySegment); // Here you go!
            // Not empty anymore, contains a copy of the segment!
            console.log(end, start, end - start)
            //this.wave.drawBuffer();
            this.wave.regions.clear();
            this.wave.regions.add({
                start: 0,
                end: end,
                color: 'hsla(200, 50%, 70%, 0.2)'
            });
        },
        trimRegion() {
            // I had to fixed to two decimal if I don't do this not work, I don't know whyyy
            const start = this.wave.regions.list[Object.keys(this.wave.regions.list)[0]].start.toFixed(2);
            const end = this.wave.regions.list[Object.keys(this.wave.regions.list)[0]].end.toFixed(2);
            const originalBuffer = this.wave.backend.buffer;
            console.log(end, start, end, start, originalBuffer, (end - start) * (originalBuffer.sampleRate * 1))
            var emptySegment = this.wave.backend.ac.createBuffer(
                originalBuffer.numberOfChannels,
                //segment duration
                (end - start) * (originalBuffer.sampleRate * 1),
                originalBuffer.sampleRate
            );

            for (var i = 0; i < originalBuffer.numberOfChannels; i++) {
                var chanData = originalBuffer.getChannelData(i);
                var segmentChanData = emptySegment.getChannelData(i);
                for (var j = 0, len = chanData.length; j < end * originalBuffer.sampleRate; j++) {
                    segmentChanData[j] = chanData[j + (start * originalBuffer.sampleRate)];
                }
            }
            this.wave.loadDecodedBuffer(emptySegment); // Here you go!
            // Not empty anymore, contains a copy of the segment!
            console.log(end, start, end - start)
            this.wave.regions.clear();
            this.wave.regions.add({
                start: 0,
                end: end,
                color: 'hsla(200, 50%, 70%, 0.2)'
            });
        },
        playPause() {
            this.wave.play()
        },
        playSelectedRegion() {
            this.wave.regions.list[Object.keys(this.wave.regions.list)[0]].play()
        },
        initWaveSurfer() {
            this.waveRegions = WaveSurfer.regions.create({
                regions: [{
                    start: 10.817485764676242,
                    end: 20.817485764676242,
                    color: "hsla(200, 50%, 70%, 0.2)",
                }],
                dragSelection: {
                    slop: 5
                }
            })
            this.wave = WaveSurfer.create({
                container: "#waveform",
                waveColor: "#46a6d8",
                progressColor: "#FFF",
                barWidth: 3,
                barGap: 2,
                height: 130,
                cursorWidth: 1,
                cursorColor: "white",
                //pixelRatio: 1,
                //scrollParent: true,
                responsive: 1000,
                normalize: true,
                //minimap: true,
                plugins: [
                    this.waveRegions,
                ],
                //  maxCanvasWidth: 100
            });

            // this.micWave = WaveSurfer.create({
            //     container: '#micWave',
            //     waveColor: 'green',
            //     interact: false,
            //     cursorWidth: 0,
            //     plugins: [
            //         WaveSurfer.microphone.create()
            //     ]
            // });
            // this.micWave.microphone.on('deviceReady', function(stream) {
            //     console.log('Device ready!', stream);
            // });
            // this.micWave.microphone.on('deviceError', function(code) {
            //     console.warn('Device error: ' + code);
            // });
            // this.micWave.microphone.start();

            this.wave.regions.clear();
            this.wave.load("https://ia902606.us.archive.org/35/items/shortpoetry_047_librivox/song_cjrg_teasdale_64kb.mp3");
            window.ws = this.wave
        },
        toggleRecord(){
            if (this.micWave.microphone.active) {
                this.micWave.microphone.stop();
            } else {
                this.micWave.microphone.start();
            }
        },
        toggleRecording() {
            let self = this;
            if (this.recorder) {
                console.log("state", this.recorder.state, this.recorder);
            }
            if (this.recorder && this.isRecording) {
                this.recorder.stop();
                this.gumStream.getAudioTracks()[0].stop();
                // this.micWave.microphone.stop();
            } else {
                navigator.mediaDevices.getUserMedia({
                    audio: true
                }).then((stream) => {
                    this.gumStream = stream;
                    // if (!this.recorder) {
                    this.recorder = new MediaRecorder(stream);
                    // }
                    console.log(stream, this.recorder)
                    this.recorder.ondataavailable = function(e) {
                        // var url = URL.createObjectURL(e.data);
                        // console.log(e.data, url, e)
                        // var preview = document.createElement("audio");
                        // preview.controls = true;preview.src = url;
                        // document.body.appendChild(preview);
                        let fileReader = new FileReader();
                        fileReader.addEventListener("load", e =>
                            self.wave.loadArrayBuffer(e.target.result)
                        );
                        fileReader.readAsArrayBuffer(e.data);
                    };
                    this.recorder.start();
                    // this.micWave.microphone.start();
                });
            }
        }
    }
}
</script>
<style>
* {
    padding: 0;
    margin: 0;
}

a {
    color: #337ab7;
}

p {
    margin-top: 1rem;
}

a:hover {
    color: #23527c;
}

a:visited {
    color: #8d75a3;
}

body {
    margin: 1rem;
    padding: 1rem;
    font-family: sans-serif;
    max-width: 28rem;
    margin: 0 auto;
    position: relative;
    background: rgb(23, 24, 113);
}

#controls {
    display: flex;
    margin-top: 2rem;
}

button {
    flex-grow: 1;
    height: 2.5rem;
    min-width: 2rem;
    border: none;
    border-radius: 0.15rem;
    background: #ed341d;
    margin-left: 2px;
    box-shadow: inset 0 -0.15rem 0 rgba(0, 0, 0, 0.2);
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #ffffff;
    font-weight: bold;
    font-size: 1rem;
}

button:focus,
button:hover {
    outline: none;
    background: #c72d1c;
}

button::-moz-focus-inner {
    border: 0;
}

button:active {
    box-shadow: inset 0 1px 0 rgba(0, 0, 0, 0.2);
    line-height: 3rem;
}

button:disabled {
    pointer-events: none;
    background: lightgray;
}

button:first-child {
    margin-left: 0;
}

audio {
    display: block;
    width: 100%;
    margin-top: 0.2rem;
}

li {
    list-style: none;
    margin-bottom: 1rem;
}

#formats {
    margin-top: 0.5rem;
    font-size: 80%;
}
</style>
