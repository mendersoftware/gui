import React from 'react';
import { render } from '@testing-library/react';
import ProgressChart from './progressChart';
import { defaultState, undefineds } from '../../../../tests/mockData';

describe('ProgressChart Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<ProgressChart deployment={defaultState.deployments.byId.d2} />);
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
