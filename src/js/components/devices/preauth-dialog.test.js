import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import PreauthDialog from './preauth-dialog';
import { undefineds } from '../../../../tests/mockData';

describe('RejectedDevices Component', () => {
  it('renders correctly', () => {
    const tree = createMount()(
      <PreauthDialog deviceLimitWarning={<div>I should not be rendered/ undefined</div>} limitMaxed={false} onSubmit={jest.fn} onCancel={jest.fn} />
    );
    expect(tree.html()).toMatchSnapshot();
    expect(JSON.stringify(tree.html())).toEqual(expect.not.stringMatching(undefineds));
  });
});
