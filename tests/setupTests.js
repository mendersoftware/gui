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

// Setup requests interception using the given handlers.
let server;

beforeAll(async () => {
  // Enable the mocking in tests.
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
});
