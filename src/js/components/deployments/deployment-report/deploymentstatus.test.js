import React from 'react';

import { defaultState, undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import RolloutSchedule from './rolloutschedule';

describe('RolloutSchedule Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<RolloutSchedule deployment={defaultState.deployments.byId.d2} innerRef={jest.fn} />);
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
