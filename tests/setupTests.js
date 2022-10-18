import React from 'react';
import { createMocks } from 'react-idle-timer';
import { MemoryRouter } from 'react-router-dom';
import { TextEncoder } from 'util';
import { MessageChannel } from 'worker_threads';
import '@testing-library/jest-dom/extend-expect';
import { cleanup, render, queryByRole, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import crypto from 'crypto';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import handlers from './__mocks__/requestHandlers';
import { mockDate, token as mockToken } from './mockData';
import { light as lightTheme } from '../src/js/themes/Mender';

export const RETRY_TIMES = 3;
export const TEST_LOCATION = 'localhost';

export const mockAbortController = { signal: { addEventListener: () => {}, removeEventListener: () => {} } };

window.RTCPeerConnection = () => {
  return {
    createOffer: () => {},
    setLocalDescription: () => {},
    createDataChannel: () => {}
  };
};

// Setup requests interception
let server;

const oldWindowLocalStorage = window.localStorage;
const oldWindowLocation = window.location;
const oldWindowSessionStorage = window.sessionStorage;

jest.retryTimes(RETRY_TIMES);
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

jest.mock('uuid', () => ({ v4: () => 'mock-uuid' }));

jest.setSystemTime(mockDate);

beforeAll(async () => {
  // Enable the mocking in tests.
  delete window.location;
  window.location = {
    ...oldWindowLocation,
    hostname: TEST_LOCATION,
    replace: jest.fn()
  };
  delete window.sessionStorage;
  window.sessionStorage = {
    ...oldWindowSessionStorage,
    getItem: jest.fn(() => true),
    setItem: jest.fn(),
    removeItem: jest.fn()
  };
  delete window.localStorage;
  window.localStorage = {
    ...oldWindowLocalStorage,
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn()
  };
  window.ENV = 'test';
  global.AbortController = jest.fn().mockImplementation(() => mockAbortController);
  global.MessageChannel = MessageChannel;
  global.TextEncoder = TextEncoder;
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
  }));
  global.crypto = {
    subtle: {
      digest: (_, data) => Promise.resolve(crypto.createHash('sha256').update(data))
    }
  };
  createMocks();
  server = setupServer(...handlers);
  await server.listen();
  Object.defineProperty(navigator, 'appVersion', { value: 'Test', writable: true });
  const intersectionObserverMock = () => ({
    observe: jest.fn,
    disconnect: jest.fn
  });
  window.IntersectionObserver = jest.fn().mockImplementation(intersectionObserverMock);
  jest.spyOn(React, 'useEffect').mockImplementation(React.useLayoutEffect);
});

afterEach(async () => {
  // Reset any runtime handlers tests may use.
  await server.resetHandlers();
});

afterAll(async () => {
  // Clean up once the tests are done.
  await server.close();
  // restore `window.location` etc. to the original `jsdom` `Location` object
  window.localStorage = oldWindowLocalStorage;
  window.location = oldWindowLocation;
  window.sessionStorage = oldWindowSessionStorage;
  React.useEffect.mockRestore();
  cleanup();
});

export const selectMaterialUiSelectOption = async (element, optionText) => {
  // The button that opens the dropdown, which is a sibling of the input
  const selectButton = element.parentNode.querySelector('[role=button]');
  // Open the select dropdown
  userEvent.click(selectButton);
  // Get the dropdown element. We don't use getByRole() because it includes <select>s too.
  const listbox = document.body.querySelector('ul[role=listbox]');
  // Click the list item
  const listItem = within(listbox).getByText(optionText);
  userEvent.click(listItem);
  // Wait for the listbox to be removed, so it isn't visible in subsequent calls
  jest.advanceTimersByTime(150);
  expect(queryByRole(document.documentElement, 'listbox')).not.toBeInTheDocument();
  return Promise.resolve();
};

const theme = createTheme(lightTheme);

const AllTheProviders = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <MemoryRouter>{children}</MemoryRouter>
    </ThemeProvider>
  );
};

const customRender = (ui, options) => render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
// eslint-disable-next-line import/export
export * from '@testing-library/react';

// override render method
// eslint-disable-next-line import/export
export { customRender as render };
