import React from 'react';
import { render } from '@testing-library/react';
import TimeframePicker from './timeframe-picker';
import { undefineds } from '../../../../tests/mockData';

let dateMock = global.Date;

describe('TimeframePicker Component', () => {
  beforeEach(() => {
    const mockDate = new Date('2019-01-01T13:00:00.000Z');
    const _Date = Date;
    global.Date = jest.fn(() => mockDate);
    global.Date.parse = _Date.parse;
    global.Date.now = _Date.now;
    global.Date.getTime = _Date.getTime;
  });

  afterEach(() => {
    global.Date = dateMock;
  });

  it('renders correctly', () => {
    const { baseElement } = render(<TimeframePicker />);
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
