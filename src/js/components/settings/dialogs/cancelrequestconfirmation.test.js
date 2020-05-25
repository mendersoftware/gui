import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import CancelRequestConfirmationDialog from './cancelrequestconfirmation';
import { undefineds } from '../../../../../tests/mockData';

describe('CancelRequestConfirmationDialog Component', () => {
  it('renders correctly', () => {
    const tree = createMount()(<CancelRequestConfirmationDialog open={true} />).html();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
