import React from 'react';
import { TextEncoder } from 'util';
import '@testing-library/jest-dom/extend-expect';
import { within, queryByRole } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import crypto from 'crypto';

import handlers from './__mocks__/requestHandlers';
import { mockDate, token as mockToken } from './mockData';

export const RETRY_TIMES = 3;
export const TEST_LOCATION = 'localhost';

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

jest.setSystemTime(mockDate);

beforeAll(async () => {
  // Enable the mocking in tests.
  delete window.location;
  window.location = {
    ...oldWindowLocation,
    hostname: TEST_LOCATION,
    replace: jest.fn()
  };
  delete window.navigator.userLanguage;
  window.navigator.userLanguage = 'en';
  delete window.sessionStorage;
  window.sessionStorage = {
    ...oldWindowSessionStorage,
    getItem: jest.fn(() => true),
    setItem: jest.fn(),
    removeItem: jest.fn()
  };

  window.ENV = 'test';
  global.TextEncoder = TextEncoder;
  global.crypto = {
    subtle: {
      digest: (_, data) => Promise.resolve(crypto.createHash('sha256').update(data))
    }
  };
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
  // restore `window.location` to the original `jsdom` `Location` object
  window.location = oldWindowLocation;
  window.sessionStorage = oldWindowSessionStorage;
  React.useEffect.mockRestore();
  jest.useRealTimers();
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
