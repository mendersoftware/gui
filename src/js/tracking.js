import ReactGA from 'react-ga';

const cookieConsentCSS = 'https://cdn.jsdelivr.net/npm/cookieconsent@3/build/cookieconsent.min.css';
const cookieConsentJS = 'https://cdn.jsdelivr.net/npm/cookieconsent@3/build/cookieconsent.min.js';

class Tracker {
  constructor() {
    this.initialized = false;
  }
  cookieconsent(saveUserSettings) {
    const style = document.createElement('link');
    style.href = cookieConsentCSS;
    style.rel = 'stylesheet';
    style.async = true;
    document.head.appendChild(style);
    //
    const script = document.createElement('script');
    script.src = cookieConsentJS;
    script.async = false;
    script.addEventListener('load', () => {
      window.cookieconsent.initialise({
        palette: {
          popup: {
            background: '#5d0f43',
            text: '#ffffff'
          },
          button: {
            background: '#73a4ad',
            text: '#ffffff'
          }
        },
        position: 'bottom-left',
        type: 'opt-out',
        content: {
          message: 'We use cookies to analyze our traffic so we can improve our website and give you a better experience.',
          link: 'View our cookie policy',
          href: 'https://northern.tech/legal/cookies'
        },
        autoOpen: true,
        revokable: false,
        law: {
          regionalLaw: false
        },
        onStatusChange: status => {
          let hasConsented = status == 'allow';
          saveUserSettings({ trackingConsentGiven: hasConsented });
        }
      });
    });
    document.body.appendChild(script);
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
