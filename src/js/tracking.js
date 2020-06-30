import ReactGA from 'react-ga';

class Tracker {
    constructor() {
        this.initialized = false;
    }
    exception(error) {
        if (this.initialized) {
            ReactGA.exception(error);
        }
    }
    event(data) {
        if (this.initialized) {
            ReactGA.event(data);
        }
    }
    initialize(trackingCode) {
        ReactGA.initialize(trackingCode);
        this.initialized = true;
    }
    pageview(data) {
        if (this.initialized) {
            ReactGA.pageview(data);
        }
    }
    set(value) {
        if (this.initialized) {
            ReactGA.set(value);
        }
    }
}

const Tracking = new Tracker();
export default Tracking;