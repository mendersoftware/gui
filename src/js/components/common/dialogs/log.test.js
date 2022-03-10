import React from 'react';

import { undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import LogDialog from './log';

describe('LogDialog Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<LogDialog onClose={jest.fn} logData="things" />);
    const view = baseElement.getElementsByClassName('MuiDialog-root')[0];
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
