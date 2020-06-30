import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import CreateGroupExplainerContent from './create-group-explainer-content';
import { undefineds } from '../../../../tests/mockData';

describe('CreateGroupExplainerContent Component', () => {
  it('renders correctly', () => {
    const tree = createMount()(<CreateGroupExplainerContent isEnterprise={false} onClose={jest.fn} />);
    expect(tree.html()).toMatchSnapshot();
    expect(JSON.stringify(tree.html())).toEqual(expect.not.stringMatching(undefineds));
  });
});
