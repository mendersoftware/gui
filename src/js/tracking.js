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
        if (this.initialized) {
            return false;
          }
        ReactGA.initialize(trackingCode);
        this.initialized = true;
        return true;
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