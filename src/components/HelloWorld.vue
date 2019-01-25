<template>
    <video id="myVideo" class="video-js vjs-default-skin"></video>
</template>

<style>
/* change player background color */
#myVideo {
  background-color: #95DDF5;
}
</style>

<script>
    // import 'video.js/dist/video-js.css'
    // import 'videojs-record/dist/css/videojs.record.css'
    //
    // import videojs from 'video.js'
    // import Record from 'videojs-record/dist/videojs.record.js'
    //
    // import 'webrtc-adapter';
    // import RecordRTC from 'recordrtc';
    // // import './record-audio/adapter-latest.js';
    // // import RecordRTC from './record-audio/RecordRTC.js';
    // // the following imports are only needed when you're recording
    // // audio-only using the videojs-wavesurfer plugin
    // import WaveSurfer from 'wavesurfer.js';
    // import MicrophonePlugin from './record-audio/wavesurfer.microphone.min.js';
    // import RegionsPlugin from './record-audio/wavesurfer.regions.min.js';
    // WaveSurfer.microphone = MicrophonePlugin;
    // WaveSurfer.regions = RegionsPlugin;
    // window.wavesurfer = WaveSurfer
    //
    // // register videojs-wavesurfer plugin
    // import Wavesurfer from './record-audio/videojs.wavesurfer.min.js';

    export default {
        data() {
            return {
                player: '',
                options: {
                    controls: true,
                    autoplay: false,
                    fluid: false,
                    loop: false,
                    width: 320,
                    height: 240,
                    controlBar: {
                        volumePanel: false
                    },
                    plugins: {
                        // configure videojs-record plugin
                        wavesurfer: {
                           src: 'live',
                           waveColor: '#36393b',
                           progressColor: 'black',
                           debug: true,
                           cursorWidth: 1,
                           msDisplayMax: 20,
                           hideScrollbar: true
                       },
                        record: {
                            audio: false,
                            video: true,
                            debug: true
                        }
                    }
                }
            };
        },
        mounted() {
            // this.player = videojs('#myVideo', this.options, () => {
            //     // print version information at startup
            //     var msg = 'Using video.js ' + videojs.VERSION +
            //         ' with videojs-record ' + videojs.getPluginVersion('record') +
            //         ' and recordrtc ' + RecordRTC.version;
            //     videojs.log(msg);
            // });
            //
            // // device is ready
            // this.player.on('deviceReady', () => {
            //     console.log('device is ready!');
            // });
            //
            // // user clicked the record button and started recording
            // this.player.on('startRecord', () => {
            //     console.log('started recording!');
            // });
            //
            // // user completed recording and stream is available
            // this.player.on('finishRecord', () => {
            //     // the blob object contains the recorded data that
            //     // can be downloaded by the user, stored on server etc.
            //     console.log('finished recording: ', this.player.recordedData);
            // });
            //
            // // error handling
            // this.player.on('error', (error) => {
            //     console.warn(error);
            // });
            
        },
        beforeDestroy() {
            if (this.player) {
                this.player.dispose();
            }
        }
    }
</script>
