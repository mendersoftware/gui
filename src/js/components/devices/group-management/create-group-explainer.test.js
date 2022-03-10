import React from 'react';

import { undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import CreateGroupExplainer from './create-group-explainer';

describe('CreateGroupExplainer Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<CreateGroupExplainer isEnterprise={false} onClose={jest.fn} />);
    const view = baseElement.getElementsByClassName('MuiDialog-root')[0];
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
