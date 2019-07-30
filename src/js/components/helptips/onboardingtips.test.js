import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { DevicePendingTip, WelcomeSnackTip } from './onboardingtips';

describe('DevicePendingTip', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create(
        <MemoryRouter>
          <DevicePendingTip />
        </MemoryRouter>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe('WelcomeSnackTip', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<WelcomeSnackTip />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
