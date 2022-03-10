import React from 'react';
import { undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import TrialNotification from './trialnotification';

describe('DeviceNotifications Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<TrialNotification iconClassName="" sectionClassName="" />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('renders correctly with an expiration date', async () => {
    const { baseElement } = render(<TrialNotification expiration="2019-02-01T12:16:22.667Z" iconClassName="" sectionClassName="" />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
