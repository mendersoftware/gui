import React from 'react';

import { undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import GroupDefinition, { validateGroupName } from './group-definition';

describe('GroupDefinition Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<GroupDefinition groups={[]} isCreationDynamic={true} />);
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
