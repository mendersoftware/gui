import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import CancelRequestDialog from './cancelrequest';
import { undefineds } from '../../../../../tests/mockData';

describe('CancelRequestDialog Component', () => {
  it('renders correctly', () => {
    const tree = createMount()(<CancelRequestDialog open={true} />).html();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
