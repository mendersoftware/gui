import React from 'react';

import { defaultState, undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import ProgressChart from './progressChart';

describe('ProgressChart Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<ProgressChart deployment={defaultState.deployments.byId.d2} />);
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
