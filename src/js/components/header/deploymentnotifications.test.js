import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import DeploymentNotifications from './deploymentnotifications';
import { undefineds } from '../../../../tests/mockData';

describe('DeploymentNotifications Component', () => {
  it('renders correctly', async () => {
    const tree = renderer
      .create(
        <MemoryRouter>
          <DeploymentNotifications />
        </MemoryRouter>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
