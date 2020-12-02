import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import GroupDefinition, { validateGroupName } from './group-definition';
import { undefineds } from '../../../../../tests/mockData';

describe('GroupDefinition Component', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create(
        <MemoryRouter>
          <GroupDefinition groups={[]} isCreationDynamic={true} />
        </MemoryRouter>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });

  it('validates group names correctly', () => {
    expect(validateGroupName('test', undefined, 'test').invalid).toBeTruthy();
    expect(validateGroupName('test', undefined, 'test').errortext).toEqual('test is the same group the selected devices are already in');
    expect(validateGroupName('tæst', undefined, 'test').invalid).toBeTruthy();
    expect(validateGroupName(false, undefined, 'test').invalid).toBeTruthy();
    expect(validateGroupName('', undefined, 'test').invalid).toBeTruthy();
    expect(validateGroupName('test', ['test'], '', true).invalid).toBeTruthy();
  });
});
