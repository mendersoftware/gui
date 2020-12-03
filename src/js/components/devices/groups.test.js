import React from 'react';
import renderer from 'react-test-renderer';
import Groups, { GroupItem, GroupsSubheader } from './groups';
import { defaultState, undefineds } from '../../../../tests/mockData';

describe('Groups Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<Groups groups={defaultState.devices.groups.byId} openGroupDialog={jest.fn} />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});

describe('Groups sub components', () => {
  [GroupItem, GroupsSubheader].forEach(Component => {
    it(`renders ${Component.displayName || Component.name} correctly`, () => {
      const tree = renderer.create(<Component heading="test" name="test" />).toJSON();
      expect(tree).toMatchSnapshot();
      expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
    });
  });
});
