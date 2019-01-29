<template>
    <div class="spectrum">
        <svg preserveAspectRatio="none" id="visualizer" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
         <defs>
             <mask id="mask">
                 <g id="maskGroup">
               </g>
             </mask>
             <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#FFFFF;stop-opacity:1" />
                <stop offset="20%" style="stop-color:#0096C6;stop-opacity:1" />
                <stop offset="90%" style="stop-color:#02A8DD;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#0073e3;stop-opacity:1" />
             </linearGradient>
         </defs>
         <rect x="0" y="0" width="100%" height="100%" fill="url(#gradient)" mask="url(#mask)"></rect>
        </svg>
    </div>
</template>
<script>
export default {
    data() {
        return {
            doDraw: () =>{},
        }
    },
    props: {
        stream: {
            type: Object,
            required: false
        },
    },
    mounted() {
        this.initVisualizer();
    },
    beforeDestroy() {
        let cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
        cancelAnimationFrame(this.doDraw);
    },
    methods: {
        drawSpectrum() {

        },
        initVisualizer() {
            var paths = document.getElementsByTagName('path');
            var visualizer = document.getElementById('visualizer');
            var mask = visualizer.getElementById('mask');
            var path;

            var soundAllowed = (stream) => {
                //Audio stops listening in FF without // window.persistAudioStream = stream;
                //https://bugzilla.mozilla.org/show_bug.cgi?id=965483
                //https://support.mozilla.org/en-US/questions/984179
                window.persistAudioStream = stream;
                var audioContent = new AudioContext();
                var audioStream = audioContent.createMediaStreamSource(stream);
                var analyser = audioContent.createAnalyser();
                audioStream.connect(analyser);
                analyser.fftSize = 1024;

                var frequencyArray = new Uint8Array(analyser.frequencyBinCount);
                visualizer.setAttribute('viewBox', '0 0 255 255');

                //Through the frequencyArray has a length longer than 255, there seems to be no
                //significant data after this point. Not worth visualizing.
                for (var i = 0; i < 255; i++) {
                    path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    // path.setAttribute('stroke-dasharray', '4,1');
                    mask.appendChild(path);
                }
                this.doDraw = () => {
                    requestAnimationFrame(this.doDraw);
                    analyser.getByteFrequencyData(frequencyArray);
                    var adjustedLength;
                    for (var i = 0; i < 255; i = i + 3) {
                        adjustedLength = Math.floor(frequencyArray[i]) - (Math.floor(frequencyArray[i]) % 5);
                        paths[i].setAttribute('d', 'M ' + (i) + ',255 l 0,-' + adjustedLength);
                    }
                }
                this.doDraw();
            }

            var soundNotAllowed = function(error) {
                console.log(error);
            }

            // window.navigator = window.navigator || {};
            // navigator.getUserMedia = navigator.getUserMedia ||
            //     navigator.webkitGetUserMedia ||
            //     navigator.mozGetUserMedia ||
            //     null;
            navigator.getUserMedia({
                audio: true
            }, soundAllowed, soundNotAllowed);
        },
    }
}
</script>
<style >
/* spectrum */
.spectrum {
    width: 300px;
    height: 100px;
}
.spectrum{
    padding: 0;
    margin: 0;
    background-color:#222;
    font-size: 0;
}

svg{
    display: block;
    width: 300px;
    height: 100px;
    padding: 0;
    margin: 0;
    position:absolute;
}

path{
    stroke-linecap: square;
    stroke: white;
    stroke-width: 2px;
}
</style>
