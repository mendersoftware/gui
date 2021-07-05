import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import {
  AcceptedEmptyState,
  DeviceCreationTime,
  DeviceExpansion,
  DeviceStatusHeading,
  PendingEmptyState,
  PreauthorizedEmptyState,
  RejectedEmptyState,
  RelativeDeviceTime
} from './base-devices';
import { defaultState, undefineds } from '../../../../tests/mockData';

describe('smaller components', () => {
  [
    AcceptedEmptyState,
    DeviceCreationTime,
    DeviceExpansion,
    DeviceStatusHeading,
    PendingEmptyState,
    PreauthorizedEmptyState,
    RejectedEmptyState,
    RelativeDeviceTime
  ].forEach(Component => {
    it(`renders ${Component.displayName || Component.name} correctly`, () => {
      const { baseElement } = render(
        <MemoryRouter>
          <Component filters={[]} highlightHelp={true} limitMaxed={true} onClick={jest.fn} allCount={10} device={defaultState.devices.byId.a1} />
        </MemoryRouter>
      );
      const view = baseElement.firstChild.firstChild;
      expect(view).toMatchSnapshot();
      expect(view).toEqual(expect.not.stringMatching(undefineds));
    });
  });
});
