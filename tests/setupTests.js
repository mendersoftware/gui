import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { setupServer } from 'msw/node';
import handlers from './__mocks__/requestHandlers';
import { token as mockToken } from './mockData';

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
const oldWindowSessionStorage = window.sessionStorage;

jest.mock('universal-cookie', () => {
  const mockCookie = {
    get: jest.fn(name => {
      if (name === 'JWT') {
        return mockToken;
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
  delete window.sessionStorage;
  window.sessionStorage = {
    ...oldWindowSessionStorage,
    getItem: jest.fn(() => true),
    setItem: jest.fn(),
    removeItem: jest.fn()
  };
  server = setupServer(...handlers);
  await server.listen();
  Object.defineProperty(navigator, 'appVersion', { value: 'Test', writable: true });
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
  window.sessionStorage = oldWindowSessionStorage;
});
