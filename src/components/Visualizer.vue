<template>
    <div class="spectrum">
        <svg
            preserveAspectRatio="none"
            id="visualizer"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
        >
            <defs>
                <mask id="mask">
                    <g id="maskGroup"/>
                </mask>
                <linearGradient
                    id="gradient"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                >
                    <stop offset="0%" style="stop-color:rgb(2, 168, 221);stop-opacity:1"/>
                    <stop offset="100%" style="stop-color:rgb(2, 168, 221);stop-opacity:1"/>
                </linearGradient>
            </defs>
            <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="url(#gradient)"
                mask="url(#mask)"
            />
        </svg>
    </div>
</template>
<script>
    export default {
        data() {
            return {
                stream: null,
                animationId: null,
                context: null,
            };
        },
        props: ["isPaused"],
        mounted() {
            this.initVisualizer();
        },
        async beforeDestroy() {
            console.log("destroying",this.animationId);
            if (this.context) {
                this.context.close();
                delete this.context;
            }
            this.stopAnimation();
        },
        watch: {
            isPaused(val) {
                if (!val) {
                    this.soundAllowed();
                } else {
                    this.stopAnimation();
                }
            },
        },
        methods: {
            stopAnimation() {
                let cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
                cancelAnimationFrame(this.animationId);
                if (this.stream) {
                    this.stream.getAudioTracks()[0].stop();
                }
            },
            soundAllowed() {
                const stream = this.stream;
                let paths = document.getElementsByTagName("path");
                let visualizer = document.getElementById("visualizer");
                let mask = visualizer.getElementById("mask");
                let path;
                //Audio stops listening in FF without // window.persistAudioStream = stream;
                //https://bugzilla.mozilla.org/show_bug.cgi?id=965483
                //https://support.mozilla.org/en-US/questions/984179
                if (!this.context) {
                    this.context = new (window.AudioContext || window.webkitAudioContext);
                    window.persistAudioStream = stream;
                    this.audioStream = this.context.createMediaStreamSource(stream);
                    this.analyser = this.context.createAnalyser();
                    this.audioStream.connect(this.analyser);
                    this.analyser.fftSize = 1024;
                }

                let frequencyArray = new Uint8Array(this.analyser.frequencyBinCount);
                // console.log("frequ", frequencyArray)
                visualizer.setAttribute("viewBox", "0 0 255 255");

                //Through the frequencyArray has a length longer than 255, there seems to be no
                //significant data after this point. Not worth visualizing.
                for (let i = 0; i < 115; i++) {
                    path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    // path.setAttribute('stroke-dasharray', '4,1');
                    mask.appendChild(path);
                }
                const doDraw = () => {
                    if (!this.isPaused) {
                        this.animationId = requestAnimationFrame(doDraw);
                        this.analyser.getByteFrequencyData(frequencyArray);
                        let adjustedLength;
                        for (let i = 1; i < 115; i++) {
                            adjustedLength = (Math.floor(frequencyArray[i]) + 6) - (Math.floor(frequencyArray[i]) % 5);
                            paths[i].setAttribute("d", "M " + (i * 2.2) + ",255 l 0,-" + adjustedLength);
                        }
                    }

                };
                doDraw();
            },
            initVisualizer() {
                let soundNotAllowed = function (error) {
                    console.log(error);
                };

                navigator.mediaDevices.getUserMedia({
                    audio: true,
                })
                    .then(stream => {
                        this.stream = stream;
                    })
                    .then(this.soundAllowed)
                    .catch(soundNotAllowed);
            },
        },
    };
</script>
<style>
/* spectrum */
.spectrum {
    width: 480px;
    height: 88px;
    display: flex;
    justify-content: center;
    align-items: center;
}

svg#visualizer{
    display: block;
    width: 447px;
    height: 70px;
    padding: 0;
    margin: 0;
    position:absolute;
}

path{
    stroke-linecap: square;
    stroke: white;
    stroke-width: 1.2px;
}
</style>
