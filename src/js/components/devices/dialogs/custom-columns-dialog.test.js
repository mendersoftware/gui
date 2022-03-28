import React from 'react';

import { undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import ColumnCustomizationDialog from './custom-columns-dialog';

describe('ColumnCustomizationDialog Component', () => {
  it('renders correctly', async () => {
    const attributes = [
      { key: 'name', value: 'Name', scope: 'tags', category: 'tags', priority: 1 },
      { key: 'id', value: 'Device ID', scope: 'identity', category: 'identity', priority: 1 },
      { key: 'status', value: 'status', scope: 'identity', category: 'identity', priority: 1 },
      { key: 'mac', value: 'mac', scope: 'identity', category: 'identity', priority: 1 },
      { key: 'artifact_name', value: 'artifact_name', scope: 'inventory', category: 'inventory', priority: 2 }
    ];

    const rootfs = 'rootfs-image.version';
    const headers = [
      { title: 'mac', attribute: { name: 'mac', scope: 'identity' }, sortable: true, customize: jest.fn, textRender: jest.fn },
      {
        id: 'inventory-device_type',
        key: 'device_type',
        name: 'device_type',
        scope: 'inventory',
        title: 'Device type',
        attribute: { name: 'device_type', scope: 'inventory' },
        textRender: jest.fn
      },
      {
        id: 'inventory-rootfs-image.version',
        key: rootfs,
        name: rootfs,
        scope: 'inventory',
        title: 'Current software',
        attribute: { name: rootfs, scope: 'inventory', alternative: 'artifact_name' },
        textRender: jest.fn
      },
      {
        id: 'system-updated_ts',
        key: 'updated_ts',
        name: 'updated_ts',
        scope: 'system',
        title: 'Last check-in',
        attribute: { name: 'updated_ts', scope: 'system' },
        textRender: jest.fn
      },
      { title: 'Status', attribute: { name: 'status', scope: 'identity' }, sortable: true, component: jest.fn, textRender: jest.fn }
    ];

    const { baseElement } = render(
      <ColumnCustomizationDialog
        attributes={attributes}
        columnHeaders={headers}
        idAttribute={{ attribute: 'mac', scope: 'identity' }}
        onCancel={jest.fn}
        onSubmit={jest.fn}
      />
    );
    const view = baseElement.getElementsByClassName('MuiDialog-root')[0];
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
