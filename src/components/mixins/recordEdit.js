export default {
    methods: {
        deleteRegion() {
            this.isLoading = true;
            setTimeout(()=>{
                // I had to fixed to two decimal if I don"t do this not work, I don"t know whyyy
                const start = this.getRegion().start.toFixed(2);
                const end = this.getRegion().end.toFixed(2);
                const originalBuffer = this.wave.backend.buffer;
                const duration = this.wave.getDuration();
                //console.log(end, start, end, this.wave.getDuration(), (end - start) * (originalBuffer.sampleRate * 1))

                if (end >= duration && start <= 0) {
                    this.emptyWaveInEditor = true;
                    this.isLoading = false;
                    this.counter.setTime(0);
                    return;
                }
                const length = (this.wave.getDuration() - (end - start)) * (originalBuffer.sampleRate * 1);

                let emptySegment = this.wave.backend.ac.createBuffer(
                    originalBuffer.numberOfChannels,
                    length,
                    originalBuffer.sampleRate
                );
                    // console.log("total nueva wave", this.wave.getDuration(), end, start);
                for (let i = 0; i < originalBuffer.numberOfChannels; i++) {
                    let chanData = originalBuffer.getChannelData(i);
                    let segmentChanData = emptySegment.getChannelData(i);
                    let offset = end * originalBuffer.sampleRate;
                    for (let j = 0; j < originalBuffer.length; j++) {
                        if (j < (start * originalBuffer.sampleRate)) {
                            //TODO: contemplate other cases when the region is at the end
                            segmentChanData[j] = chanData[j];
                        } else {
                            segmentChanData[j] = chanData[offset];
                            offset++;
                        }
                    }
                }
                this.wave.loadDecodedBuffer(emptySegment); // Here you go!
            }, 100);
        },
        trimRegion() {
            this.isLoading = true;
            setTimeout(()=>{
            // I had to fixed to two decimal if I don"t do this not work, I don"t know whyyy
                const start = this.getRegion().start.toFixed(2);
                const end = this.getRegion().end.toFixed(2);
                const originalBuffer = this.wave.backend.buffer;
                // console.log(end, start, end, start, originalBuffer, (end - start) * (originalBuffer.sampleRate * 1))
                let emptySegment = this.wave.backend.ac.createBuffer(
                    originalBuffer.numberOfChannels,
                    //segment duration
                    (end - start) * (originalBuffer.sampleRate * 1),
                    originalBuffer.sampleRate
                );

                for (let i = 0; i < originalBuffer.numberOfChannels; i++) {
                    let chanData = originalBuffer.getChannelData(i);
                    let segmentChanData = emptySegment.getChannelData(i);
                    for (let j = 0; j < end * originalBuffer.sampleRate; j++) {
                        segmentChanData[j] = chanData[j + (start * originalBuffer.sampleRate)];
                    }
                }
                this.wave.loadDecodedBuffer(emptySegment); // Here you go!
                // Not empty anymore, contains a copy of the segment!
                // console.log(end, start, end - start)
                this.wave.setCurrentTime(0);
            }, 100);
        },
        copyBuffer() {
            const originalBuffer = this.wave.backend.buffer;
            const duration = this.wave.getDuration() * (originalBuffer.sampleRate * 1);
            let emptySegment = this.wave.backend.ac.createBuffer(
                originalBuffer.numberOfChannels,
                //segment duration
                duration,
                originalBuffer.sampleRate
            );

            for (let i = 0; i < originalBuffer.numberOfChannels; i++) {
                let chanData = originalBuffer.getChannelData(i);
                let segmentChanData = emptySegment.getChannelData(i);
                for (let j = 0, len = chanData.length; j < len; j++) {
                    segmentChanData[j] = chanData[j];
                }
            }
            return emptySegment;
        },
        updateStartTimeEndTime() {
            this.startTime = this.getTimeInMMSSMMMM(0);
            const timeStartEl = document.querySelectorAll(".region-time-start")[0];
            timeStartEl.style.left = "-26px";

            const timeEndEl = document.querySelectorAll(".region-time-end")[0];
            this.endTime = this.getTimeInMMSSMMMM(this.wave.getDuration());
            timeEndEl.style.left = "441px";
            // console.log("updateStartTimeEndTime", waveBoundingBox);
        },
        updateRegionTime() {

            const regionBoundingBox = document.querySelectorAll(".wavesurfer-region")[0].getBoundingClientRect();
            const waveBoundingBox = this.wave.container.getBoundingClientRect();

            const timeStartEl = document.querySelectorAll(".region-time-start")[0];
            const leftTimeStart = regionBoundingBox.left - waveBoundingBox.left - 24;
            timeStartEl.style.left = leftTimeStart + "px";
            const regionStartTime = this.getRegion().start.toFixed(2) > 0 ? this.getRegion().start.toFixed(2) : 0;
            this.startTime = this.getTimeInMMSSMMMM(regionStartTime);

            const timeEndEl = document.querySelectorAll(".region-time-end")[0];
            const leftTimeEnd = regionBoundingBox.right - waveBoundingBox.left - 19;
            timeEndEl.style.left = leftTimeEnd + "px";
            let regionEndTime = this.getRegion().end.toFixed(2) > 0 ? this.getRegion().end.toFixed(2) : 0;
            if (Number(regionEndTime) > this.wave.getDuration()) {
                regionEndTime = this.wave.getDuration();
            }

            this.endTime = this.getTimeInMMSSMMMM(regionEndTime);
            
            const leftOpacity = document.querySelectorAll(".left-opacity-wave")[0];
            leftOpacity.style.width = (regionBoundingBox.left - waveBoundingBox.left + 10)  + "px";
            const rightOpacity = document.querySelectorAll(".right-opacity-wave")[0];
            rightOpacity.style.left = (regionBoundingBox.right - waveBoundingBox.left + 60)  + "px";
            rightOpacity.style.width = (waveBoundingBox.right - regionBoundingBox.right + 8)  + "px";

            const diff = leftTimeEnd - leftTimeStart;
            if (diff <= 45) {
                timeEndEl.style.marginTop = "96px";
            } else {
                timeEndEl.style.marginTop = "";
            }
        },
    },
};
