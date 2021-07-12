import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import GroupDefinition, { validateGroupName } from './group-definition';
import { undefineds } from '../../../../../tests/mockData';

describe('GroupDefinition Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(
      <MemoryRouter>
        <GroupDefinition groups={[]} isCreationDynamic={true} />
      </MemoryRouter>
    );
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('validates group names correctly', async () => {
    expect(validateGroupName('test', undefined, 'test').invalid).toBeTruthy();
    expect(validateGroupName('test', undefined, 'test').errortext).toEqual('test is the same group the selected devices are already in');
    expect(validateGroupName('tæst', undefined, 'test').invalid).toBeTruthy();
    expect(validateGroupName(false, undefined, 'test').invalid).toBeTruthy();
    expect(validateGroupName('', undefined, 'test').invalid).toBeTruthy();
    expect(validateGroupName('test', ['test'], '', true).invalid).toBeTruthy();
  });
});
