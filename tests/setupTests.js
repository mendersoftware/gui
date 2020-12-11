import '@testing-library/jest-dom/extend-expect';
import { screen, within, waitForElementToBeRemoved } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';

import handlers from './__mocks__/requestHandlers';
import { token as mockToken } from './mockData';

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

export const selectMaterialUiSelectOption = async (element, optionText) =>
  new Promise(resolve => {
    // The the button that opens the dropdown, which is a sibling of the input
    const selectButton = element.parentNode.querySelector('[role=button]');
    // Open the select dropdown
    UserEvent.click(selectButton);
    // Get the dropdown element. We don't use getByRole() because it includes <select>s too.
    const listbox = document.body.querySelector('ul[role=listbox]');
    // Click the list item
    const listItem = within(listbox).getByText(optionText);
    UserEvent.click(listItem);
    // Wait for the listbox to be removed, so it isn't visible in subsequent calls
    waitForElementToBeRemoved(() => document.body.querySelector('ul[role=listbox]')).then(resolve);
  });
