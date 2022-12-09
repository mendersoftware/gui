import React from 'react';

import { defaultState, undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import { emptyRole } from '../../constants/userConstants';
import RoleDefinition from './roledefinition';

describe('Roles Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(
      <RoleDefinition
        adding
        editing
        onCancel={jest.fn}
        onSubmit={jest.fn}
        removeRole={jest.fn}
        stateGroups={defaultState.devices.groups.byId}
        selectedRole={{ ...emptyRole }}
      />
    );
    const view = baseElement.lastElementChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
