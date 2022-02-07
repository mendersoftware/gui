import React from 'react';

import { undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import RemoveGroup from './remove-group';

describe('RemoveGroup Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<RemoveGroup onClose={jest.fn} onRemove={jest.fn} />);
    const view = baseElement.getElementsByClassName('MuiDialog-root')[0];
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
