import React from 'react';
import { render } from '@testing-library/react';
import TimeframePicker from './timeframe-picker';
import { undefineds } from '../../../../tests/mockData';

describe('TimeframePicker Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<TimeframePicker />);
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
