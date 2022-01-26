import React from 'react';

import { undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import OfferHeader from './offerheader';

describe('DeviceNotifications Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<OfferHeader />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
