import React from 'react';
import { render } from '@testing-library/react';
import CancelRequestDialog from './cancelrequest';
import { undefineds } from '../../../../../tests/mockData';

describe('CancelRequestDialog Component', () => {
  beforeEach(() => {
    Math.random = jest.fn(() => 0);
  });
  it('renders correctly', () => {
    const { baseElement } = render(<CancelRequestDialog open={true} />);
    const view = baseElement.getElementsByClassName('MuiDialog-root')[0];
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
