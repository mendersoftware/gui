import React from 'react';

import { undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import { DEVICE_ISSUE_OPTIONS } from '../../../constants/deviceConstants';
import DeviceIssuesSelection, { EmptySelection } from './issueselection';

describe('DeviceIssuesSelection Component', () => {
  it('renders correctly', async () => {
    const options = [
      { ...DEVICE_ISSUE_OPTIONS.authRequests, count: 2 },
      { ...DEVICE_ISSUE_OPTIONS.monitoring, count: 0 },
      { ...DEVICE_ISSUE_OPTIONS.offline, count: 8 }
    ];
    const { baseElement } = render(
      <DeviceIssuesSelection onChange={jest.fn} onSelectAll={jest.fn} options={options} selection={[DEVICE_ISSUE_OPTIONS.offline.key]} />
    );
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('renders EmptySelection correctly', () => {
    const { baseElement } = render(<EmptySelection allSelected={false} emptySelection={false} onToggleClick={jest.fn} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
