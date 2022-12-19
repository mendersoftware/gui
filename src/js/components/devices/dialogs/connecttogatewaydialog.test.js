import React from 'react';

import { token, undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import ConnectToGatewayDialog from './connecttogatewaydialog';

describe('ConnectToGatewayDialog Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<ConnectToGatewayDialog gatewayIp="1.2.3.4" isPreRelease={false} docsVersion="" onCancel={jest.fn} tenantToken={token} />);
    const view = baseElement.getElementsByClassName('MuiDialog-root')[0];
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
