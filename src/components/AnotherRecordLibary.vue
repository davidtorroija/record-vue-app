<template>
   <div>
       <div id="waveform"></div>
       <h1>Simple Recorder.js demo</h1>
       <p>Check out the <a href="https://github.com/addpipe/simple-recorderjs-demo" target="_blank">code on GitHub</a> and our <a href="https://addpipe.com/blog/using-recorder-js-to-capture-wav-audio-in-your-html5-web-site/" target="_blank">blog post
               on using Recorder.js to capture WAV audio</a>.</p>
       <div id="controls">
          <button id="recordButton">Record</button>
           <button id="pauseButton" disabled>Pause Record</button>
           <button id="stopButton" disabled>Stop</button>
           <button @click="playWave">play wave</button>
           <button @click="playSelected">play Region</button>
       </div>
       <div id="formats">Format: start recording to see sample rate</div>
       <h3>Recordings</h3>
       <ol id="recordingsList"></ol>

   </div>
</template>
<script>
// window.WaveSurfer = require("static/js/record-audio/wavesurfer.min.js");
   // require("static/js/record-audio/wavesurfer.min.js");
   // let WaveSurfer = window.WaveSurfer;
   // WaveSurfer.regions = require("static/js/record-audio/wavesurfer.regions.min.js");
   // WaveSurfer.microphone = require("static/js/record-audio/wavesurfer.microphone.min.js");
import WaveSurfer from 'wavesurfer.js';
import MicrophonePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.microphone.min.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.regions.min.js';
WaveSurfer.microphone = MicrophonePlugin;
WaveSurfer.regions = RegionsPlugin;
window.wavesurfer = WaveSurfer

console.log(WaveSurfer)

export default {
    name: "",
    data() {
      return {
         recorder: null,
         gumStream: null,
         wave: null,
         waveRegions: null,
      };
    },
    mounted() {

      var recordButton = document.getElementById("recordButton");
      recordButton.addEventListener("click", this.toggleRecording);
      this.initWaveSurfer();

   },
   methods: {
      playWave(){
         this.wave.play()
      },
      playSelected(){
         this.wave.regions.list[Object.keys(this.wave.regions.list)[0]].play()
      },
      initWaveSurfer(){
         this.waveRegions = WaveSurfer.regions.create({
                regions: [
                    {
                        start: 10.817485764676242,
                        end: 20.817485764676242,
                        color: 'hsla(200, 50%, 70%, 0.2)',
                        //attributes: { "label": "abc", "highlight": true },
                        //label: "aaasss",
                        //"data": { "note": "asdasdasd" }
                    }
                ],
                dragSelection: {
                    slop: 5
                }
            })
         this.wave = WaveSurfer.create({
           container: '#waveform',
           waveColor: '#46a6d8',
           progressColor: '#FFF',
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

         this.wave.regions.clear();
         this.wave.load('https://ia902606.us.archive.org/35/items/shortpoetry_047_librivox/song_cjrg_teasdale_64kb.mp3');
      },
      toggleRecording() {
         let self = this;
        if (this.recorder && this.recorder.state=="recording"){
          this.recorder.stop();
          this.gumStream.getAudioTracks()[0].stop();
        }else{
          navigator.mediaDevices.getUserMedia({audio: true}).then((stream) => {
            this.gumStream = stream;
            this.recorder = new MediaRecorder(stream);
            this.recorder.ondataavailable = function(e){
              var url = URL.createObjectURL(e.data);
              console.log(e.data, url, e)
              var preview = document.createElement('audio');
              preview.controls = true;preview.src = url;
              document.body.appendChild(preview);
              let fileReader = new FileReader();

              fileReader.addEventListener('load', e =>
                 self.wave.loadArrayBuffer(e.target.result)
                 // console.log("this",self)
                 // this.wave
              );
              fileReader.readAsArrayBuffer(e.data);
            };
            this.recorder.start();
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
