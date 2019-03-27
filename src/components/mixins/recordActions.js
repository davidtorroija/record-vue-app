import utils from "../utils";
import Counter from "../utils/counter";
import utilsBuffer from "audio-buffer-utils";

export default {
    created() {
        this.initializeCounter();
    },
    methods: {
        initializeCounter() {
            this.counter = new Counter({ limit: this.limit, subLimit: this.subLimit });
            this.counter.on("stop", () => {
                this.recorder.stop();
                this.isPaused = true;
                this.isRecording = false;
                this.$emit("showWarningModal", `Recording length is limited to ${(this.limit / 60).toFixed(0)} minutes. Edit your recording to reduce track length`);
            });
            this.counter.on("subLimitReached", () => {
                this.subLimitReached = true;
            });
        },
        pauseRecord() {
            this.counter.stop();
            this.recorder.stop();
            this.isPaused = true;
            this.isRecording = false;
        },
        initRecorder(stream) {
            this.recorder = new MediaRecorder(stream);
            this.recorder.addEventListener("dataavailable", this.finishRecording);
        },
        resumeRecord() {
            if (!this.isPlaying) {
                this.initRecorder(this.gumStream);
                this.counter.resume();
                this.recorder.start();
                this.wave.pause();
                this.isPaused = false;
                this.isRecording = true;
                this.subLimitReached = false;
            }
        },
        playPause() {
            this.wave.play();
        },
        playPauseSelectedRegion() {
            if (!this.isPlaying) {
                const region = this.getRegion();
                let startRegion = Number(region.start.toFixed(2));
                let endRegion = Number(region.end.toFixed(2));

                startRegion = startRegion > 0 ? startRegion : 0;
                endRegion = endRegion > 0 ? endRegion : 0;

                const currentTime = Number(this.wave.getCurrentTime().toFixed(2));

                const isBetweenRange = !(currentTime >= endRegion - 0.04 && currentTime <= endRegion + 0.01);
                const isExceed = currentTime > endRegion + 0.01;

                const start = !isBetweenRange || isExceed || currentTime < startRegion ? startRegion : currentTime;
                // console.log("playPauseSelectedRegion", currentTime, region, startRegion, endRegion, isBetweenRange, isExceed);
                if (start < endRegion) {
                    this.wave.play(start, endRegion || null);
                }
                return;
            }

            this.wave.pause();
        },
        stopRecord() {
            if (this.recorder && this.isRecording) {
                this.recorder.stop();
            }
            if (this.gumStream) {
                this.gumStream.getAudioTracks()[0].stop();
            }
            this.isRecording = false;
        },
        async readAudioRecorded(e) {
            const buffer = this.wave.backend.buffer;
            this.isLoading = true;

            let audioBuffer = await utils.arrayBufferToAudioBuffer(e.target.result, this.context);
            if (this.isLimitReached) {
                if (buffer)  {
                    audioBuffer = utilsBuffer.concat(buffer, [audioBuffer]);
                }
                audioBuffer = utilsBuffer.resize(audioBuffer, this.limit * audioBuffer.sampleRate);
            } else {
                if (buffer) {
                    let arr = [audioBuffer];
                    if (window.recordTestPerformance) {
                        for (let i = 0; i < 100; i++) {
                            arr.push(audioBuffer);
                        }
                    }
                    audioBuffer = utilsBuffer.concat(buffer, arr);
                }
            }
            this.wave.loadDecodedBuffer(audioBuffer);
        },
        finishRecording(e) {
            this.wave.empty();
            const fileReader = new FileReader();
            fileReader.addEventListener("load", this.readAudioRecorded);
            this.wave.regions.clear();
            fileReader.readAsArrayBuffer(e.data);
            this.recorder.removeEventListener("dataavailable", this.finishRecording);
            this.recorder = null;
        },
        async initRecording() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                });
                this.isRecording = true;
                this.gumStream = stream;
                this.initRecorder(stream);
                setTimeout(() => {
                    this.counter.start();
                }, 10);
                this.recorder.start();
            } catch (error) {
                console.log("recording error", error);
            }
        },
        toggleRecording() {
            if (this.firstTimeRecord) {
                this.emptyWaveInEditor = false;
            }
            this.firstTimeRecord = false;
            if (this.recorder && this.isRecording) {
                this.stopRecord();
            } else {
                this.initRecording();
            }
        },
        cancelChanges() {
            this.editMode = false;
            this.emptyWaveInEditor = false;
            this.recordedBuffer = this.originalRecordedBuffer;
            this.wave.loadDecodedBuffer(this.originalRecordedBuffer);
            this.wave.regions.clear();
            this.wave.seekTo(0);
        },
        goToRecordFirstTime() {
            this.firstTimeRecord = true;
            this.editMode = false;
            this.isPaused = false;
            this.subLimitReached = false;
            this.wave.regions.clear();
            this.wave.empty();
            delete this.wave.backend.buffer;
            this.wave.seekTo(0);
        },
        goToRecord() {
            if (this.emptyWaveInEditor) {
                return this.goToRecordFirstTime();
            }
            this.updateStartTimeEndTime();
            this.firstTimeRecord = false;
            this.subLimitReached = false;
            this.editMode = false;
            this.wave.regions.clear();
        },
    },
};
