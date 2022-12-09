import React from 'react';

import { undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import DemoNotification from './demonotification';

describe('DemoNotification Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<DemoNotification iconClassName="" sectionClassName="" />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
