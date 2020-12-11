import React from 'react';
import { render } from '@testing-library/react';
import CreateGroupExplainer from './create-group-explainer';
import { undefineds } from '../../../../tests/mockData';

describe('CreateGroupExplainer Component', () => {
  it('renders correctly', () => {
    const { baseElement } = render(<CreateGroupExplainer isEnterprise={false} onClose={jest.fn} />);
    const view = baseElement.getElementsByClassName('MuiDialog-root')[0];
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
