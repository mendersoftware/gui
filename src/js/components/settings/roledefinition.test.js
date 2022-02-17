import React from 'react';

import { defaultState, undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import RoleDefinition from './roledefinition';

describe('Roles Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<RoleDefinition adding={true} stateGroups={defaultState.devices.groups.byId} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
