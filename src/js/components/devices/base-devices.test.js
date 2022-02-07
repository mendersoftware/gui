import React from 'react';

import { defaultState, undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
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
        <Component filters={[]} highlightHelp={true} limitMaxed={true} onClick={jest.fn} allCount={10} device={defaultState.devices.byId.a1} />
      );
      const view = baseElement.firstChild.firstChild;
      expect(view).toMatchSnapshot();
      expect(view).toEqual(expect.not.stringMatching(undefineds));
    });
  });
});
