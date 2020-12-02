import React from 'react';
import renderer from 'react-test-renderer';
import { defaultState, undefineds } from '../../../../tests/mockData';
import RoleDefinition from './roledefinition';

describe('Roles Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<RoleDefinition adding={true} stateGroups={Object.keys(defaultState.devices.groups.byId)} name="test" />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
