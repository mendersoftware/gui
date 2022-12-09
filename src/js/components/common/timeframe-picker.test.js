import React from 'react';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';

import { undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import TimeframePicker from './timeframe-picker';

describe('TimeframePicker Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <TimeframePicker />
      </LocalizationProvider>
    );
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
