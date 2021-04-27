import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { undefineds } from '../../../../tests/mockData';
import TrialNotification from './trialnotification';

describe('DeviceNotifications Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(
      <MemoryRouter>
        <TrialNotification />
      </MemoryRouter>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('renders correctly with an expiration date', async () => {
    const { baseElement } = render(
      <MemoryRouter>
        <TrialNotification expiration="2019-02-01T12:16:22.667Z" />
      </MemoryRouter>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
