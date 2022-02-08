import React from 'react';

import { undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import OrganizationSettingsItem from './organizationsettingsitem';

describe('OrganizationSettingsItem Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(
      <OrganizationSettingsItem
        title="Current plan"
        content={{
          action: { title: 'Compare product plans', internal: false, target: 'https://mender.io/plans/pricing' },
          description: 'Trial'
        }}
        notification="upgrade now!"
      />
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
