import React from 'react';
import renderer from 'react-test-renderer';
import OrganizationSettingsItem from './organizationsettingsitem';
import { undefineds } from '../../../../tests/mockData';

describe('OrganizationSettingsItem Component', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create(
        <OrganizationSettingsItem
          title="Current plan"
          content={{
            action: { title: 'Compare product plans', internal: false, target: 'https://mender.io/plans/pricing' },
            description: 'Trial'
          }}
          notification="upgrade now!"
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
