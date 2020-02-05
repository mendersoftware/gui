import React from 'react';
import renderer from 'react-test-renderer';
import Review from './review';

let dateMock;

describe('Review deployment Component', () => {
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
    const release = { Name: 'test-release', device_types_compatible: [], phases: [] };
    const tree = renderer.create(<Review group="test" release={release} deploymentDeviceIds={[]} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
