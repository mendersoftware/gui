import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import RemoveGroup from './remove-group';
import { undefineds } from '../../../../tests/mockData';

describe('RejectedDevices Component', () => {
  it('renders correctly', () => {
    const tree = createMount()(<RemoveGroup onClose={jest.fn} onRemove={jest.fn} />);
    expect(tree.html()).toMatchSnapshot();
    expect(JSON.stringify(tree.html())).toEqual(expect.not.stringMatching(undefineds));
  });
});
