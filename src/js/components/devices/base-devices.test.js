import React from 'react';

import { defaultState, undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import {
  AcceptedEmptyState,
  DefaultAttributeRenderer,
  DeviceCreationTime,
  DeviceSoftware,
  DeviceStatusRenderer,
  DeviceTypes,
  PendingEmptyState,
  PreauthorizedEmptyState,
  RejectedEmptyState,
  RelativeDeviceTime,
  defaultTextRender,
  getDeviceIdentityText
} from './base-devices';

describe('smaller components', () => {
  [
    AcceptedEmptyState,
    DefaultAttributeRenderer,
    DeviceCreationTime,
    DeviceSoftware,
    DeviceStatusRenderer,
    DeviceTypes,
    PendingEmptyState,
    PreauthorizedEmptyState,
    RejectedEmptyState,
    RelativeDeviceTime
  ].forEach(Component => {
    it(`renders ${Component.displayName || Component.name} correctly`, () => {
      const { baseElement } = render(
        <Component
          allCount={10}
          device={defaultState.devices.byId.a1}
          filters={[]}
          highlightHelp={true}
          idAttribute={{ attribute: 'mac', scope: 'identity' }}
          column={{ title: 'mac', attribute: { name: 'mac', scope: 'identity' }, sortable: true, textRender: defaultTextRender }}
          limitMaxed={true}
          onClick={jest.fn}
        />
      );
      const view = baseElement.firstChild.firstChild;
      expect(view).toMatchSnapshot();
      expect(view).toEqual(expect.not.stringMatching(undefineds));
    });
  });

  it('uses getDeviceIdentityText correctly', () => {
    let result = getDeviceIdentityText({ device: defaultState.devices.byId.a1 });
    expect(result).toMatch(defaultState.devices.byId.a1.id);
    expect(result).toEqual(expect.not.stringMatching(undefineds));
    result = getDeviceIdentityText({ device: defaultState.devices.byId.a1, idAttribute: { attribute: 'mac', scope: 'identity' } });
    expect(result).toMatch(defaultState.devices.byId.a1.identity_data.mac);
    expect(result).toEqual(expect.not.stringMatching(undefineds));
  });
  it('uses defaultTextRender correctly', () => {
    let result = defaultTextRender({ column: { title: 'mac', attribute: { name: 'id', scope: 'identity' } }, device: defaultState.devices.byId.a1 });
    expect(result).toMatch(defaultState.devices.byId.a1.id);
    expect(result).toEqual(expect.not.stringMatching(undefineds));
    result = defaultTextRender({ column: { title: 'mac', attribute: { name: 'mac', scope: 'identity' } }, device: defaultState.devices.byId.a1 });
    expect(result).toMatch(defaultState.devices.byId.a1.identity_data.mac);
    expect(result).toEqual(expect.not.stringMatching(undefineds));
  });
});
