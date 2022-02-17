import React from 'react';

import { defaultState, undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import { PhaseProgress, PhaseProgressDisplay } from './phaseprogress';

describe('PhaseProgress Component', () => {
  const deployment = defaultState.deployments.byId.d1;

  it('renders correctly', async () => {
    const { baseElement } = render(<PhaseProgress deployment={deployment} />);
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
  it('renders correctly for list usage', async () => {
    const { baseElement } = render(<PhaseProgressDisplay deployment={deployment} status="inprogress" />);
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
