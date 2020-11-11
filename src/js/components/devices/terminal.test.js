import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import TerminalDialog from './terminal';
import { undefineds } from '../../../../tests/mockData';

describe('TerminalDialog Component', () => {
  it('renders correctly', () => {
    const tree = createMount()(<TerminalDialog onCancel={jest.fn} open={true} />);
    expect(tree.html()).toMatchSnapshot();
    expect(JSON.stringify(tree.html())).toEqual(expect.not.stringMatching(undefineds));
  });
});
