import React from 'react';
import renderer from 'react-test-renderer';
import TimerangePicker from './timerange-picker';
import { undefineds } from '../../../../tests/mockData';

let dateMock;

describe('TimerangePicker Component', () => {
  beforeEach(() => {
    const mockDate = new Date('2019-01-01T13:00:00.000Z');
    const _Date = Date;
    global.Date = jest.fn(() => mockDate);
    global.Date.parse = _Date.parse;
    global.Date.now = _Date.now;
    dateMock = jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
  });

  afterEach(() => {
    dateMock.mockRestore();
  });

  it('renders correctly', () => {
    const tree = renderer.create(<TimerangePicker />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
