import React from 'react';
import { render } from '@testing-library/react';
import Groups, { GroupItem, GroupsSubheader } from './groups';
import { defaultState, undefineds } from '../../../../tests/mockData';

describe('Groups Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<Groups groups={defaultState.devices.groups.byId} openGroupDialog={jest.fn} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  [GroupItem, GroupsSubheader].forEach(async Component => {
    it(`renders ${Component.displayName || Component.name} correctly`, () => {
      const { baseElement } = render(<Component heading="test" name="test" />);
      const view = baseElement.firstChild.firstChild;
      expect(view).toMatchSnapshot();
      expect(view).toEqual(expect.not.stringMatching(undefineds));
    });
  });
});
