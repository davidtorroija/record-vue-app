<template>
<div>
    <div class="timer">
        <h2 id="current-time">{{currentTime}}</h2>
    </div>
    <div class="waveform-container">
        <Visualizer v-if="isRecording" />
        <div v-show="!isRecording" id="waveform"></div>
    </div>
    <div id="controls">
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
</div>
</template>
<script>
import WaveSurfer from "wavesurfer.js";
import MicrophonePlugin from "wavesurfer.js/dist/plugin/wavesurfer.microphone.min.js";
import CursorPlugin from "wavesurfer.js/dist/plugin/wavesurfer.cursor.min.js";
// import RegionsPlugin from "wavesurfer.js/dist/plugin/wavesurfer.regions.js";
import RegionsPlugin from "../../lib/wavesurfer.js/src/plugin/regions.js";

WaveSurfer.microphone = MicrophonePlugin;
WaveSurfer.regions = RegionsPlugin;
WaveSurfer.cursor = CursorPlugin;

import Visualizer from "./Visualizer";

export default {
    name: "",
    components: {
        Visualizer
    },
    data() {
        return {
            recorder: null,
            gumStream: null,
            wave: null,
            waveRegions: null,
            micWave: null,
            isRecording: false,
            currentTime: "00:00:00",
        };
    },
    mounted() {
        this.initWaveSurfer();

    },
    computed: {
        // isRecording() {
        //     if (this.recorder){
        //         console.log(this.recorder, this.recorder.state === "recording");
        //     }
        //     return this.recorder && this.recorder.state === "recording";
        // },
        isPlaying() {
            if (this.wave) {
                return this.wave.isPlaying();
            }
            return false;
        }
    },
    methods: {
        isRecordingMethod(){
            return this.recorder && this.recorder.state === "recording";
        },
        deleteRegion() {
            // I had to fixed to two decimal if I don"t do this not work, I don"t know whyyy
            const start = this.wave.regions.list[Object.keys(this.wave.regions.list)[0]].start.toFixed(2);
            const end = this.wave.regions.list[Object.keys(this.wave.regions.list)[0]].end.toFixed(2);
            const originalBuffer = this.wave.backend.buffer;
            console.log(end, start, end, start, originalBuffer, (end - start) * (originalBuffer.sampleRate * 1))
            let emptySegment = this.wave.backend.ac.createBuffer(
                originalBuffer.numberOfChannels,
                (this.wave.getDuration() - (end - start)) * (originalBuffer.sampleRate * 1),
                originalBuffer.sampleRate
            );
            console.log("total nueva wave", this.wave.getDuration(), end, start)
            for (let i = 0; i < originalBuffer.numberOfChannels; i++) {
                let chanData = originalBuffer.getChannelData(i);
                let segmentChanData = emptySegment.getChannelData(i);
                const offset = end * originalBuffer.sampleRate;
                for (let j = 0, len = chanData.length; j < originalBuffer.length; j++) {
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
                color: "hsla(200, 50%, 70%, 0.2)"
            });
        },
        trimRegion() {
            // I had to fixed to two decimal if I don"t do this not work, I don"t know whyyy
            const start = this.wave.regions.list[Object.keys(this.wave.regions.list)[0]].start.toFixed(2);
            const end = this.wave.regions.list[Object.keys(this.wave.regions.list)[0]].end.toFixed(2);
            const originalBuffer = this.wave.backend.buffer;
            console.log(end, start, end, start, originalBuffer, (end - start) * (originalBuffer.sampleRate * 1))
            let emptySegment = this.wave.backend.ac.createBuffer(
                originalBuffer.numberOfChannels,
                //segment duration
                (end - start) * (originalBuffer.sampleRate * 1),
                originalBuffer.sampleRate
            );

            for (let i = 0; i < originalBuffer.numberOfChannels; i++) {
                let chanData = originalBuffer.getChannelData(i);
                let segmentChanData = emptySegment.getChannelData(i);
                for (let j = 0, len = chanData.length; j < end * originalBuffer.sampleRate; j++) {
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
                color: "hsla(200, 50%, 70%, 0.2)"
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
                    start: 3,
                    end: 7,
                    color: "hsla(200, 50%, 70%, 0.2)",
                }],
                slop: 10,
                dragSelection: false,
                // dragSelection: {
                //     slop: 2000
                // }
            })
            this.wave = WaveSurfer.create({
                container: "#waveform",
                waveColor: "#FFF",
                progressColor: "#FFF",
                barWidth: 3,
                barGap: 3,
                // height: 130,
                cursorWidth: 1,
                cursorColor: "#46a6d8",
                // pixelRatio: 115,
                scrollParent: false,
                hideScrollbar: true,
                // responsive: 1000,
                normalize: true,
                //minimap: true,
                plugins: [
                    this.waveRegions,
                    WaveSurfer.cursor.create({
                        showTime: true,
                        opacity: 0.9,
                        color: "white",
                        width: "1px",
                        customShowTimeStyle: {
                            "background-color": "#46a6d8",
                            color: "#fff",
                            padding: "2px",
                            "font-size": "14px",
                            height: "19px"
                        }
                    })
                ],
                //  maxCanvasWidth: 100
            });

            this.wave.backend.on('audioprocess', (time) => {
                this.setCurrentTimeInMMSSMMMM(time);
            })
            this.wave.on('seek', () => {
                this.setCurrentTimeInMMSSMMMM(this.wave.getCurrentTime());
            })

            this.wave.regions.clear();
            // http://www.noiseaddicts.com/samples_1w72b820/29.mp3
            this.wave.load("https://ia902606.us.archive.org/35/items/shortpoetry_047_librivox/song_cjrg_teasdale_64kb.mp3");
            // this.wave.load("https://sample-videos.com/audio/mp3/crowd-cheering.mp3");
            window.ws = this.wave
        },
        setCurrentTimeInMMSSMMMM(time) {
            var minutes = Math.floor((time % 3600) / 60);
            var seconds = ('00' + Math.floor(time % 60)).slice(-2);
            var milliseconds = ('00' + Math.floor((time - (seconds * 1)) * 100)).slice(-2);
            this.currentTime = `${minutes} : ${seconds} : ${milliseconds}`;
        },
        toggleRecord() {
            if (this.micWave.microphone.active) {
                this.micWave.microphone.stop();
            } else {
                this.micWave.microphone.start();
            }
        },
        toggleRecording() {
            if (this.recorder && this.isRecording) {
                this.recorder.stop();
                this.gumStream.getAudioTracks()[0].stop();
                this.isRecording = false;
                // this.micWave.microphone.stop();
            } else {
                navigator.mediaDevices.getUserMedia({
                    audio: true
                }).then((stream) => {
                    this.isRecording = true;
                    this.gumStream = stream;
                    // if (!this.recorder) {
                    this.recorder = new MediaRecorder(stream);
                    // }
                    console.log(stream, this.recorder)
                    this.recorder.ondataavailable = (e) => {
                        let fileReader = new FileReader();
                        fileReader.addEventListener("load", e => {
                            this.wave.loadArrayBuffer(e.target.result);
                            // setTimeout(() => this.wave.regions.add({
                            //     start: 0,
                            //     end: this.wave.getDuration().toFixed(2) ,
                            //     color: "hsla(200, 50%, 70%, 0.2)"
                            // }), 500)
                        });
                        // console.log("result", this.wave)
                        // this.wave.drawer.clearWave();
                        this.wave.regions.clear();
                        // this.wave.empty();
                        fileReader.readAsArrayBuffer(e.data);
                    };
                    this.recorder.start();
                    // this.micWave.microphone.start();
                });
            }
            // if (this.recorder) {
            //     console.log("state", this.recorder.state, this.recorder);
            // }
        }
    }
}
</script>
<style>
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
    background: rgb(84, 123, 135);
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

/* waveform */
.wavesurfer-handle{
  cursor: col-resize;
  position: absolute;
  left: 100%;
  top: 0px;
  width: 15px !important;
  max-width: 15px !important;
  height: 100%;
  background: #46a6d8;
  opacity: 1;
}
.wavesurfer-region{
    z-index: 4 !important;
}
#waveform {
    position: relative;
}
.waveform-container {
    background: #424242 !important;
    padding: 5px !important;
    border: 3px !important;
    border-color: red !important;
    border-radius: 7px !important;
}
showtitle, cursor{
    z-index: 5 !important;
}

.wavesurfer-handle-end{
    border-bottom-right-radius: 7px !important;
    border-top-right-radius: 7px !important;
    margin-right: -15px;
}
.wavesurfer-handle-start{
    margin-left: -15px;
    border-bottom-left-radius: 7px !important;
    border-top-left-radius: 7px !important;
}


</style>
