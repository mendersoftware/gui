import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

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
