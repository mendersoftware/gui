import React from 'react';

import { defaultState, undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import { getGroups } from '../../selectors';
import Groups, { GroupItem, GroupsSubheader } from './groups';

describe('Groups Component', () => {
  it('renders correctly', async () => {
    // eslint-disable-next-line no-unused-vars
    const { groupNames, ...groups } = getGroups(defaultState);
    const { baseElement } = render(<Groups groups={groups} openGroupDialog={jest.fn} />);
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
