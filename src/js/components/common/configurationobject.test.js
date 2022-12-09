import React from 'react';

import { undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import ConfigurationObject from './configurationobject';

describe('ConfigurationObject Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<ConfigurationObject config={{ uiPasswordRequired: true, foo: 'bar', timezone: 'GMT+2' }} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
