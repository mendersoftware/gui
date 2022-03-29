import React from 'react';

import { undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import MakeGatewayDialog from './make-gateway-dialog';

describe('CreateGroupExplainerContent Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<MakeGatewayDialog docsVersion="" onCancel={jest.fn} />);
    const view = baseElement.getElementsByClassName('MuiDialog-root')[0];
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
