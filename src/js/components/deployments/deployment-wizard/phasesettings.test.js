import React from 'react';
import renderer from 'react-test-renderer';
import PhaseSettings from './phasesettings';
import { undefineds } from '../../../../../tests/mockData';

let dateMock;

describe('PhaseSettings Component', () => {
  beforeEach(() => {
    const mockDate = new Date('2019-01-01T13:00:00.000Z');
    const _Date = Date;
    global.Date = jest.fn(() => mockDate);
    global.Date.parse = _Date.parse;
    global.Date.now = _Date.now;
    global.Date.toISOString = _Date.toISOString;
    global.Date.UTC = _Date.UTC;
    dateMock = jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
  });

  afterEach(() => {
    dateMock.mockRestore();
  });

  it('renders correctly', () => {
    const tree = renderer.create(<PhaseSettings phases={[{ batch_size: 0 }]} />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
