import React from 'react';
import { render } from '@testing-library/react';
import CreateGroupExplainerContent from './create-group-explainer-content';
import { undefineds } from '../../../../tests/mockData';

describe('CreateGroupExplainerContent Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<CreateGroupExplainerContent isEnterprise={false} onClose={jest.fn} />);
    const view = baseElement.getElementsByClassName('MuiDialog-root')[0];
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
