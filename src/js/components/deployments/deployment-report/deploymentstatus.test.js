import React from 'react';
import { render } from '@testing-library/react';
import RolloutSchedule from './rolloutschedule';
import { defaultState, undefineds } from '../../../../../tests/mockData';

describe('RolloutSchedule Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<RolloutSchedule deployment={defaultState.deployments.byId.d2} innerRef={jest.fn} />);
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
