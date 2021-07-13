import React from 'react';
import { render } from '@testing-library/react';
import DemoNotification from './demonotification';
import { undefineds } from '../../../../tests/mockData';

describe('DemoNotification Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<DemoNotification />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
