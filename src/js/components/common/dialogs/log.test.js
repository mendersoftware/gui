import React from 'react';
import { render } from '@testing-library/react';
import LogDialog from './log';
import { undefineds } from '../../../../../tests/mockData';

describe('LogDialog Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<LogDialog onClose={jest.fn} logData="things" />);
    const view = baseElement.getElementsByClassName('MuiDialog-root')[0];
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
