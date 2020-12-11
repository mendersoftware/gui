import React from 'react';
import { render } from '@testing-library/react';
import CompletedDeployments from './completeddeployments';
import { undefineds } from '../../../../../tests/mockData';

describe('CompletedDeployments Component', () => {
  it('renders correctly', () => {
    const cutoffDate = new Date('2019-01-01');
    const { baseElement } = render(<CompletedDeployments deployments={[]} cutoffDate={cutoffDate} />);
    const view = baseElement;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
