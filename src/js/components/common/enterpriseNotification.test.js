import React from 'react';

import { undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import EnterpriseNotification from './enterpriseNotification';

describe('EnterpriseNotification Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<EnterpriseNotification benefit="a test benefit" />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
