import React from 'react';
import renderer from 'react-test-renderer';
import MonthlyBillingInformation from './monthlybillinginformation';

let dateMock;

describe('MonthlyBillingInformation Component', () => {
  beforeEach(() => {
    const mockDate = new Date('2019-01-01T13:00:00.000Z');
    const _Date = Date;
    global.Date = jest.fn(() => mockDate);
    global.Date.parse = _Date.parse;
    global.Date.now = _Date.now;
    global.Date.toISOString = _Date.toISOString;
    dateMock = jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
  });

  afterEach(() => {
    dateMock.mockRestore();
  });

  it('renders correctly', () => {
    const mockDate = new Date();
    const tree = renderer
      .create(
        <MonthlyBillingInformation
          billingInformation={{ interactions: [], timestamp: mockDate, total: 0 }}
          isVisible={true}
          creationDate={mockDate}
          timeframe={mockDate}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
