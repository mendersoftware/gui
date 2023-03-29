import React from 'react';

import { undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import GroupDefinition, { validateGroupName } from './group-definition';

const selectedDevices = [{ id: 'test' }];

describe('GroupDefinition Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<GroupDefinition groups={[]} isCreationDynamic={true} />);
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('validates group names correctly', async () => {
    expect(validateGroupName('test', undefined, [{ ...selectedDevices[0], group: 'test' }])).toEqual({
      errortext: 'test is the same group the selected devices are already in',
      invalid: true,
      isModification: false,
      name: 'test'
    });
    expect(validateGroupName('tæst', undefined, selectedDevices).invalid).toBeTruthy();
    expect(validateGroupName(false, undefined, selectedDevices).invalid).toBeTruthy();
    expect(validateGroupName('', undefined, selectedDevices).invalid).toBeTruthy();
    expect(validateGroupName('test', ['test'], [], true).invalid).toBeTruthy();
  });
});
