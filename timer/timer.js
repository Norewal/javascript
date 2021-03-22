class Timer  {
    constructor(durationInput, startBtn, pauseBtn, callbacks) {
        //console.log(this)
        this.durationInput = durationInput;
        this.startBtn = startBtn;
        this.pauseBtn = pauseBtn;

        if (callbacks) {
            this.onStart = callbacks.onStart;
            this.onTick = callbacks.onTick;
            this.onComplete = callbacks.onComplete;
        }

        this.startBtn.addEventListener('click', this.start);
        this.pauseBtn.addEventListener('click', this.pause);
    }
    start = () => {
        //console.log('Time to start the timer');

        //callback
        if (this.onStart) {
            this.onStart(this.timeRemaining);
        }

        this.tick();
        //const timer = setInterval(this.tick, 1000);
        this.interval = setInterval(this.tick, 20); 
        
    };
    pause = () => {
        clearInterval(this.interval);
    };
    tick = () => { 
        //console.log('thick');
        //const timeRemaining = parseFloat(this.timeRemaining);
        if(this.timeRemaining <= 0) {
            this.pause();

            //callback
            if (this.onComplete) {
                this.onComplete();
            }
        } else {
            this.timeRemaining = this.timeRemaining - 0.02;

            //callback
            if (this.onTick) {
                this.onTick(this.timeRemaining);
            }
        }
    };
    get timeRemaining() {
        return parseFloat(this.durationInput.value);
    }
    set timeRemaining(time) {
        this.durationInput.value = time.toFixed(2);
    }
};