import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import CreateGroupExplainer from './create-group-explainer';
import { undefineds } from '../../../../tests/mockData';

describe('CreateGroupExplainer Component', () => {
  it('renders correctly', () => {
    const tree = createMount()(<CreateGroupExplainer isEnterprise={false} onClose={jest.fn} />);
    expect(tree.html()).toMatchSnapshot();
    expect(JSON.stringify(tree.html())).toEqual(expect.not.stringMatching(undefineds));
  });
});
