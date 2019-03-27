class Counter {

    constructor({ limit, subLimit }) {
        this.running = false;
        this.now = 0;
        this.time = 0;
        this.limit = limit;
        this.listeners = {
            stop: "",
        };
        this.animationId = null;
        this.subLimit = subLimit;
    }

    start() {
        if (!this.now) {
            this.now = performance.now();
        }
        if (!this.running) {
            this.running = true;
            this.animationId = requestAnimationFrame(this.step.bind(this));
        }
    }

    stop() {
        this.running = false;
        this.now = null;
        let cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
        cancelAnimationFrame(this.animationId);
    }

    cancelAnimationFrame() {
        let cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
        cancelAnimationFrame(this.animationId);
    } 

    setTime(time) {
        this.time = time;
    }

    resume() {
        if (!this.now) {
            this.now = performance.now() - this.time * 1000;
        }

        if (!this.running) {
            this.running = true;
            this.animationId = requestAnimationFrame(this.step.bind(this));
        }
    }

    on(event, cb) {
        this.listeners[event] = cb;
    }
    step(timestamp) {
        if (!this.running) {
            return;
        }

        if((this.limit) < this.time) {
            this.listeners.stop();
            this.stop();
            return;
        }
        if((this.subLimit) < this.time) {
            this.listeners.subLimitReached();
        }

        this.calculate(timestamp);
        this.animationId = requestAnimationFrame(this.step.bind(this));
    }

    calculate(timestamp) {
        this.time = (timestamp - this.now) / 1000;
    }

    destroy() {
        let cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
        cancelAnimationFrame(this.animationId);
    }

}

export default Counter;
