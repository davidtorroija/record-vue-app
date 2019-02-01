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
            // doDraw: () =>{},
            animationId: null
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
        console.log("destroying",this.animationId);
        let cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
        cancelAnimationFrame(this.animationId);
    },
    methods: {
        drawSpectrum() {

        },
        initVisualizer() {
            let paths = document.getElementsByTagName('path');
            let visualizer = document.getElementById('visualizer');
            let mask = visualizer.getElementById('mask');
            let path;

            let soundAllowed = (stream) => {
                //Audio stops listening in FF without // window.persistAudioStream = stream;
                //https://bugzilla.mozilla.org/show_bug.cgi?id=965483
                //https://support.mozilla.org/en-US/questions/984179
                window.persistAudioStream = stream;
                let audioContent = new AudioContext();
                let audioStream = audioContent.createMediaStreamSource(stream);
                let analyser = audioContent.createAnalyser();
                audioStream.connect(analyser);
                analyser.fftSize = 1024;

                let frequencyArray = new Uint8Array(analyser.frequencyBinCount);
                // console.log("frequ", frequencyArray)
                visualizer.setAttribute('viewBox', '0 0 255 255');

                //Through the frequencyArray has a length longer than 255, there seems to be no
                //significant data after this point. Not worth visualizing.
                for (let i = 0; i < 90; i++) {
                    path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    // path.setAttribute('stroke-dasharray', '4,1');
                    mask.appendChild(path);
                }
                let doDraw = () => {
                    this.animationId = requestAnimationFrame(doDraw);
                    analyser.getByteFrequencyData(frequencyArray);
                    let adjustedLength;
                    for (let i = 1; i < 90; i++) {
                        adjustedLength = Math.floor(frequencyArray[i]) - (Math.floor(frequencyArray[i]) % 5);
                        paths[i].setAttribute('d', 'M ' + (i * 3.5) + ',255 l 0,-' + adjustedLength);
                    }
                }
                doDraw();
            }

            let soundNotAllowed = function(error) {
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
    width: 398px;
    height: 100px;
}
.spectrum{
    font-size: 0;
    display: inline-block;
}

svg{
    display: block;
    width: 398px;
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
