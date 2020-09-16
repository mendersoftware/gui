import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import '../src/js/i18n';

Enzyme.configure({ adapter: new Adapter() });

window.mender_environment = {
  features: {
    hasMultitenancy: true
  },
  services: {
    deploymentsVersion: null,
    deviceauthVersion: null,
    inventoryVersion: null
  }
};

window.RTCPeerConnection = () => {
  return {
    createOffer: () => {},
    setLocalDescription: () => {},
    createDataChannel: () => {}
  };
};
