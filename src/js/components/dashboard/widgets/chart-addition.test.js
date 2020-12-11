import React from 'react';
import { render } from '@testing-library/react';
import ChartAdditionWidget from './chart-addition';
import { undefineds } from '../../../../../tests/mockData';

describe('ChartAdditionWidget Component', () => {
  it('renders correctly', () => {
    const { baseElement } = render(<ChartAdditionWidget />);
    const view = baseElement;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
