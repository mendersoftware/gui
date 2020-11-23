import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { setupServer } from 'msw/node';
import handlers from './__mocks__/requestHandlers';

Enzyme.configure({ adapter: new Adapter() });

window.RTCPeerConnection = () => {
  return {
    createOffer: () => {},
    setLocalDescription: () => {},
    createDataChannel: () => {}
  };
};

// Setup requests interception
let server;

const oldWindowLocation = window.location;

jest.mock('universal-cookie', () => {
  const mockCookie = {
    get: jest.fn(name => {
      if (name === 'JWT') {
        return 'JWT';
      }
    }),
    set: jest.fn(),
    remove: jest.fn()
  };
  return jest.fn(() => mockCookie);
});

beforeAll(async () => {
  // Enable the mocking in tests.
  delete window.location;
  window.location = {
    ...oldWindowLocation,
    hostname: 'localhost',
    replace: jest.fn()
  };
  server = setupServer(...handlers);
  await server.listen();
});

afterEach(async () => {
  // Reset any runtime handlers tests may use.
  await server.resetHandlers();
});

afterAll(async () => {
  // Clean up once the tests are done.
  await server.close();
  // restore `window.location` to the original `jsdom`
  // `Location` object
  window.location = oldWindowLocation;
});
